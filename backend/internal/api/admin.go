package api

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/umutungoapp/backend/internal/middleware"
)

type adminHandler struct{ pool *pgxpool.Pool }

func (h *adminHandler) summary(w http.ResponseWriter, r *http.Request) {
	var users, owners, agents, tenants, properties, published, pendingViewings int
	err := h.pool.QueryRow(r.Context(), `
		SELECT
			(SELECT COUNT(*) FROM users),
			(SELECT COUNT(*) FROM users WHERE role='OWNER'),
			(SELECT COUNT(*) FROM users WHERE role='AGENT'),
			(SELECT COUNT(*) FROM users WHERE role='TENANT'),
			(SELECT COUNT(*) FROM properties),
			(SELECT COUNT(*) FROM properties WHERE is_published=TRUE),
			(SELECT COUNT(*) FROM viewings WHERE status='PENDING')
	`).Scan(&users, &owners, &agents, &tenants, &properties, &published, &pendingViewings)
	if err != nil {
		jsonError(w, "could not fetch admin summary", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "summary": map[string]int{
		"users": users, "owners": owners, "agents": agents, "tenants": tenants,
		"properties": properties, "published_properties": published, "pending_viewings": pendingViewings,
	}})
}

func (h *adminHandler) users(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pool.Query(r.Context(), `SELECT id, email, display_name, role, is_active, created_at FROM users ORDER BY created_at DESC`)
	if err != nil {
		jsonError(w, "could not fetch users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type userRow struct {
		ID          string `json:"id"`
		Email       string `json:"email"`
		DisplayName string `json:"display_name"`
		Role        string `json:"role"`
		Active      bool   `json:"is_active"`
	}
	users := make([]userRow, 0)
	for rows.Next() {
		var user userRow
		var createdAt any
		if err := rows.Scan(&user.ID, &user.Email, &user.DisplayName, &user.Role, &user.Active, &createdAt); err != nil {
			jsonError(w, "could not read user", http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}
	jsonOK(w, map[string]any{"ok": true, "users": users})
}

type kycQueueRow struct {
	ID              string    `json:"id"`
	UserID          string    `json:"user_id"`
	DisplayName     string    `json:"display_name"`
	Email           string    `json:"email"`
	RequestedRole   string    `json:"requested_role,omitempty"`
	DocumentType    string    `json:"document_type"`
	PhysicalAddress string    `json:"physical_address"`
	Status          string    `json:"status"`
	SubmittedAt     time.Time `json:"submitted_at"`
}

func (h *adminHandler) kycQueue(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pool.Query(r.Context(), `
		SELECT k.id, k.user_id, u.display_name, u.email, COALESCE(req.requested_role, ''),
		       k.document_type, k.physical_address, k.status, k.submitted_at
		FROM kyc_submissions k
		JOIN users u ON u.id = k.user_id
		LEFT JOIN LATERAL (
			SELECT requested_role FROM role_upgrade_requests
			WHERE user_id = k.user_id AND status = 'PENDING'
			ORDER BY created_at DESC LIMIT 1
		) req ON TRUE
		WHERE ($1 = '' OR k.status = $1)
		ORDER BY k.submitted_at ASC`, strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("status"))))
	if err != nil {
		jsonError(w, "could not fetch KYC queue", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	items := make([]kycQueueRow, 0)
	for rows.Next() {
		var item kycQueueRow
		if err := rows.Scan(&item.ID, &item.UserID, &item.DisplayName, &item.Email, &item.RequestedRole,
			&item.DocumentType, &item.PhysicalAddress, &item.Status, &item.SubmittedAt); err != nil {
			jsonError(w, "could not read KYC queue item", http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}
	jsonOK(w, map[string]any{"ok": true, "submissions": items})
}

func (h *adminHandler) roleRequests(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pool.Query(r.Context(), `SELECT rr.id,rr.user_id,u.display_name,u.email,rr.requested_role,rr.status,COALESCE(rr.reason,''),rr.created_at FROM role_upgrade_requests rr JOIN users u ON u.id=rr.user_id WHERE ($1='' OR rr.status=$1) ORDER BY rr.created_at ASC`, strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("status"))))
	if err != nil {
		jsonError(w, "could not fetch role requests", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type roleRequest struct {
		ID            string    `json:"id"`
		UserID        string    `json:"user_id"`
		UserName      string    `json:"user_name"`
		Email         string    `json:"email"`
		RequestedRole string    `json:"requested_role"`
		Status        string    `json:"status"`
		Reason        string    `json:"reason"`
		CreatedAt     time.Time `json:"created_at"`
	}
	items := make([]roleRequest, 0)
	for rows.Next() {
		var item roleRequest
		if err := rows.Scan(&item.ID, &item.UserID, &item.UserName, &item.Email, &item.RequestedRole, &item.Status, &item.Reason, &item.CreatedAt); err != nil {
			jsonError(w, "could not read role request", http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}
	jsonOK(w, map[string]any{"ok": true, "requests": items})
}

type roleRequestReview struct {
	Status string `json:"status"`
	Reason string `json:"reason"`
}

func (h *adminHandler) reviewRoleRequest(w http.ResponseWriter, r *http.Request) {
	admin, _ := middleware.CurrentUser(r.Context())
	var input roleRequestReview
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid role request review", http.StatusBadRequest)
		return
	}
	input.Status = strings.ToUpper(strings.TrimSpace(input.Status))
	if input.Status != "APPROVED" && input.Status != "REJECTED" && input.Status != "MORE_INFO" {
		jsonError(w, "unsupported role request status", http.StatusBadRequest)
		return
	}
	tx, err := h.pool.Begin(r.Context())
	if err != nil {
		jsonError(w, "could not start review", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())
	var userID, requestedRole string
	var before []byte
	err = tx.QueryRow(r.Context(), `SELECT user_id,requested_role,jsonb_build_object('status',status,'role',(SELECT role FROM users WHERE id=role_upgrade_requests.user_id)) FROM role_upgrade_requests WHERE id=$1 FOR UPDATE`, chi.URLParam(r, "id")).Scan(&userID, &requestedRole, &before)
	if err == pgx.ErrNoRows {
		jsonError(w, "role request not found", http.StatusNotFound)
		return
	}
	if err != nil {
		jsonError(w, "could not load role request", http.StatusInternalServerError)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE role_upgrade_requests SET status=$1,reviewed_by=$2,reviewed_at=NOW(),reason=COALESCE(NULLIF($3,''),reason),updated_at=NOW() WHERE id=$4`, input.Status, admin.ID, strings.TrimSpace(input.Reason), chi.URLParam(r, "id")); err != nil {
		jsonError(w, "could not review role request", http.StatusInternalServerError)
		return
	}
	if input.Status == "APPROVED" {
		if _, err = tx.Exec(r.Context(), `UPDATE users SET role=$1,updated_at=NOW() WHERE id=$2`, requestedRole, userID); err != nil {
			jsonError(w, "could not apply role upgrade", http.StatusInternalServerError)
			return
		}
	}
	after, _ := json.Marshal(map[string]any{"status": input.Status, "role": requestedRole})
	if _, err = tx.Exec(r.Context(), `INSERT INTO audit_logs (actor_id,action,resource_type,resource_id,before_state,after_state) VALUES ($1,$2,'ROLE_UPGRADE_REQUEST',$3,$4,$5)`, admin.ID, "ROLE_REQUEST_"+input.Status, chi.URLParam(r, "id"), before, after); err != nil {
		jsonError(w, "could not write role audit", http.StatusInternalServerError)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		jsonError(w, "could not commit role review", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "status": input.Status})
}

type reviewKYCRequest struct {
	Status string `json:"status"`
	Reason string `json:"reason"`
}

func (h *adminHandler) reviewKYC(w http.ResponseWriter, r *http.Request) {
	admin, ok := middleware.CurrentUser(r.Context())
	if !ok {
		jsonError(w, "authentication required", http.StatusUnauthorized)
		return
	}
	var input reviewKYCRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	input.Status = strings.ToUpper(strings.TrimSpace(input.Status))
	if input.Status != "APPROVED" && input.Status != "REJECTED" && input.Status != "MORE_INFO" {
		jsonError(w, "status must be APPROVED, REJECTED, or MORE_INFO", http.StatusBadRequest)
		return
	}
	ctx := r.Context()
	tx, err := h.pool.Begin(ctx)
	if err != nil {
		jsonError(w, "could not start moderation transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)
	var userID string
	var before []byte
	err = tx.QueryRow(ctx, `SELECT user_id, jsonb_build_object('status', status, 'review_reason', review_reason) FROM kyc_submissions WHERE id=$1 FOR UPDATE`, chi.URLParam(r, "id")).Scan(&userID, &before)
	if err != nil {
		jsonError(w, "KYC submission not found", http.StatusNotFound)
		return
	}
	if _, err = tx.Exec(ctx, `UPDATE kyc_submissions SET status=$1, reviewed_by=$2, reviewed_at=NOW(), review_reason=$3 WHERE id=$4`, input.Status, admin.ID, nullableText(input.Reason), chi.URLParam(r, "id")); err != nil {
		jsonError(w, "could not review KYC submission", http.StatusInternalServerError)
		return
	}
	verification := "PENDING"
	if input.Status == "APPROVED" {
		verification = "VERIFIED"
	}
	if input.Status == "REJECTED" {
		verification = "REJECTED"
	}
	if _, err = tx.Exec(ctx, `UPDATE users SET verification_status=$1, updated_at=NOW() WHERE id=$2`, verification, userID); err != nil {
		jsonError(w, "could not update user verification status", http.StatusInternalServerError)
		return
	}
	after, _ := json.Marshal(map[string]any{"status": input.Status, "review_reason": input.Reason, "verification_status": verification})
	if _, err = tx.Exec(ctx, `INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, before_state, after_state) VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)`, admin.ID, "REVIEW_KYC", "KYC_SUBMISSION", chi.URLParam(r, "id"), before, after); err != nil {
		jsonError(w, "could not write moderation audit log", http.StatusInternalServerError)
		return
	}
	if err = tx.Commit(ctx); err != nil {
		jsonError(w, "could not commit KYC review", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "status": input.Status})
}

func (h *adminHandler) reports(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pool.Query(r.Context(), `
		SELECT id, reporter_id, listing_id, reported_user_id, category, COALESCE(details,''), status, created_at
		FROM reports WHERE ($1 = '' OR status=$1) ORDER BY created_at ASC`, strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("status"))))
	if err != nil {
		jsonError(w, "could not fetch reports", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type reportRow struct {
		ID             string    `json:"id"`
		ReporterID     string    `json:"reporter_id"`
		ListingID      *string   `json:"listing_id,omitempty"`
		ReportedUserID *string   `json:"reported_user_id,omitempty"`
		Category       string    `json:"category"`
		Details        string    `json:"details"`
		Status         string    `json:"status"`
		CreatedAt      time.Time `json:"created_at"`
	}
	items := make([]reportRow, 0)
	for rows.Next() {
		var item reportRow
		if err := rows.Scan(&item.ID, &item.ReporterID, &item.ListingID, &item.ReportedUserID, &item.Category, &item.Details, &item.Status, &item.CreatedAt); err != nil {
			jsonError(w, "could not read report", http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}
	jsonOK(w, map[string]any{"ok": true, "reports": items})
}

func (h *adminHandler) reviewReport(w http.ResponseWriter, r *http.Request) {
	admin, ok := middleware.CurrentUser(r.Context())
	if !ok {
		jsonError(w, "authentication required", http.StatusUnauthorized)
		return
	}
	var input struct {
		Status string `json:"status"`
		Reason string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	input.Status = strings.ToUpper(strings.TrimSpace(input.Status))
	if input.Status != "IN_REVIEW" && input.Status != "RESOLVED" && input.Status != "DISMISSED" {
		jsonError(w, "invalid report status", http.StatusBadRequest)
		return
	}
	ctx := r.Context()
	tx, err := h.pool.Begin(ctx)
	if err != nil {
		jsonError(w, "could not start moderation transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)
	var before []byte
	err = tx.QueryRow(ctx, `SELECT jsonb_build_object('status', status, 'details', details) FROM reports WHERE id=$1 FOR UPDATE`, chi.URLParam(r, "id")).Scan(&before)
	if err != nil {
		jsonError(w, "report not found", http.StatusNotFound)
		return
	}
	if _, err = tx.Exec(ctx, `UPDATE reports SET status=$1, reviewed_by=$2, reviewed_at=NOW() WHERE id=$3`, input.Status, admin.ID, chi.URLParam(r, "id")); err != nil {
		jsonError(w, "could not review report", http.StatusInternalServerError)
		return
	}
	after, _ := json.Marshal(map[string]any{"status": input.Status, "reason": input.Reason})
	if _, err = tx.Exec(ctx, `INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, before_state, after_state) VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)`, admin.ID, "REVIEW_REPORT", "REPORT", chi.URLParam(r, "id"), before, after); err != nil {
		jsonError(w, "could not write report audit log", http.StatusInternalServerError)
		return
	}
	if err = tx.Commit(ctx); err != nil {
		jsonError(w, "could not commit report review", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "status": input.Status})
}

func (h *adminHandler) setUserStatus(w http.ResponseWriter, r *http.Request) {
	admin, ok := middleware.CurrentUser(r.Context())
	if !ok {
		jsonError(w, "authentication required", http.StatusUnauthorized)
		return
	}
	var input struct {
		Active bool   `json:"active"`
		Reason string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if chi.URLParam(r, "id") == admin.ID {
		jsonError(w, "an admin cannot suspend their own account", http.StatusBadRequest)
		return
	}
	ctx := r.Context()
	tx, err := h.pool.Begin(ctx)
	if err != nil {
		jsonError(w, "could not start account moderation", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)
	var before []byte
	err = tx.QueryRow(ctx, `SELECT jsonb_build_object('is_active', is_active, 'suspended_reason', suspended_reason) FROM users WHERE id=$1 FOR UPDATE`, chi.URLParam(r, "id")).Scan(&before)
	if err != nil {
		jsonError(w, "user not found", http.StatusNotFound)
		return
	}
	if _, err = tx.Exec(ctx, `UPDATE users SET is_active=$1, suspended_at=CASE WHEN $1 THEN NULL ELSE NOW() END, suspended_reason=CASE WHEN $1 THEN NULL ELSE $2 END, updated_at=NOW() WHERE id=$3`, input.Active, nullableText(input.Reason), chi.URLParam(r, "id")); err != nil {
		jsonError(w, "could not update account status", http.StatusInternalServerError)
		return
	}
	after, _ := json.Marshal(map[string]any{"is_active": input.Active, "reason": input.Reason})
	if _, err = tx.Exec(ctx, `INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, before_state, after_state) VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)`, admin.ID, "SET_USER_STATUS", "USER", chi.URLParam(r, "id"), before, after); err != nil {
		jsonError(w, "could not write account audit log", http.StatusInternalServerError)
		return
	}
	if err = tx.Commit(ctx); err != nil {
		jsonError(w, "could not commit account status", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "is_active": input.Active})
}

func (h *adminHandler) setPropertyStatus(w http.ResponseWriter, r *http.Request) {
	admin, ok := middleware.CurrentUser(r.Context())
	if !ok {
		jsonError(w, "authentication required", http.StatusUnauthorized)
		return
	}
	var input struct {
		Published bool   `json:"published"`
		Reason    string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	ctx := r.Context()
	tx, err := h.pool.Begin(ctx)
	if err != nil {
		jsonError(w, "could not start listing moderation", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)
	var before []byte
	err = tx.QueryRow(ctx, `SELECT jsonb_build_object('is_published', is_published, 'availability_status', availability_status, 'deleted_at', deleted_at) FROM properties WHERE id=$1 FOR UPDATE`, chi.URLParam(r, "id")).Scan(&before)
	if err != nil {
		jsonError(w, "listing not found", http.StatusNotFound)
		return
	}
	availability := "AVAILABLE"
	if !input.Published {
		availability = "UNAVAILABLE"
	}
	if _, err = tx.Exec(ctx, `UPDATE properties SET is_published=$1, availability_status=$2, deleted_at=CASE WHEN $1 THEN NULL ELSE COALESCE(deleted_at,NOW()) END, updated_at=NOW() WHERE id=$3`, input.Published, availability, chi.URLParam(r, "id")); err != nil {
		jsonError(w, "could not update listing status", http.StatusInternalServerError)
		return
	}
	after, _ := json.Marshal(map[string]any{"is_published": input.Published, "availability_status": availability, "reason": input.Reason})
	if _, err = tx.Exec(ctx, `INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, before_state, after_state) VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)`, admin.ID, "SET_PROPERTY_STATUS", "PROPERTY", chi.URLParam(r, "id"), before, after); err != nil {
		jsonError(w, "could not write listing audit log", http.StatusInternalServerError)
		return
	}
	if err = tx.Commit(ctx); err != nil {
		jsonError(w, "could not commit listing status", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "is_published": input.Published})
}
