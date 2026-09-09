package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/umutungoapp/backend/internal/config"
)

type propertiesHandler struct {
	pool *pgxpool.Pool
	cfg  *config.Config
}

// propertyRow is the shape returned by the list and get endpoints.
// Phase 2: replace with sqlc-generated types.
type propertyRow struct {
	ID                 string     `json:"id"`
	Title              string     `json:"title"`
	Description        string     `json:"description,omitempty"`
	PropertyType       string     `json:"property_type"`
	ListingType        string     `json:"listing_type"`
	ProvinceCode       string     `json:"province_code,omitempty"`
	DistrictCode       string     `json:"district_code,omitempty"`
	SectorCode         string     `json:"sector_code,omitempty"`
	CellCode           string     `json:"cell_code,omitempty"`
	VillageCode        string     `json:"village_code,omitempty"`
	District           string     `json:"district"`
	Sector             string     `json:"sector,omitempty"`
	Neighborhood       string     `json:"neighborhood"`
	AddressLine        string     `json:"address_line,omitempty"`
	RentalPrice        float64    `json:"rental_price"`
	Currency           string     `json:"currency"`
	Bedrooms           int        `json:"bedrooms"`
	Bathrooms          int        `json:"bathrooms"`
	VerificationStatus string     `json:"verification_status"`
	AvailabilityStatus string     `json:"availability_status"`
	Latitude           *float64   `json:"latitude,omitempty"`
	Longitude          *float64   `json:"longitude,omitempty"`
	CoverImageURL      *string    `json:"cover_image_url,omitempty"`
	ExpiresAt          *time.Time `json:"expires_at,omitempty"`
}

// list handles GET /api/properties
func (h *propertiesHandler) list(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	query := r.URL.Query()
	location := strings.TrimSpace(query.Get("location"))
	search := strings.TrimSpace(query.Get("q"))
	propertyType := strings.ToUpper(strings.TrimSpace(query.Get("property_type")))
	listingType := strings.ToUpper(strings.TrimSpace(query.Get("listing_type")))
	provinceCode := strings.TrimSpace(query.Get("province_code"))
	districtCode := strings.TrimSpace(query.Get("district_code"))
	sectorCode := strings.TrimSpace(query.Get("sector_code"))
	cellCode := strings.TrimSpace(query.Get("cell_code"))
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
	var minPrice *float64
	if value := strings.TrimSpace(query.Get("min_price")); value != "" {
		parsed, err := strconv.ParseFloat(value, 64)
		if err != nil || parsed < 0 {
			jsonError(w, "min_price must be a non-negative number", http.StatusBadRequest)
			return
		}
		minPrice = &parsed
	}
	page, limit := 1, 24
	if value := strings.TrimSpace(query.Get("page")); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed < 1 {
			jsonError(w, "page must be a positive integer", http.StatusBadRequest)
			return
		}
		page = parsed
	}
	if value := strings.TrimSpace(query.Get("limit")); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed < 1 || parsed > 100 {
			jsonError(w, "limit must be between 1 and 100", http.StatusBadRequest)
			return
		}
		limit = parsed
	}
	offset := (page - 1) * limit

	rows, err := h.pool.Query(ctx, `
		SELECT
			p.id,
			p.title,
			COALESCE(p.description, '') AS description,
			p.property_type,
			p.listing_type,
			COALESCE(p.province_code, '') AS province_code,
			COALESCE(p.district_code, '') AS district_code,
			COALESCE(p.sector_code, '') AS sector_code,
			COALESCE(p.cell_code, '') AS cell_code,
			COALESCE(p.village_code, '') AS village_code,
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
			pi.url AS cover_image_url,
			p.expires_at
		FROM properties p
		JOIN users owner_user ON owner_user.id = p.owner_id
		LEFT JOIN property_images pi
			ON pi.property_id = p.id AND pi.is_cover = TRUE
		WHERE p.is_published = TRUE
		  AND p.deleted_at IS NULL
		  AND (p.scheduled_for IS NULL OR p.scheduled_for <= NOW())
		  AND (p.expires_at IS NULL OR p.expires_at > NOW())
		  AND p.verification_status = 'VERIFIED'
		  AND p.availability_status = 'AVAILABLE'
		  AND owner_user.role IN ('TENANT', 'OWNER', 'AGENT', 'ADMIN')
          AND ($1 = '' OR p.title ILIKE '%' || $1 || '%' OR p.description ILIKE '%' || $1 || '%' OR p.property_type ILIKE '%' || $1 || '%' OR lower(p.property_type) = regexp_replace(lower($1), 's$', '') OR p.district ILIKE '%' || $1 || '%' OR p.neighborhood ILIKE '%' || $1 || '%' OR p.address_line ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR p.district ILIKE '%' || $2 || '%' OR p.neighborhood ILIKE '%' || $2 || '%')
		  AND ($3 = '' OR p.property_type = $3)
		  AND ($4 = '' OR p.listing_type = $4)
		  AND ($5 = '' OR p.province_code = $5)
		  AND ($6 = '' OR p.district_code = $6)
		  AND ($7 = '' OR p.sector_code = $7)
		  AND ($8 = '' OR p.cell_code = $8)
		  AND ($9 = 0 OR p.bedrooms >= $9)
		  AND ($10::NUMERIC IS NULL OR p.rental_price >= $10)
		  AND ($11::NUMERIC IS NULL OR p.rental_price <= $11)
		ORDER BY p.created_at DESC
		LIMIT $12 OFFSET $13
	`, search, location, propertyType, listingType, provinceCode, districtCode, sectorCode, cellCode, minBedrooms, minPrice, maxPrice, limit, offset)
	if err != nil {
		jsonError(w, "could not fetch properties", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	properties := make([]propertyRow, 0)
	for rows.Next() {
		var pr propertyRow
		if err := rows.Scan(
			&pr.ID, &pr.Title, &pr.Description, &pr.PropertyType, &pr.ListingType, &pr.ProvinceCode,
			&pr.DistrictCode, &pr.SectorCode, &pr.CellCode, &pr.VillageCode, &pr.District,
			&pr.Sector, &pr.Neighborhood, &pr.AddressLine, &pr.RentalPrice, &pr.Currency,
			&pr.Bedrooms, &pr.Bathrooms,
			&pr.VerificationStatus, &pr.AvailabilityStatus,
			&pr.Latitude, &pr.Longitude, &pr.CoverImageURL, &pr.ExpiresAt,
		); err != nil {
			jsonError(w, "could not read property row", http.StatusInternalServerError)
			return
		}
		properties = append(properties, pr)
	}

	jsonOK(w, map[string]any{"ok": true, "properties": properties, "page": page, "limit": limit})
}

// get handles GET /api/properties/{slug}
// slug here is the property UUID; a human-readable slug can be added in Phase 2.
func (h *propertiesHandler) get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "slug")
	ctx := r.Context()

	var pr propertyRow
	err := h.pool.QueryRow(ctx, `
		SELECT
			p.id,
			p.title,
			COALESCE(p.description, '') AS description,
			p.property_type,
			p.listing_type,
			COALESCE(p.province_code, ''),
			COALESCE(p.district_code, ''),
			COALESCE(p.sector_code, ''),
			COALESCE(p.cell_code, ''),
			COALESCE(p.village_code, ''),
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
			pi.url AS cover_image_url,
			p.expires_at
		FROM properties p
		JOIN users owner_user ON owner_user.id = p.owner_id
		LEFT JOIN property_images pi
			ON pi.property_id = p.id AND pi.is_cover = TRUE
		WHERE p.id = $1
		  AND p.is_published = TRUE
		  AND p.deleted_at IS NULL
		  AND (p.scheduled_for IS NULL OR p.scheduled_for <= NOW())
		  AND (p.expires_at IS NULL OR p.expires_at > NOW())
		  AND p.verification_status = 'VERIFIED'
		  AND p.availability_status = 'AVAILABLE'
		  AND owner_user.role IN ('TENANT', 'OWNER', 'AGENT', 'ADMIN')
	`, id).Scan(
		&pr.ID, &pr.Title, &pr.Description, &pr.PropertyType, &pr.ListingType, &pr.ProvinceCode,
		&pr.DistrictCode, &pr.SectorCode, &pr.CellCode, &pr.VillageCode, &pr.District,
		&pr.Sector, &pr.Neighborhood, &pr.AddressLine, &pr.RentalPrice, &pr.Currency,
		&pr.Bedrooms, &pr.Bathrooms,
		&pr.VerificationStatus, &pr.AvailabilityStatus,
		&pr.Latitude, &pr.Longitude, &pr.CoverImageURL, &pr.ExpiresAt,
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
