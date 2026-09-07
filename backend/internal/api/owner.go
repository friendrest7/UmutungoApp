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

	"github.com/inzuhub/backend/internal/middleware"
)

type ownerHandler struct{ pool *pgxpool.Pool }

type ownerPropertyInput struct {
	Title              string   `json:"title"`
	Description        string   `json:"description"`
	PropertyType       string   `json:"property_type"`
	RentalPrice        float64  `json:"rental_price"`
	Currency           string   `json:"currency"`
	Bedrooms           int      `json:"bedrooms"`
	Bathrooms          int      `json:"bathrooms"`
	AddressLine        string   `json:"address_line"`
	Neighborhood       string   `json:"neighborhood"`
	District           string   `json:"district"`
	Sector             string   `json:"sector"`
	Latitude           *float64 `json:"latitude"`
	Longitude          *float64 `json:"longitude"`
	AvailabilityStatus string   `json:"availability_status"`
	IsPublished        bool     `json:"is_published"`
	ImageURLs          []string `json:"image_urls"`
}

type ownerProperty struct {
	ID                 string    `json:"id"`
	Title              string    `json:"title"`
	Description        string    `json:"description"`
	PropertyType       string    `json:"property_type"`
	RentalPrice        float64   `json:"rental_price"`
	Currency           string    `json:"currency"`
	Bedrooms           int       `json:"bedrooms"`
	Bathrooms          int       `json:"bathrooms"`
	AddressLine        string    `json:"address_line"`
	Neighborhood       string    `json:"neighborhood"`
	District           string    `json:"district"`
	Sector             string    `json:"sector"`
	AvailabilityStatus string    `json:"availability_status"`
	VerificationStatus string    `json:"verification_status"`
	IsPublished        bool      `json:"is_published"`
	CreatedAt          time.Time `json:"created_at"`
	CoverImageURL      *string   `json:"cover_image_url,omitempty"`
	ImageURLs          []string  `json:"image_urls"`
}

func (h *ownerHandler) list(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	rows, err := h.pool.Query(r.Context(), ownerPropertyQuery+` WHERE p.owner_id = $1 ORDER BY p.created_at DESC`, identity.ID)
	if err != nil {
		jsonError(w, "could not fetch owner properties", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	properties, err := scanOwnerProperties(rows)
	if err != nil {
		jsonError(w, "could not read owner properties", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "properties": properties})
}

func (h *ownerHandler) create(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var input ownerPropertyInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	applyOwnerDefaults(&input)
	if err := validateOwnerProperty(input); err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	tx, err := h.pool.Begin(ctx)
	if err != nil {
		jsonError(w, "could not start property transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)

	var propertyID string
	err = tx.QueryRow(ctx, `
		INSERT INTO properties (owner_id, title, description, property_type, rental_price, currency,
			bedrooms, bathrooms, address_line, neighborhood, district, sector, latitude, longitude,
			availability_status, is_published, verification_status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'PENDING')
		RETURNING id
	`, identity.ID, input.Title, nullableText(input.Description), input.PropertyType, input.RentalPrice,
		input.Currency, input.Bedrooms, input.Bathrooms, nullableText(input.AddressLine), nullableText(input.Neighborhood),
		input.District, nullableText(input.Sector), input.Latitude, input.Longitude, input.AvailabilityStatus, input.IsPublished).Scan(&propertyID)
	if err != nil {
		jsonError(w, "could not create property", http.StatusUnprocessableEntity)
		return
	}
	if err := replaceOwnerImages(ctx, tx, propertyID, input.ImageURLs); err != nil {
		jsonError(w, "could not save property images", http.StatusUnprocessableEntity)
		return
	}
	if err := tx.Commit(ctx); err != nil {
		jsonError(w, "could not save property", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "property_id": propertyID})
}

func (h *ownerHandler) update(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	propertyID := chi.URLParam(r, "id")
	var input ownerPropertyInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	applyOwnerDefaults(&input)
	if err := validateOwnerProperty(input); err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}

	tx, err := h.pool.Begin(r.Context())
	if err != nil {
		jsonError(w, "could not start property transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())
	result, err := tx.Exec(r.Context(), `
		UPDATE properties SET title=$1, description=$2, property_type=$3, rental_price=$4, currency=$5,
		bedrooms=$6, bathrooms=$7, address_line=$8, neighborhood=$9, district=$10, sector=$11,
		latitude=$12, longitude=$13, availability_status=$14, is_published=$15, updated_at=NOW()
		WHERE id=$16 AND owner_id=$17
	`, input.Title, nullableText(input.Description), input.PropertyType, input.RentalPrice, input.Currency,
		input.Bedrooms, input.Bathrooms, nullableText(input.AddressLine), nullableText(input.Neighborhood), input.District,
		nullableText(input.Sector), input.Latitude, input.Longitude, input.AvailabilityStatus, input.IsPublished, propertyID, identity.ID)
	if err != nil || result.RowsAffected() != 1 {
		jsonError(w, "property not found or not owned by this account", http.StatusNotFound)
		return
	}
	if err := replaceOwnerImages(r.Context(), tx, propertyID, input.ImageURLs); err != nil {
		jsonError(w, "could not save property images", http.StatusUnprocessableEntity)
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		jsonError(w, "could not update property", http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]any{"ok": true})
}

func (h *ownerHandler) remove(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	result, err := h.pool.Exec(r.Context(), `UPDATE properties SET is_published=FALSE, availability_status='UNAVAILABLE', updated_at=NOW() WHERE id=$1 AND owner_id=$2`, chi.URLParam(r, "id"), identity.ID)
	if err != nil {
		jsonError(w, "could not unpublish property", http.StatusInternalServerError)
		return
	}
	if result.RowsAffected() != 1 {
		jsonError(w, "property not found or not owned by this account", http.StatusNotFound)
		return
	}
	jsonOK(w, map[string]any{"ok": true})
}

func (h *ownerHandler) viewings(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	rows, err := h.pool.Query(r.Context(), `
		SELECT v.id, p.title, u.display_name, u.email, v.requested_at,
			v.scheduled_for, v.status, COALESCE(v.tenant_message, '')
		FROM viewings v
		JOIN properties p ON p.id = v.property_id
		JOIN users u ON u.id = v.tenant_id
		WHERE p.owner_id = $1
		ORDER BY v.requested_at DESC
	`, identity.ID)
	if err != nil {
		jsonError(w, "could not fetch owner viewing requests", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type viewingRequest struct {
		ID           string     `json:"id"`
		Property     string     `json:"property"`
		Requester    string     `json:"requester"`
		Email        string     `json:"email"`
		RequestedAt  time.Time  `json:"requested_at"`
		ScheduledFor *time.Time `json:"scheduled_for,omitempty"`
		Status       string     `json:"status"`
		Message      string     `json:"message"`
	}
	requests := make([]viewingRequest, 0)
	for rows.Next() {
		var request viewingRequest
		if err := rows.Scan(&request.ID, &request.Property, &request.Requester, &request.Email,
			&request.RequestedAt, &request.ScheduledFor, &request.Status, &request.Message); err != nil {
			jsonError(w, "could not read owner viewing request", http.StatusInternalServerError)
			return
		}
		requests = append(requests, request)
	}
	jsonOK(w, map[string]any{"ok": true, "viewings": requests})
}

func validateOwnerProperty(input ownerPropertyInput) error {
	if strings.TrimSpace(input.Title) == "" {
		return fmtError("title is required")
	}
	if input.RentalPrice <= 0 {
		return fmtError("rental_price must be positive")
	}
	if strings.TrimSpace(input.District) == "" {
		return fmtError("district is required")
	}
	if input.Bedrooms < 0 || input.Bathrooms < 0 {
		return fmtError("bedrooms and bathrooms cannot be negative")
	}
	return nil
}

func applyOwnerDefaults(input *ownerPropertyInput) {
	if strings.TrimSpace(input.Currency) == "" {
		input.Currency = "RWF"
	}
	if strings.TrimSpace(input.AvailabilityStatus) == "" {
		input.AvailabilityStatus = "AVAILABLE"
	}
}

func replaceOwnerImages(ctx context.Context, tx pgx.Tx, propertyID string, urls []string) error {
	// Image URLs are accepted only as persisted object URLs; file uploads remain
	// behind a storage provider and never pass secrets through the browser.
	if _, err := tx.Exec(ctx, `DELETE FROM property_images WHERE property_id=$1`, propertyID); err != nil {
		return err
	}
	for index, imageURL := range urls {
		imageURL = strings.TrimSpace(imageURL)
		if imageURL == "" {
			continue
		}
		if _, err := tx.Exec(ctx, `INSERT INTO property_images (property_id, url, is_cover, sort_order) VALUES ($1,$2,$3,$4)`, propertyID, imageURL, index == 0, index); err != nil {
			return err
		}
	}
	return nil
}

func nullableText(value string) *string {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}
	return &value
}

type validationError string

func (e validationError) Error() string { return string(e) }
func fmtError(message string) error     { return validationError(message) }

const ownerPropertyQuery = `
	SELECT p.id, p.title, COALESCE(p.description,''), p.property_type, p.rental_price, p.currency,
		p.bedrooms, p.bathrooms, COALESCE(p.address_line,''), COALESCE(p.neighborhood,''), p.district,
		COALESCE(p.sector,''), p.availability_status, p.verification_status, p.is_published, p.created_at,
		cover.url,
		COALESCE((SELECT array_agg(images.url ORDER BY images.sort_order) FROM property_images images WHERE images.property_id=p.id), ARRAY[]::TEXT[])
	FROM properties p LEFT JOIN property_images cover ON cover.property_id=p.id AND cover.is_cover=TRUE`

type ownerRows interface {
	Next() bool
	Scan(...any) error
}

func scanOwnerProperties(rows ownerRows) ([]ownerProperty, error) {
	properties := make([]ownerProperty, 0)
	for rows.Next() {
		var property ownerProperty
		if err := rows.Scan(&property.ID, &property.Title, &property.Description, &property.PropertyType,
			&property.RentalPrice, &property.Currency, &property.Bedrooms, &property.Bathrooms, &property.AddressLine,
			&property.Neighborhood, &property.District, &property.Sector, &property.AvailabilityStatus,
			&property.VerificationStatus, &property.IsPublished, &property.CreatedAt, &property.CoverImageURL, &property.ImageURLs); err != nil {
			return nil, err
		}
		properties = append(properties, property)
	}
	return properties, nil
}
