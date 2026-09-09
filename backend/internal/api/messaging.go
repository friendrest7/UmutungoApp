package api

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/umutungoapp/backend/internal/middleware"
)

type messagingHandler struct{ pool *pgxpool.Pool }

type startConversationInput struct {
	ListingID string `json:"listing_id"`
}

type messageInput struct {
	Body string `json:"body"`
}

func (h *messagingHandler) start(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var input startConversationInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || strings.TrimSpace(input.ListingID) == "" {
		jsonError(w, "listing_id is required", http.StatusBadRequest)
		return
	}
	var recipientID string
	err := h.pool.QueryRow(r.Context(), `
		SELECT COALESCE(agent_id, owner_id)
		FROM properties
		WHERE id=$1 AND is_published=TRUE AND deleted_at IS NULL
	`, input.ListingID).Scan(&recipientID)
	if err != nil {
		jsonError(w, "listing not found", http.StatusNotFound)
		return
	}
	if recipientID == identity.ID {
		jsonError(w, "you cannot message yourself", http.StatusBadRequest)
		return
	}
	var conversationID string
	err = h.pool.QueryRow(r.Context(), `
		INSERT INTO conversations (participant_a_id, participant_b_id, property_id)
		VALUES (LEAST($1::uuid,$2::uuid), GREATEST($1::uuid,$2::uuid), $3::uuid)
		ON CONFLICT (participant_a_id, participant_b_id, property_id) WHERE property_id IS NOT NULL
		DO UPDATE SET last_message_at=conversations.last_message_at
		RETURNING id
	`, identity.ID, recipientID, input.ListingID).Scan(&conversationID)
	if err != nil {
		jsonError(w, "could not start conversation", http.StatusUnprocessableEntity)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "conversation_id": conversationID, "recipient_id": recipientID})
}

func (h *messagingHandler) list(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	rows, err := h.pool.Query(r.Context(), `
		SELECT c.id, c.property_id, COALESCE(p.title,''),
		       other.id, other.display_name, other.avatar_url,
		       COALESCE(last_message.body,''), last_message.created_at,
		       COALESCE(unread.unread_count,0)
		FROM conversations c
		JOIN users other ON other.id = CASE WHEN c.participant_a_id=$1 THEN c.participant_b_id ELSE c.participant_a_id END
		LEFT JOIN properties p ON p.id=c.property_id
		LEFT JOIN LATERAL (
			SELECT body, created_at FROM messages WHERE conversation_id=c.id ORDER BY created_at DESC LIMIT 1
		) last_message ON TRUE
		LEFT JOIN LATERAL (
			SELECT COUNT(*) AS unread_count FROM messages WHERE conversation_id=c.id AND sender_id <> $1 AND is_read=FALSE
		) unread ON TRUE
		WHERE c.participant_a_id=$1 OR c.participant_b_id=$1
		ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
		LIMIT 100`, identity.ID)
	if err != nil {
		jsonError(w, "could not fetch conversations", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type conversation struct {
		ID             string     `json:"id"`
		PropertyID     *string    `json:"property_id,omitempty"`
		PropertyTitle  string     `json:"property_title"`
		OtherUserID    string     `json:"other_user_id"`
		OtherUserName  string     `json:"other_user_name"`
		OtherAvatarURL *string    `json:"other_avatar_url,omitempty"`
		LastMessage    string     `json:"last_message"`
		LastMessageAt  *time.Time `json:"last_message_at,omitempty"`
		UnreadCount    int        `json:"unread_count"`
	}
	items := make([]conversation, 0)
	for rows.Next() {
		var item conversation
		if err := rows.Scan(&item.ID, &item.PropertyID, &item.PropertyTitle, &item.OtherUserID, &item.OtherUserName, &item.OtherAvatarURL, &item.LastMessage, &item.LastMessageAt, &item.UnreadCount); err != nil {
			jsonError(w, "could not read conversation", http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}
	jsonOK(w, map[string]any{"ok": true, "conversations": items})
}

func (h *messagingHandler) messages(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	conversationID := chi.URLParam(r, "id")
	if !h.isParticipant(r, conversationID, identity.ID) {
		jsonError(w, "conversation access denied", http.StatusForbidden)
		return
	}
	_, _ = h.pool.Exec(r.Context(), `UPDATE messages SET is_read=TRUE WHERE conversation_id=$1 AND sender_id<>$2`, conversationID, identity.ID)
	rows, err := h.pool.Query(r.Context(), `SELECT m.id,m.sender_id,u.display_name,m.body,m.created_at,m.is_read FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.conversation_id=$1 ORDER BY m.created_at ASC LIMIT 200`, conversationID)
	if err != nil {
		jsonError(w, "could not fetch messages", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type message struct {
		ID         string    `json:"id"`
		SenderID   string    `json:"sender_id"`
		SenderName string    `json:"sender_name"`
		Body       string    `json:"body"`
		CreatedAt  time.Time `json:"created_at"`
		IsRead     bool      `json:"is_read"`
	}
	items := make([]message, 0)
	for rows.Next() {
		var item message
		if err := rows.Scan(&item.ID, &item.SenderID, &item.SenderName, &item.Body, &item.CreatedAt, &item.IsRead); err != nil {
			jsonError(w, "could not read message", http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}
	jsonOK(w, map[string]any{"ok": true, "messages": items})
}

func (h *messagingHandler) send(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	conversationID := chi.URLParam(r, "id")
	if !h.isParticipant(r, conversationID, identity.ID) {
		jsonError(w, "conversation access denied", http.StatusForbidden)
		return
	}
	var input messageInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || strings.TrimSpace(input.Body) == "" || len([]rune(input.Body)) > 4000 {
		jsonError(w, "message body must be between 1 and 4000 characters", http.StatusBadRequest)
		return
	}
	var recipientID string
	if err := h.pool.QueryRow(r.Context(), `SELECT CASE WHEN participant_a_id=$1 THEN participant_b_id ELSE participant_a_id END FROM conversations WHERE id=$2`, identity.ID, conversationID).Scan(&recipientID); err != nil {
		jsonError(w, "conversation not found", http.StatusNotFound)
		return
	}
	var messageID string
	err := h.pool.QueryRow(r.Context(), `INSERT INTO messages (conversation_id,sender_id,body) VALUES ($1,$2,$3) RETURNING id`, conversationID, identity.ID, strings.TrimSpace(input.Body)).Scan(&messageID)
	if err != nil {
		jsonError(w, "could not send message", http.StatusUnprocessableEntity)
		return
	}
	_, _ = h.pool.Exec(r.Context(), `UPDATE conversations SET last_message_at=NOW() WHERE id=$1`, conversationID)
	_ = (&engagementHandler{pool: h.pool}).notify(r.Context(), recipientID, "MESSAGE", "New message", "You have a new message", map[string]any{"conversation_id": conversationID, "message_id": messageID})
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "message_id": messageID})
}

func (h *messagingHandler) isParticipant(r *http.Request, conversationID, userID string) bool {
	var allowed bool
	_ = h.pool.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM conversations WHERE id=$1 AND (participant_a_id=$2 OR participant_b_id=$2))`, conversationID, userID).Scan(&allowed)
	return allowed
}

func (h *messagingHandler) unreadCount(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var count int
	err := h.pool.QueryRow(r.Context(), `SELECT COUNT(*) FROM messages m JOIN conversations c ON c.id=m.conversation_id WHERE (c.participant_a_id=$1 OR c.participant_b_id=$1) AND m.sender_id<>$1 AND m.is_read=FALSE`, identity.ID).Scan(&count)
	if err != nil {
		jsonError(w, "could not fetch message count", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "unread_count": count})
}
