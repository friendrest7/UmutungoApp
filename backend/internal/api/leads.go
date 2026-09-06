package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type leadsHandler struct {
	pool *pgxpool.Pool
}

type createLeadRequest struct {
	PropertyID     string `json:"property_id"`
	TenantName     string `json:"tenant_name"`
	TenantPhone    string `json:"tenant_phone"`
	TenantMessage  string `json:"tenant_message"`
	ScheduledFor   string `json:"scheduled_for"` // RFC3339 or empty
}

// create handles POST /api/leads — creates a new viewing request.
func (h *leadsHandler) create(w http.ResponseWriter, r *http.Request) {
	var req createLeadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Basic validation
	req.TenantName  = strings.TrimSpace(req.TenantName)
	req.TenantPhone = strings.TrimSpace(req.TenantPhone)
	req.PropertyID  = strings.TrimSpace(req.PropertyID)

	if req.PropertyID == "" {
		jsonError(w, "property_id is required", http.StatusBadRequest)
		return
	}
	if req.TenantName == "" {
		jsonError(w, "tenant_name is required", http.StatusBadRequest)
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

	ctx := context.Background()

	// Phase 1: insert without a real tenant_id (anonymous lead).
	// Phase 2: extract tenant_id from JWT.
	var viewingID string
	err := h.pool.QueryRow(ctx, `
		INSERT INTO viewings (
			property_id,
			tenant_id,
			scheduled_for,
			tenant_message,
			status
		)
		SELECT
			p.id,
			-- Use the demo tenant as placeholder until real auth is wired
			(SELECT id FROM users WHERE email = 'tenant@inzuhub.demo' LIMIT 1),
			$2,
			$3,
			'PENDING'
		FROM properties p
		WHERE p.id = $1
		RETURNING id
	`, req.PropertyID, scheduledFor, strings.TrimSpace(req.TenantMessage)).Scan(&viewingID)

	if err != nil {
		jsonError(w, "could not create viewing request — property may not exist", http.StatusUnprocessableEntity)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"ok":         true,
		"viewing_id": viewingID,
		"message":    "Viewing request received. We will contact you within 24 hours.",
	})
}
