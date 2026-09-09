package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/umutungoapp/backend/internal/middleware"
)

type engagementHandler struct{ pool *pgxpool.Pool }

type commentInput struct {
	Body string `json:"body"`
}

type reportInput struct {
	ListingID      string `json:"listing_id"`
	ReportedUserID string `json:"reported_user_id"`
	Category       string `json:"category"`
	Details        string `json:"details"`
}

type bookingInput struct {
	ListingID string    `json:"listing_id"`
	CheckIn   time.Time `json:"check_in"`
	CheckOut  time.Time `json:"check_out"`
	Guests    int       `json:"guest_count"`
	Note      string    `json:"note"`
}

type bookingStatusInput struct {
	Status string `json:"status"`
}

type savedSearchInput struct {
	Name    string         `json:"name"`
	Filters map[string]any `json:"filters"`
}

type notificationPreferencesInput struct {
	PushEnabled      *bool `json:"push_enabled"`
	SMSEnabled       *bool `json:"sms_enabled"`
	EmailEnabled     *bool `json:"email_enabled"`
	MarketingEnabled *bool `json:"marketing_enabled"`
}

func (h *engagementHandler) comments(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pool.Query(r.Context(), `
		SELECT c.id, c.body, c.created_at, u.id, u.display_name
		FROM comments c JOIN users u ON u.id=c.user_id
		WHERE c.listing_id=$1 AND c.status='VISIBLE'
		ORDER BY c.created_at ASC`, chi.URLParam(r, "id"))
	if err != nil {
		jsonError(w, "could not fetch comments", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type comment struct {
		ID        string    `json:"id"`
		Body      string    `json:"body"`
		CreatedAt time.Time `json:"created_at"`
		UserID    string    `json:"user_id"`
		UserName  string    `json:"user_name"`
	}
	comments := make([]comment, 0)
	for rows.Next() {
		var item comment
		if err := rows.Scan(&item.ID, &item.Body, &item.CreatedAt, &item.UserID, &item.UserName); err != nil {
			jsonError(w, "could not read comment", http.StatusInternalServerError)
			return
		}
		comments = append(comments, item)
	}
	jsonOK(w, map[string]any{"ok": true, "comments": comments})
}

func (h *engagementHandler) addComment(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var input commentInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || strings.TrimSpace(input.Body) == "" || len([]rune(input.Body)) > 2000 {
		jsonError(w, "comment body must be between 1 and 2000 characters", http.StatusBadRequest)
		return
	}
	listingID := chi.URLParam(r, "id")
	var creatorID string
	if err := h.pool.QueryRow(r.Context(), `SELECT COALESCE(agent_id, owner_id) FROM properties WHERE id=$1 AND is_published=TRUE AND deleted_at IS NULL`, listingID).Scan(&creatorID); err != nil {
		jsonError(w, "listing not found", http.StatusNotFound)
		return
	}
	var id string
	err := h.pool.QueryRow(r.Context(), `INSERT INTO comments (listing_id,user_id,body) VALUES ($1,$2,$3) RETURNING id`, listingID, identity.ID, strings.TrimSpace(input.Body)).Scan(&id)
	if err != nil {
		jsonError(w, "could not add comment", http.StatusUnprocessableEntity)
		return
	}
	if creatorID != identity.ID {
		_ = h.notify(r.Context(), creatorID, "COMMENT", "New listing comment", "Someone commented on your listing", map[string]any{"listing_id": listingID, "comment_id": id})
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "comment_id": id})
}

func (h *engagementHandler) interaction(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	kind := strings.ToUpper(chi.URLParam(r, "kind"))
	if kind != "LIKE" && kind != "FAVORITE" {
		jsonError(w, "unsupported interaction", http.StatusBadRequest)
		return
	}
	listingID := chi.URLParam(r, "id")
	if _, err := h.pool.Exec(r.Context(), `INSERT INTO listing_interactions (listing_id,user_id,kind) SELECT id,$2,$3 FROM properties WHERE id=$1 AND is_published=TRUE AND deleted_at IS NULL ON CONFLICT DO NOTHING`, listingID, identity.ID, kind); err != nil {
		jsonError(w, "could not save interaction", http.StatusUnprocessableEntity)
		return
	}
	var count int
	_ = h.pool.QueryRow(r.Context(), `SELECT COUNT(*) FROM listing_interactions WHERE listing_id=$1 AND kind=$2`, listingID, kind).Scan(&count)
	jsonOK(w, map[string]any{"ok": true, "kind": kind, "active": true, "count": count})
}

func (h *engagementHandler) removeInteraction(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	kind := strings.ToUpper(chi.URLParam(r, "kind"))
	if kind != "LIKE" && kind != "FAVORITE" {
		jsonError(w, "unsupported interaction", http.StatusBadRequest)
		return
	}
	if _, err := h.pool.Exec(r.Context(), `DELETE FROM listing_interactions WHERE listing_id=$1 AND user_id=$2 AND kind=$3`, chi.URLParam(r, "id"), identity.ID, kind); err != nil {
		jsonError(w, "could not remove interaction", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "kind": kind, "active": false})
}

func (h *engagementHandler) interactionState(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	listingID := chi.URLParam(r, "id")
	var liked, favorite bool
	if err := h.pool.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM listing_interactions WHERE listing_id=$1 AND user_id=$2 AND kind='LIKE'), EXISTS(SELECT 1 FROM listing_interactions WHERE listing_id=$1 AND user_id=$2 AND kind='FAVORITE')`, listingID, identity.ID).Scan(&liked,&favorite); err != nil { jsonError(w,"could not fetch interaction state",http.StatusInternalServerError); return }
	var likes, favorites int
	_ = h.pool.QueryRow(r.Context(), `SELECT COUNT(*) FILTER (WHERE kind='LIKE'), COUNT(*) FILTER (WHERE kind='FAVORITE') FROM listing_interactions WHERE listing_id=$1`, listingID).Scan(&likes,&favorites)
	jsonOK(w,map[string]any{"ok":true,"liked":liked,"favorite":favorite,"likes":likes,"favorites":favorites})
}

func (h *engagementHandler) report(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var input reportInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid report body", http.StatusBadRequest)
		return
	}
	input.Category = strings.ToUpper(strings.TrimSpace(input.Category))
	validCategories := map[string]bool{"FRAUD": true, "DUPLICATE": true, "SOLD_UNAVAILABLE": true, "OFFENSIVE_CONTENT": true, "INCORRECT_INFORMATION": true, "OTHER": true}
	if !validCategories[input.Category] || (strings.TrimSpace(input.ListingID) == "" && strings.TrimSpace(input.ReportedUserID) == "") {
		jsonError(w, "a valid category and report target are required", http.StatusBadRequest)
		return
	}
	var id string
	err := h.pool.QueryRow(r.Context(), `INSERT INTO reports (reporter_id,listing_id,reported_user_id,category,details) VALUES ($1,NULLIF($2,''),NULLIF($3,''),$4,NULLIF($5,'')) RETURNING id`, identity.ID, strings.TrimSpace(input.ListingID), strings.TrimSpace(input.ReportedUserID), input.Category, strings.TrimSpace(input.Details)).Scan(&id)
	if err != nil {
		jsonError(w, "could not submit report", http.StatusUnprocessableEntity)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "report_id": id})
}

func (h *engagementHandler) notifications(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	rows, err := h.pool.Query(r.Context(), `SELECT id,kind,title,body,data,read_at,created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`, identity.ID)
	if err != nil {
		jsonError(w, "could not fetch notifications", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type notification struct {
		ID        string          `json:"id"`
		Kind      string          `json:"kind"`
		Title     string          `json:"title"`
		Body      string          `json:"body"`
		Data      json.RawMessage `json:"data"`
		ReadAt    *time.Time      `json:"read_at,omitempty"`
		CreatedAt time.Time       `json:"created_at"`
	}
	items := make([]notification, 0)
	unread := 0
	for rows.Next() {
		var item notification
		if err := rows.Scan(&item.ID, &item.Kind, &item.Title, &item.Body, &item.Data, &item.ReadAt, &item.CreatedAt); err != nil {
			jsonError(w, "could not read notification", http.StatusInternalServerError)
			return
		}
		if item.ReadAt == nil {
			unread++
		}
		items = append(items, item)
	}
	jsonOK(w, map[string]any{"ok": true, "notifications": items, "unread_count": unread})
}

func (h *engagementHandler) markNotificationRead(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	result, err := h.pool.Exec(r.Context(), `UPDATE notifications SET read_at=COALESCE(read_at,NOW()) WHERE id=$1 AND user_id=$2`, chi.URLParam(r, "id"), identity.ID)
	if err != nil {
		jsonError(w, "could not update notification", http.StatusInternalServerError)
		return
	}
	if result.RowsAffected() == 0 {
		jsonError(w, "notification not found", http.StatusNotFound)
		return
	}
	jsonOK(w, map[string]any{"ok": true})
}

func (h *engagementHandler) notificationPreferences(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var push, sms, email, marketing bool
	err := h.pool.QueryRow(r.Context(), `SELECT push_enabled,sms_enabled,email_enabled,marketing_enabled FROM notification_preferences WHERE user_id=$1`, identity.ID).Scan(&push, &sms, &email, &marketing)
	if err == pgx.ErrNoRows {
		push, sms, email = true, true, true
		marketing = false
	}
	if err != nil && err != pgx.ErrNoRows {
		jsonError(w, "could not fetch notification preferences", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "preferences": map[string]bool{"push_enabled": push, "sms_enabled": sms, "email_enabled": email, "marketing_enabled": marketing}})
}

func (h *engagementHandler) updateNotificationPreferences(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var input notificationPreferencesInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid notification preferences", http.StatusBadRequest)
		return
	}
	push, sms, email, marketing := true, true, true, false
	if input.PushEnabled != nil {
		push = *input.PushEnabled
	}
	if input.SMSEnabled != nil {
		sms = *input.SMSEnabled
	}
	if input.EmailEnabled != nil {
		email = *input.EmailEnabled
	}
	if input.MarketingEnabled != nil {
		marketing = *input.MarketingEnabled
	}
	_, err := h.pool.Exec(r.Context(), `INSERT INTO notification_preferences (user_id,push_enabled,sms_enabled,email_enabled,marketing_enabled) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id) DO UPDATE SET push_enabled=EXCLUDED.push_enabled,sms_enabled=EXCLUDED.sms_enabled,email_enabled=EXCLUDED.email_enabled,marketing_enabled=EXCLUDED.marketing_enabled,updated_at=NOW()`, identity.ID, push, sms, email, marketing)
	if err != nil {
		jsonError(w, "could not update notification preferences", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "preferences": map[string]bool{"push_enabled": push, "sms_enabled": sms, "email_enabled": email, "marketing_enabled": marketing}})
}

func (h *engagementHandler) createBooking(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var input bookingInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || input.CheckIn.IsZero() || input.CheckOut.IsZero() || input.Guests < 1 || !input.CheckOut.After(input.CheckIn) {
		jsonError(w, "check-in, check-out, and guest count are required", http.StatusBadRequest)
		return
	}
	var hostID string
	if err := h.pool.QueryRow(r.Context(), `SELECT COALESCE(agent_id,owner_id) FROM properties WHERE id=$1 AND listing_type='BOOK' AND is_published=TRUE AND deleted_at IS NULL AND availability_status='AVAILABLE'`, input.ListingID).Scan(&hostID); err != nil {
		jsonError(w, "hospitality listing not found", http.StatusNotFound)
		return
	}
	if hostID == identity.ID {
		jsonError(w, "you cannot book your own listing", http.StatusBadRequest)
		return
	}
	var id string
	err := h.pool.QueryRow(r.Context(), `INSERT INTO bookings (listing_id,client_id,host_id,check_in,check_out,guest_count,note) VALUES ($1,$2,$3,$4,$5,$6,NULLIF($7,'')) RETURNING id`, input.ListingID, identity.ID, hostID, input.CheckIn, input.CheckOut, input.Guests, strings.TrimSpace(input.Note)).Scan(&id)
	if err != nil {
		jsonError(w, "could not request booking", http.StatusUnprocessableEntity)
		return
	}
	_ = h.notify(r.Context(), hostID, "BOOKING_REQUESTED", "New booking request", "A client requested a stay", map[string]any{"booking_id": id})
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "booking_id": id, "status": "REQUESTED"})
}

func (h *engagementHandler) updateBookingStatus(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var input bookingStatusInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid booking status", http.StatusBadRequest)
		return
	}
	input.Status = strings.ToUpper(strings.TrimSpace(input.Status))
	valid := map[string]bool{"CONFIRMED": true, "DECLINED": true, "CANCELLED": true, "COMPLETED": true}
	if !valid[input.Status] {
		jsonError(w, "unsupported booking status", http.StatusBadRequest)
		return
	}
	var clientID, hostID, current string
	err := h.pool.QueryRow(r.Context(), `SELECT client_id,host_id,status FROM bookings WHERE id=$1`, chi.URLParam(r, "id")).Scan(&clientID, &hostID, &current)
	if err == pgx.ErrNoRows {
		jsonError(w, "booking not found", http.StatusNotFound)
		return
	}
	if err != nil {
		jsonError(w, "could not load booking", http.StatusInternalServerError)
		return
	}
	if identity.ID != clientID && identity.ID != hostID {
		jsonError(w, "booking access denied", http.StatusForbidden)
		return
	}
	if identity.ID == clientID && input.Status != "CANCELLED" {
		jsonError(w, "clients can only cancel booking requests", http.StatusForbidden)
		return
	}
	if identity.ID == hostID && input.Status == "CANCELLED" {
		jsonError(w, "hosts cannot cancel a client booking", http.StatusForbidden)
		return
	}
	if current == "DECLINED" || current == "CANCELLED" || current == "COMPLETED" {
		jsonError(w, "booking is already final", http.StatusConflict)
		return
	}
	result, err := h.pool.Exec(r.Context(), `UPDATE bookings SET status=$1,updated_at=NOW() WHERE id=$2`, input.Status, chi.URLParam(r, "id"))
	if err != nil || result.RowsAffected() != 1 {
		jsonError(w, "could not update booking", http.StatusInternalServerError)
		return
	}
	target := clientID
	if identity.ID == clientID {
		target = hostID
	}
	_ = h.notify(r.Context(), target, "BOOKING_STATUS", "Booking status updated", "Your booking status is now "+input.Status, map[string]any{"booking_id": chi.URLParam(r, "id"), "status": input.Status})
	jsonOK(w, map[string]any{"ok": true, "status": input.Status})
}

func (h *engagementHandler) savedSearches(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	rows, err := h.pool.Query(r.Context(), `SELECT id,name,filters,is_active,created_at,updated_at FROM saved_searches WHERE user_id=$1 ORDER BY created_at DESC`, identity.ID)
	if err != nil {
		jsonError(w, "could not fetch saved searches", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type savedSearch struct {
		ID        string          `json:"id"`
		Name      string          `json:"name"`
		Filters   json.RawMessage `json:"filters"`
		Active    bool            `json:"is_active"`
		CreatedAt time.Time       `json:"created_at"`
		UpdatedAt time.Time       `json:"updated_at"`
	}
	items := make([]savedSearch, 0)
	for rows.Next() {
		var item savedSearch
		if err := rows.Scan(&item.ID, &item.Name, &item.Filters, &item.Active, &item.CreatedAt, &item.UpdatedAt); err != nil {
			jsonError(w, "could not read saved search", http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}
	jsonOK(w, map[string]any{"ok": true, "saved_searches": items})
}

func (h *engagementHandler) createSavedSearch(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var input savedSearchInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || strings.TrimSpace(input.Name) == "" || len(input.Name) > 120 || input.Filters == nil {
		jsonError(w, "name and filters are required", http.StatusBadRequest)
		return
	}
	filters, err := json.Marshal(input.Filters)
	if err != nil {
		jsonError(w, "invalid search filters", http.StatusBadRequest)
		return
	}
	var id string
	if err := h.pool.QueryRow(r.Context(), `INSERT INTO saved_searches (user_id,name,filters) VALUES ($1,$2,$3) RETURNING id`, identity.ID, strings.TrimSpace(input.Name), filters).Scan(&id); err != nil {
		jsonError(w, "could not save search", http.StatusUnprocessableEntity)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "saved_search_id": id})
}

func (h *engagementHandler) deleteSavedSearch(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	result, err := h.pool.Exec(r.Context(), `DELETE FROM saved_searches WHERE id=$1 AND user_id=$2`, chi.URLParam(r, "id"), identity.ID)
	if err != nil {
		jsonError(w, "could not delete saved search", http.StatusInternalServerError)
		return
	}
	if result.RowsAffected() == 0 {
		jsonError(w, "saved search not found", http.StatusNotFound)
		return
	}
	jsonOK(w, map[string]any{"ok": true})
}

func (h *engagementHandler) notify(ctx context.Context, userID, kind, title, body string, data map[string]any) error {
	encoded, err := json.Marshal(data)
	if err != nil {
		return err
	}
	_, err = h.pool.Exec(ctx, `INSERT INTO notifications (user_id,kind,title,body,data) VALUES ($1,$2,$3,$4,$5)`, userID, kind, title, body, encoded)
	return err
}
