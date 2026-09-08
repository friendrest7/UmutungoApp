package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/inzuhub/backend/internal/middleware"
)

type contactHandler struct{ pool *pgxpool.Pool }

func (h *contactHandler) reveal(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	if identity.Role != "TENANT" { jsonError(w, "only clients can reveal listing contact details", http.StatusForbidden); return }
	var creatorID, phone string
	err := h.pool.QueryRow(r.Context(), `
		SELECT COALESCE(p.agent_id,p.owner_id), COALESCE(u.phone,'')
		FROM properties p JOIN users u ON u.id=COALESCE(p.agent_id,p.owner_id)
		WHERE p.id=$1 AND p.is_published=TRUE AND p.deleted_at IS NULL AND p.availability_status='AVAILABLE'`, chi.URLParam(r,"id")).Scan(&creatorID,&phone)
	if err != nil { jsonError(w,"listing contact is unavailable",http.StatusNotFound); return }
	if phone == "" { jsonError(w,"the listing creator has not added a verified phone number",http.StatusNotFound); return }
	if _, err := h.pool.Exec(r.Context(), `INSERT INTO listing_contact_reveals (listing_id,user_id) VALUES ($1,$2) ON CONFLICT (listing_id,user_id) DO UPDATE SET revealed_at=NOW()`, chi.URLParam(r,"id"), identity.ID); err != nil { jsonError(w,"could not record contact access",http.StatusInternalServerError); return }
	_ = (&engagementHandler{pool:h.pool}).notify(r.Context(),creatorID,"PHONE_REVEALED","Listing phone viewed","A client revealed your listing phone number",map[string]any{"listing_id":chi.URLParam(r,"id")})
	jsonOK(w,map[string]any{"ok":true,"phone":phone,"tel":"tel:"+phone})
}
