package api

import (
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
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
