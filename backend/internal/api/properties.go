package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/inzuhub/backend/internal/config"
)

type propertiesHandler struct {
	pool *pgxpool.Pool
	cfg  *config.Config
}

// propertyRow is the shape returned by the list and get endpoints.
// Phase 2: replace with sqlc-generated types.
type propertyRow struct {
	ID                 string   `json:"id"`
	Title              string   `json:"title"`
	Description        string   `json:"description,omitempty"`
	PropertyType       string   `json:"property_type"`
	District           string   `json:"district"`
	Sector             string   `json:"sector,omitempty"`
	Neighborhood       string   `json:"neighborhood"`
	AddressLine        string   `json:"address_line,omitempty"`
	RentalPrice        float64  `json:"rental_price"`
	Currency           string   `json:"currency"`
	Bedrooms           int      `json:"bedrooms"`
	Bathrooms          int      `json:"bathrooms"`
	VerificationStatus string   `json:"verification_status"`
	AvailabilityStatus string   `json:"availability_status"`
	Latitude           *float64 `json:"latitude,omitempty"`
	Longitude          *float64 `json:"longitude,omitempty"`
	CoverImageURL      *string  `json:"cover_image_url,omitempty"`
}

// list handles GET /api/properties
func (h *propertiesHandler) list(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	query := r.URL.Query()
	location := strings.TrimSpace(query.Get("location"))
	propertyType := strings.ToUpper(strings.TrimSpace(query.Get("property_type")))
	minBedrooms := 0
	if value := strings.TrimSpace(query.Get("min_bedrooms")); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed < 0 {
			jsonError(w, "min_bedrooms must be a non-negative integer", http.StatusBadRequest)
			return
		}
		minBedrooms = parsed
	}
	var maxPrice *float64
	if value := strings.TrimSpace(query.Get("max_price")); value != "" {
		parsed, err := strconv.ParseFloat(value, 64)
		if err != nil || parsed <= 0 {
			jsonError(w, "max_price must be a positive number", http.StatusBadRequest)
			return
		}
		maxPrice = &parsed
	}

	rows, err := h.pool.Query(ctx, `
		SELECT
			p.id,
			p.title,
			COALESCE(p.description, '') AS description,
			p.property_type,
			p.district,
			COALESCE(p.sector, '') AS sector,
			COALESCE(p.neighborhood, '') AS neighborhood,
			COALESCE(p.address_line, '') AS address_line,
			p.rental_price,
			p.currency,
			p.bedrooms,
			p.bathrooms,
			p.verification_status,
			p.availability_status,
			p.latitude,
			p.longitude,
			pi.url AS cover_image_url
		FROM properties p
		LEFT JOIN property_images pi
			ON pi.property_id = p.id AND pi.is_cover = TRUE
		WHERE p.is_published = TRUE
		  AND p.verification_status = 'VERIFIED'
		  AND p.availability_status = 'AVAILABLE'
		  AND ($1 = '' OR p.district ILIKE '%' || $1 || '%' OR p.neighborhood ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR p.property_type = $2)
		  AND ($3 = 0 OR p.bedrooms >= $3)
		  AND ($4::NUMERIC IS NULL OR p.rental_price <= $4)
		ORDER BY p.created_at DESC
	`, location, propertyType, minBedrooms, maxPrice)
	if err != nil {
		jsonError(w, "could not fetch properties", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	properties := make([]propertyRow, 0)
	for rows.Next() {
		var pr propertyRow
		if err := rows.Scan(
			&pr.ID, &pr.Title, &pr.Description, &pr.PropertyType, &pr.District,
			&pr.Sector, &pr.Neighborhood, &pr.AddressLine, &pr.RentalPrice, &pr.Currency,
			&pr.Bedrooms, &pr.Bathrooms,
			&pr.VerificationStatus, &pr.AvailabilityStatus,
			&pr.Latitude, &pr.Longitude, &pr.CoverImageURL,
		); err != nil {
			jsonError(w, "could not read property row", http.StatusInternalServerError)
			return
		}
		properties = append(properties, pr)
	}

	jsonOK(w, map[string]any{"ok": true, "properties": properties})
}

// get handles GET /api/properties/{slug}
// slug here is the property UUID; a human-readable slug can be added in Phase 2.
func (h *propertiesHandler) get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "slug")
	ctx := context.Background()

	var pr propertyRow
	err := h.pool.QueryRow(ctx, `
		SELECT
			p.id,
			p.title,
			COALESCE(p.description, '') AS description,
			p.property_type,
			p.district,
			COALESCE(p.sector, '') AS sector,
			COALESCE(p.neighborhood, '') AS neighborhood,
			COALESCE(p.address_line, '') AS address_line,
			p.rental_price,
			p.currency,
			p.bedrooms,
			p.bathrooms,
			p.verification_status,
			p.availability_status,
			p.latitude,
			p.longitude,
			pi.url AS cover_image_url
		FROM properties p
		LEFT JOIN property_images pi
			ON pi.property_id = p.id AND pi.is_cover = TRUE
		WHERE p.id = $1
		  AND p.is_published = TRUE
		  AND p.verification_status = 'VERIFIED'
		  AND p.availability_status = 'AVAILABLE'
	`, id).Scan(
		&pr.ID, &pr.Title, &pr.Description, &pr.PropertyType, &pr.District,
		&pr.Sector, &pr.Neighborhood, &pr.AddressLine, &pr.RentalPrice, &pr.Currency,
		&pr.Bedrooms, &pr.Bathrooms,
		&pr.VerificationStatus, &pr.AvailabilityStatus,
		&pr.Latitude, &pr.Longitude, &pr.CoverImageURL,
	)
	if err != nil {
		jsonError(w, "property not found", http.StatusNotFound)
		return
	}

	jsonOK(w, map[string]any{"ok": true, "property": pr})
}

// ── shared helpers ───────────────────────────────────────────────────────────

func jsonOK(w http.ResponseWriter, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(payload)
}

func jsonError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": msg})
}
