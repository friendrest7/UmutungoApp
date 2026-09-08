package api

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/inzuhub/backend/internal/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

type leadsHandler struct {
	pool *pgxpool.Pool
}

type createLeadRequest struct {
	PropertyID    string `json:"property_id"`
	TenantName    string `json:"tenant_name"`
	TenantPhone   string `json:"tenant_phone"`
	TenantMessage string `json:"tenant_message"`
	ScheduledFor  string `json:"scheduled_for"` // RFC3339 or empty
}

// create handles POST /api/leads — creates a new viewing request.
func (h *leadsHandler) create(w http.ResponseWriter, r *http.Request) {
	identity, ok := middleware.CurrentUser(r.Context())
	if !ok {
		jsonError(w, "authentication required", http.StatusUnauthorized)
		return
	}

	var req createLeadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Basic validation
	req.TenantName = strings.TrimSpace(req.TenantName)
	req.TenantPhone = strings.TrimSpace(req.TenantPhone)
	req.PropertyID = strings.TrimSpace(req.PropertyID)

	if req.PropertyID == "" {
		jsonError(w, "property_id is required", http.StatusBadRequest)
		return
	}
	if req.TenantPhone == "" {
		jsonError(w, "tenant_phone is required", http.StatusBadRequest)
		return
	}

	var scheduledFor *time.Time
	if req.ScheduledFor != "" {
		t, err := time.Parse(time.RFC3339, req.ScheduledFor)
		if err != nil {
			jsonError(w, "scheduled_for must be an RFC3339 timestamp", http.StatusBadRequest)
			return
		}
		scheduledFor = &t
	}

	ctx := r.Context()
	var viewingID, hostID string
	err := h.pool.QueryRow(ctx, `
		INSERT INTO viewings (
			property_id,
			tenant_id,
			tenant_phone,
			scheduled_for,
			tenant_message,
			status
		)
		SELECT
			p.id,
			$2,
			$3,
			$4,
			$5,
			'PENDING'
		FROM properties p
		WHERE p.id = $1 AND p.is_published=TRUE AND p.deleted_at IS NULL
		  AND p.availability_status='AVAILABLE'
		RETURNING id, COALESCE(agent_id,owner_id)
	`, req.PropertyID, identity.ID, req.TenantPhone, scheduledFor, strings.TrimSpace(req.TenantMessage)).Scan(&viewingID, &hostID)

	if err != nil {
		jsonError(w, "could not create viewing request — property may not exist", http.StatusUnprocessableEntity)
		return
	}
	_ = (&engagementHandler{pool: h.pool}).notify(ctx, hostID, "VIEWING_REQUESTED", "New viewing request", "A client requested to view your listing", map[string]any{"viewing_id": viewingID, "property_id": req.PropertyID})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"ok":         true,
		"viewing_id": viewingID,
		"message":    "Viewing request received. We will contact you within 24 hours.",
	})
}

// listMine handles GET /api/leads/me — returns the authenticated user's requests.
func (h *leadsHandler) listMine(w http.ResponseWriter, r *http.Request) {
	identity, ok := middleware.CurrentUser(r.Context())
	if !ok {
		jsonError(w, "authentication required", http.StatusUnauthorized)
		return
	}

	rows, err := h.pool.Query(r.Context(), `
		SELECT
			v.id,
			v.property_id,
			p.title,
			p.district,
			v.tenant_phone,
			v.requested_at,
			v.scheduled_for,
			v.status,
			COALESCE(v.tenant_message, '')
		FROM viewings v
		JOIN properties p ON p.id = v.property_id
		WHERE v.tenant_id = $1
		ORDER BY v.requested_at DESC
	`, identity.ID)
	if err != nil {
		jsonError(w, "could not fetch viewing requests", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type viewingRow struct {
		ID            string     `json:"id"`
		PropertyID    string     `json:"property_id"`
		PropertyTitle string     `json:"property_title"`
		District      string     `json:"district"`
		TenantPhone   string     `json:"tenant_phone"`
		RequestedAt   time.Time  `json:"requested_at"`
		ScheduledFor  *time.Time `json:"scheduled_for,omitempty"`
		Status        string     `json:"status"`
		Message       string     `json:"message"`
	}
	viewings := make([]viewingRow, 0)
	for rows.Next() {
		var viewing viewingRow
		if err := rows.Scan(
			&viewing.ID, &viewing.PropertyID, &viewing.PropertyTitle,
			&viewing.District, &viewing.TenantPhone, &viewing.RequestedAt,
			&viewing.ScheduledFor, &viewing.Status, &viewing.Message,
		); err != nil {
			jsonError(w, "could not read viewing request", http.StatusInternalServerError)
			return
		}
		viewings = append(viewings, viewing)
	}

	jsonOK(w, map[string]any{"ok": true, "viewings": viewings})
}
