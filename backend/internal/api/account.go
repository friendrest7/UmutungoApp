package api

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/inzuhub/backend/internal/middleware"
)

type accountHandler struct{ pool *pgxpool.Pool }

type accountProfile struct {
	ID                 string    `json:"id"`
	Email              string    `json:"email"`
	Phone              *string   `json:"phone,omitempty"`
	PhoneVerified      bool      `json:"phone_verified"`
	DisplayName        string    `json:"display_name"`
	AvatarURL          *string   `json:"avatar_url,omitempty"`
	Bio                *string   `json:"bio,omitempty"`
	Role               string    `json:"role"`
	IsActive           bool      `json:"is_active"`
	VerificationStatus string    `json:"verification_status"`
	CreatedAt          time.Time `json:"created_at"`
}

func (h *accountHandler) get(w http.ResponseWriter, r *http.Request) {
	identity, ok := middleware.CurrentUser(r.Context())
	if !ok {
		jsonError(w, "authentication required", http.StatusUnauthorized)
		return
	}
	var profile accountProfile
	err := h.pool.QueryRow(r.Context(), `
		SELECT id, email, phone, phone_verified, display_name, avatar_url, bio, role,
		       is_active, verification_status, created_at
		FROM users WHERE id=$1`, identity.ID).Scan(
		&profile.ID, &profile.Email, &profile.Phone, &profile.PhoneVerified,
		&profile.DisplayName, &profile.AvatarURL, &profile.Bio, &profile.Role,
		&profile.IsActive, &profile.VerificationStatus, &profile.CreatedAt,
	)
	if err != nil {
		jsonError(w, "account not found", http.StatusNotFound)
		return
	}

	var kycStatus *string
	_ = h.pool.QueryRow(r.Context(), `
		SELECT status FROM kyc_submissions WHERE user_id=$1 ORDER BY submitted_at DESC LIMIT 1`, identity.ID).Scan(&kycStatus)

	var activeListings, expiredListings, scheduledListings, favorites int
	_ = h.pool.QueryRow(r.Context(), `SELECT COUNT(*) FILTER (WHERE is_published=TRUE AND (expires_at IS NULL OR expires_at > NOW())), COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at <= NOW()), COUNT(*) FILTER (WHERE scheduled_for IS NOT NULL AND scheduled_for > NOW()), 0 FROM properties WHERE (owner_id=$1 OR agent_id=$1) AND deleted_at IS NULL`, identity.ID).Scan(&activeListings, &expiredListings, &scheduledListings, new(int))
	_ = h.pool.QueryRow(r.Context(), `SELECT COUNT(*) FROM listing_interactions WHERE user_id=$1 AND kind='FAVORITE'`, identity.ID).Scan(&favorites)
	jsonOK(w, map[string]any{
		"ok": true, "profile": profile, "kyc_status": kycStatus,
		"summary": map[string]int{"active_listings": activeListings, "expired_listings": expiredListings, "scheduled_listings": scheduledListings, "favorites": favorites},
	})
}

type updateAccountRequest struct {
	DisplayName string  `json:"display_name"`
	Bio         *string `json:"bio"`
	AvatarURL   *string `json:"avatar_url"`
}

func (h *accountHandler) update(w http.ResponseWriter, r *http.Request) {
	identity, ok := middleware.CurrentUser(r.Context())
	if !ok {
		jsonError(w, "authentication required", http.StatusUnauthorized)
		return
	}
	var input updateAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	input.DisplayName = strings.TrimSpace(input.DisplayName)
	if input.DisplayName == "" || len(input.DisplayName) > 160 {
		jsonError(w, "display_name is required and must be at most 160 characters", http.StatusBadRequest)
		return
	}
	if input.Bio != nil {
		value := strings.TrimSpace(*input.Bio)
		if len(value) > 2000 {
			jsonError(w, "bio must be at most 2000 characters", http.StatusBadRequest)
			return
		}
		input.Bio = &value
	}
	if input.AvatarURL != nil {
		value := strings.TrimSpace(*input.AvatarURL)
		if value != "" && len(value) > 2048 {
			jsonError(w, "avatar_url is too long", http.StatusBadRequest)
			return
		}
		input.AvatarURL = &value
	}
	_, err := h.pool.Exec(r.Context(), `
		UPDATE users SET display_name=$1, bio=COALESCE($2,bio), avatar_url=COALESCE($3,avatar_url), updated_at=NOW() WHERE id=$4`,
		input.DisplayName, input.Bio, input.AvatarURL, identity.ID)
	if err != nil {
		jsonError(w, "could not update account", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true})
}

func (h *accountHandler) favorites(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	rows, err := h.pool.Query(r.Context(), `
		SELECT p.id,p.title,p.property_type,p.listing_type,p.rental_price,p.currency,p.district,pi.url
		FROM listing_interactions i JOIN properties p ON p.id=i.listing_id
		LEFT JOIN property_images pi ON pi.property_id=p.id AND pi.is_cover=TRUE
		WHERE i.user_id=$1 AND i.kind='FAVORITE' AND p.deleted_at IS NULL
		ORDER BY i.created_at DESC`, identity.ID)
	if err != nil {
		jsonError(w, "could not fetch favorites", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type favorite struct {
		ID            string  `json:"id"`
		Title         string  `json:"title"`
		PropertyType  string  `json:"property_type"`
		ListingType   string  `json:"listing_type"`
		Price         float64 `json:"price"`
		Currency      string  `json:"currency"`
		District      string  `json:"district"`
		CoverImageURL *string `json:"cover_image_url,omitempty"`
	}
	items := make([]favorite, 0)
	for rows.Next() {
		var item favorite
		if err := rows.Scan(&item.ID, &item.Title, &item.PropertyType, &item.ListingType, &item.Price, &item.Currency, &item.District, &item.CoverImageURL); err != nil {
			jsonError(w, "could not read favorite", http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}
	jsonOK(w, map[string]any{"ok": true, "favorites": items})
}

type roleUpgradeRequest struct {
	RequestedRole string `json:"requested_role"`
	Reason        string `json:"reason"`
}

func (h *accountHandler) requestRoleUpgrade(w http.ResponseWriter, r *http.Request) {
	identity, ok := middleware.CurrentUser(r.Context())
	if !ok {
		jsonError(w, "authentication required", http.StatusUnauthorized)
		return
	}
	var input roleUpgradeRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	input.RequestedRole = strings.ToUpper(strings.TrimSpace(input.RequestedRole))
	if input.RequestedRole != "OWNER" && input.RequestedRole != "AGENT" {
		jsonError(w, "requested_role must be OWNER or AGENT", http.StatusBadRequest)
		return
	}
	var id string
	err := h.pool.QueryRow(r.Context(), `
		INSERT INTO role_upgrade_requests (user_id, requested_role, reason)
		VALUES ($1,$2,$3) RETURNING id`, identity.ID, input.RequestedRole, nullableText(input.Reason)).Scan(&id)
	if err != nil {
		jsonError(w, "an upgrade request is already pending or could not be created", http.StatusConflict)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "request_id": id, "status": "PENDING"})
}

type kycDocumentInput struct {
	StorageKey   string `json:"storage_key"`
	OriginalName string `json:"original_name"`
	MimeType     string `json:"mime_type"`
	ByteSize     int64  `json:"byte_size"`
}

type kycSubmitRequest struct {
	DocumentType      string             `json:"document_type"`
	DocumentReference string             `json:"document_reference"`
	PhysicalAddress   string             `json:"physical_address"`
	Documents         []kycDocumentInput `json:"documents"`
}

func (h *accountHandler) submitKYC(w http.ResponseWriter, r *http.Request) {
	identity, ok := middleware.CurrentUser(r.Context())
	if !ok {
		jsonError(w, "authentication required", http.StatusUnauthorized)
		return
	}
	var input kycSubmitRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	input.DocumentType = strings.ToUpper(strings.TrimSpace(input.DocumentType))
	input.PhysicalAddress = strings.TrimSpace(input.PhysicalAddress)
	if input.DocumentType != "NATIONAL_ID" && input.DocumentType != "RDB_BUSINESS_REGISTRATION" && input.DocumentType != "OTHER_CONFIGURED" {
		jsonError(w, "unsupported document_type", http.StatusBadRequest)
		return
	}
	if len(input.PhysicalAddress) < 5 {
		jsonError(w, "physical_address is required", http.StatusBadRequest)
		return
	}
	if len(input.Documents) == 0 {
		jsonError(w, "at least one private document storage key is required", http.StatusBadRequest)
		return
	}
	for _, document := range input.Documents {
		if strings.TrimSpace(document.StorageKey) == "" || document.ByteSize <= 0 || document.ByteSize > 10*1024*1024 {
			jsonError(w, "each document requires a valid storage_key and size up to 10MB", http.StatusBadRequest)
			return
		}
		if document.MimeType != "application/pdf" && document.MimeType != "image/jpeg" && document.MimeType != "image/png" {
			jsonError(w, "KYC documents must be PDF, JPEG, or PNG", http.StatusBadRequest)
			return
		}
	}

	tx, err := h.pool.Begin(r.Context())
	if err != nil {
		jsonError(w, "could not start KYC submission", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())
	var submissionID string
	err = tx.QueryRow(r.Context(), `
		INSERT INTO kyc_submissions (user_id, document_type, document_reference, physical_address)
		VALUES ($1,$2,$3,$4) RETURNING id`, identity.ID, input.DocumentType, nullableText(input.DocumentReference), input.PhysicalAddress).Scan(&submissionID)
	if err != nil {
		jsonError(w, "could not create KYC submission", http.StatusConflict)
		return
	}
	for _, document := range input.Documents {
		_, err = tx.Exec(r.Context(), `
			INSERT INTO kyc_documents (submission_id, storage_key, original_name, mime_type, byte_size)
			VALUES ($1,$2,$3,$4,$5)`, submissionID, strings.TrimSpace(document.StorageKey), nullableText(document.OriginalName), document.MimeType, document.ByteSize)
		if err != nil {
			jsonError(w, "could not save KYC document metadata", http.StatusUnprocessableEntity)
			return
		}
	}
	if _, err = tx.Exec(r.Context(), `UPDATE users SET verification_status='PENDING', updated_at=NOW() WHERE id=$1`, identity.ID); err != nil {
		jsonError(w, "could not update verification status", http.StatusInternalServerError)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		jsonError(w, "could not save KYC submission", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "submission_id": submissionID, "status": "PENDING"})
}

func (h *accountHandler) listKYC(w http.ResponseWriter, r *http.Request) {
	identity, ok := middleware.CurrentUser(r.Context())
	if !ok {
		jsonError(w, "authentication required", http.StatusUnauthorized)
		return
	}
	rows, err := h.pool.Query(r.Context(), `
		SELECT id, document_type, document_reference, physical_address, status, submitted_at, reviewed_at, review_reason
		FROM kyc_submissions WHERE user_id=$1 ORDER BY submitted_at DESC`, identity.ID)
	if err != nil {
		jsonError(w, "could not fetch KYC submissions", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type row struct {
		ID                string     `json:"id"`
		DocumentType      string     `json:"document_type"`
		DocumentReference *string    `json:"document_reference,omitempty"`
		PhysicalAddress   string     `json:"physical_address"`
		Status            string     `json:"status"`
		SubmittedAt       time.Time  `json:"submitted_at"`
		ReviewedAt        *time.Time `json:"reviewed_at,omitempty"`
		ReviewReason      *string    `json:"review_reason,omitempty"`
	}
	items := make([]row, 0)
	for rows.Next() {
		var item row
		if err := rows.Scan(&item.ID, &item.DocumentType, &item.DocumentReference, &item.PhysicalAddress, &item.Status, &item.SubmittedAt, &item.ReviewedAt, &item.ReviewReason); err != nil {
			jsonError(w, "could not read KYC submission", http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}
	jsonOK(w, map[string]any{"ok": true, "submissions": items})
}

func (h *accountHandler) support(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var input struct {
		Email   string `json:"email"`
		Subject string `json:"subject"`
		Message string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	input.Email, input.Subject, input.Message = strings.TrimSpace(input.Email), strings.TrimSpace(input.Subject), strings.TrimSpace(input.Message)
	if input.Subject == "" || len(input.Subject) > 200 || input.Message == "" || len(input.Message) > 5000 {
		jsonError(w, "subject and message are required", http.StatusBadRequest)
		return
	}
	var userID any
	if identity.ID != "" {
		userID = identity.ID
	}
	var id string
	if err := h.pool.QueryRow(r.Context(), `INSERT INTO support_requests (user_id, email, subject, message) VALUES ($1,$2,$3,$4) RETURNING id`, userID, nullableText(input.Email), input.Subject, input.Message).Scan(&id); err != nil {
		jsonError(w, "could not create support request", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "request_id": id})
}

func accountRoutes(r chi.Router, h *accountHandler) {
	r.Get("/account", h.get)
	r.Patch("/account", h.update)
	r.Get("/account/favorites", h.favorites)
	r.Post("/account/role-requests", h.requestRoleUpgrade)
	r.Get("/account/kyc", h.listKYC)
	r.Post("/account/kyc", h.submitKYC)
	r.Post("/support", h.support)
}
