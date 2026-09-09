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

type reviewsHandler struct{ pool *pgxpool.Pool }

type reviewInput struct {
	Rating int    `json:"rating"`
	Body   string `json:"body"`
}

func (h *reviewsHandler) list(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pool.Query(r.Context(), `SELECT r.id,r.rating,COALESCE(r.body,''),r.created_at,u.display_name FROM reviews r JOIN users u ON u.id=r.tenant_id WHERE r.property_id=$1 AND r.is_published=TRUE ORDER BY r.created_at DESC`, chi.URLParam(r, "id"))
	if err != nil {
		jsonError(w, "could not fetch reviews", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type review struct {
		ID        string    `json:"id"`
		Rating    int       `json:"rating"`
		Body      string    `json:"body"`
		CreatedAt time.Time `json:"created_at"`
		Author    string    `json:"author"`
	}
	items := make([]review, 0)
	total := 0
	sum := 0
	for rows.Next() {
		var item review
		if err := rows.Scan(&item.ID, &item.Rating, &item.Body, &item.CreatedAt, &item.Author); err != nil {
			jsonError(w, "could not read review", http.StatusInternalServerError)
			return
		}
		items = append(items, item)
		total++
		sum += item.Rating
	}
	var average float64
	if total > 0 {
		average = float64(sum) / float64(total)
	}
	jsonOK(w, map[string]any{"ok": true, "reviews": items, "count": total, "average": average})
}

func (h *reviewsHandler) create(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var input reviewInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || input.Rating < 1 || input.Rating > 5 || len([]rune(strings.TrimSpace(input.Body))) < 10 || len([]rune(input.Body)) > 2000 {
		jsonError(w, "rating must be 1-5 and review text must be 10-2000 characters", http.StatusBadRequest)
		return
	}
	propertyID := chi.URLParam(r, "id")
	var eligible bool
	err := h.pool.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM viewings WHERE property_id=$1 AND tenant_id=$2 AND status='COMPLETED') OR EXISTS(SELECT 1 FROM bookings WHERE listing_id=$1 AND client_id=$2 AND status='COMPLETED')`, propertyID, identity.ID).Scan(&eligible)
	if err != nil {
		jsonError(w, "could not verify review eligibility", http.StatusInternalServerError)
		return
	}
	if !eligible {
		jsonError(w, "a completed viewing or booking is required before reviewing", http.StatusForbidden)
		return
	}
	var id string
	err = h.pool.QueryRow(r.Context(), `INSERT INTO reviews (property_id,tenant_id,rating,body,is_published) VALUES ($1,$2,$3,$4,TRUE) RETURNING id`, propertyID, identity.ID, input.Rating, strings.TrimSpace(input.Body)).Scan(&id)
	if err != nil {
		jsonError(w, "you may already have a published review for this listing", http.StatusConflict)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "review_id": id, "status": "PUBLISHED"})
}
