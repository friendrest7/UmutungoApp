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
	Title              string     `json:"title"`
	Description        string     `json:"description"`
	PropertyType       string     `json:"property_type"`
	ListingType        string     `json:"listing_type"`
	RentalPrice        float64    `json:"rental_price"`
	Currency           string     `json:"currency"`
	Bedrooms           int        `json:"bedrooms"`
	Bathrooms          int        `json:"bathrooms"`
	AddressLine        string     `json:"address_line"`
	Neighborhood       string     `json:"neighborhood"`
	District           string     `json:"district"`
	Sector             string     `json:"sector"`
	ProvinceCode       string     `json:"province_code"`
	DistrictCode       string     `json:"district_code"`
	SectorCode         string     `json:"sector_code"`
	CellCode           string     `json:"cell_code"`
	VillageCode        string     `json:"village_code"`
	Tags               []string   `json:"tags"`
	PreferredContact   string     `json:"preferred_contact_method"`
	ScheduledFor       *time.Time `json:"scheduled_for"`
	Latitude           *float64   `json:"latitude"`
	Longitude          *float64   `json:"longitude"`
	AvailabilityStatus string     `json:"availability_status"`
	IsPublished        bool       `json:"is_published"`
	ImageURLs          []string   `json:"image_urls"`
}

type ownerProperty struct {
	ID                 string     `json:"id"`
	Title              string     `json:"title"`
	Description        string     `json:"description"`
	PropertyType       string     `json:"property_type"`
	ListingType        string     `json:"listing_type"`
	RentalPrice        float64    `json:"rental_price"`
	Currency           string     `json:"currency"`
	Bedrooms           int        `json:"bedrooms"`
	Bathrooms          int        `json:"bathrooms"`
	AddressLine        string     `json:"address_line"`
	Neighborhood       string     `json:"neighborhood"`
	District           string     `json:"district"`
	Sector             string     `json:"sector"`
	ProvinceCode       string     `json:"province_code,omitempty"`
	DistrictCode       string     `json:"district_code,omitempty"`
	SectorCode         string     `json:"sector_code,omitempty"`
	CellCode           string     `json:"cell_code,omitempty"`
	VillageCode        string     `json:"village_code,omitempty"`
	Tags               []string   `json:"tags"`
	PreferredContact   string     `json:"preferred_contact_method"`
	ScheduledFor       *time.Time `json:"scheduled_for,omitempty"`
	PublishedAt        *time.Time `json:"published_at,omitempty"`
	ExpiresAt          *time.Time `json:"expires_at,omitempty"`
	AvailabilityStatus string     `json:"availability_status"`
	VerificationStatus string     `json:"verification_status"`
	IsPublished        bool       `json:"is_published"`
	CreatedAt          time.Time  `json:"created_at"`
	CoverImageURL      *string    `json:"cover_image_url,omitempty"`
	ImageURLs          []string   `json:"image_urls"`
}

func (h *ownerHandler) list(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	rows, err := h.pool.Query(r.Context(), ownerPropertyQuery+` WHERE (p.owner_id = $1 OR p.agent_id = $1) AND p.deleted_at IS NULL ORDER BY p.created_at DESC`, identity.ID)
	if err != nil {
		// Older deployments may still have the original properties schema. Keep
		// the dashboard readable until the additive lifecycle migration is applied.
		rows, err = h.pool.Query(r.Context(), legacyOwnerPropertyQuery+` WHERE (p.owner_id = $1 OR p.agent_id = $1) ORDER BY p.created_at DESC`, identity.ID)
		if err != nil {
			jsonError(w, "could not fetch owner properties", http.StatusInternalServerError)
			return
		}
	}
	defer rows.Close()

	properties, err := scanOwnerProperties(rows)
	if err != nil {
		// A partially migrated database can accept the query but fail while
		// scanning newer nullable/array fields. Retry using the legacy shape.
		rows.Close()
		legacyRows, legacyErr := h.pool.Query(r.Context(), legacyOwnerPropertyQuery+` WHERE (p.owner_id = $1 OR p.agent_id = $1) ORDER BY p.created_at DESC`, identity.ID)
		if legacyErr != nil {
			jsonError(w, "could not read owner properties", http.StatusInternalServerError)
			return
		}
		defer legacyRows.Close()
		properties, err = scanOwnerProperties(legacyRows)
		if err != nil {
			jsonError(w, "could not read owner properties", http.StatusInternalServerError)
			return
		}
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
	if err := h.validateLocationHierarchy(r.Context(), input); err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}
	publication, err := h.publicationPolicy(r.Context(), identity, input, true)
	if err != nil {
		jsonError(w, err.Error(), publication.status)
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
		INSERT INTO properties (owner_id, agent_id, title, description, property_type, listing_type, rental_price, currency,
			bedrooms, bathrooms, address_line, neighborhood, district, sector, province_code, district_code,
			sector_code, cell_code, village_code, tags, preferred_contact_method, scheduled_for, published_at,
			expires_at, availability_status, is_published, verification_status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,'PENDING')
		RETURNING id
	`, identity.ID, nullableAgentID(identity), input.Title, nullableText(input.Description), input.PropertyType, input.ListingType, input.RentalPrice,
		input.Currency, input.Bedrooms, input.Bathrooms, nullableText(input.AddressLine), nullableText(input.Neighborhood),
		input.District, nullableText(input.Sector), nullableText(input.ProvinceCode), nullableText(input.DistrictCode),
		nullableText(input.SectorCode), nullableText(input.CellCode), nullableText(input.VillageCode), input.Tags,
		input.PreferredContact, input.ScheduledFor, publication.publishedAt, publication.expiresAt, input.AvailabilityStatus, publication.isPublished).Scan(&propertyID)
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
	if err := h.validateLocationHierarchy(r.Context(), input); err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}
	publication, err := h.publicationPolicy(r.Context(), identity, input, false)
	if err != nil {
		jsonError(w, err.Error(), publication.status)
		return
	}

	tx, err := h.pool.Begin(r.Context())
	if err != nil {
		jsonError(w, "could not start property transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())
	result, err := tx.Exec(r.Context(), `
		UPDATE properties SET title=$1, description=$2, property_type=$3, listing_type=$4, rental_price=$5, currency=$6,
		bedrooms=$7, bathrooms=$8, address_line=$9, neighborhood=$10, district=$11, sector=$12,
		province_code=$13, district_code=$14, sector_code=$15, cell_code=$16, village_code=$17, tags=$18,
		preferred_contact_method=$19, scheduled_for=$20, published_at=$21, expires_at=$22, latitude=$23, longitude=$24,
		availability_status=$25, is_published=$26, updated_at=NOW()
		WHERE id=$27 AND (owner_id=$28 OR agent_id=$28) AND deleted_at IS NULL
	`, input.Title, nullableText(input.Description), input.PropertyType, input.ListingType, input.RentalPrice, input.Currency,
		input.Bedrooms, input.Bathrooms, nullableText(input.AddressLine), nullableText(input.Neighborhood), input.District,
		nullableText(input.Sector), nullableText(input.ProvinceCode), nullableText(input.DistrictCode), nullableText(input.SectorCode),
		nullableText(input.CellCode), nullableText(input.VillageCode), input.Tags, input.PreferredContact, input.ScheduledFor,
		publication.publishedAt, publication.expiresAt, input.Latitude, input.Longitude, input.AvailabilityStatus, publication.isPublished, propertyID, identity.ID)
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
	result, err := h.pool.Exec(r.Context(), `UPDATE properties SET is_published=FALSE, deleted_at=NOW(), deleted_by=$3, availability_status='UNAVAILABLE', updated_at=NOW() WHERE id=$1 AND (owner_id=$2 OR agent_id=$2) AND deleted_at IS NULL`, chi.URLParam(r, "id"), identity.ID, identity.ID)
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
		SELECT v.id, p.title, u.display_name, u.email,
			COALESCE(v.tenant_phone, ''), v.requested_at,
			v.scheduled_for, v.status, COALESCE(v.tenant_message, '')
		FROM viewings v
		JOIN properties p ON p.id = v.property_id
		JOIN users u ON u.id = v.tenant_id
		WHERE p.owner_id = $1 OR p.agent_id = $1
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
		Phone        string     `json:"phone"`
		RequestedAt  time.Time  `json:"requested_at"`
		ScheduledFor *time.Time `json:"scheduled_for,omitempty"`
		Status       string     `json:"status"`
		Message      string     `json:"message"`
	}
	requests := make([]viewingRequest, 0)
	for rows.Next() {
		var request viewingRequest
		if err := rows.Scan(&request.ID, &request.Property, &request.Requester, &request.Email,
			&request.Phone, &request.RequestedAt, &request.ScheduledFor, &request.Status, &request.Message); err != nil {
			jsonError(w, "could not read owner viewing request", http.StatusInternalServerError)
			return
		}
		requests = append(requests, request)
	}
	jsonOK(w, map[string]any{"ok": true, "viewings": requests})
}

// updateViewingStatus handles PATCH /api/owner/viewings/{id}/status
func (h *ownerHandler) updateViewingStatus(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	viewingID := chi.URLParam(r, "id")

	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	allowed := map[string]bool{"CONFIRMED": true, "CANCELLED": true, "COMPLETED": true, "NO_SHOW": true}
	if !allowed[body.Status] {
		jsonError(w, "status must be CONFIRMED, CANCELLED, COMPLETED, or NO_SHOW", http.StatusBadRequest)
		return
	}

	result, err := h.pool.Exec(r.Context(), `
		UPDATE viewings SET status=$1, updated_at=NOW()
		WHERE id=$2 AND EXISTS (
			SELECT 1 FROM properties p
			WHERE p.id = viewings.property_id
			  AND (p.owner_id=$3 OR p.agent_id=$3)
			  AND p.deleted_at IS NULL
		)
	`, body.Status, viewingID, identity.ID)
	if err != nil {
		jsonError(w, "could not update viewing status", http.StatusInternalServerError)
		return
	}
	if result.RowsAffected() != 1 {
		jsonError(w, "viewing not found or not owned by this account", http.StatusNotFound)
		return
	}
	jsonOK(w, map[string]any{"ok": true, "status": body.Status})
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
	if input.ListingType != "SALE" && input.ListingType != "RENT" && input.ListingType != "BOOK" {
		return fmtError("listing_type must be SALE, RENT, or BOOK")
	}
	if input.PreferredContact != "PHONE" && input.PreferredContact != "MESSAGE" && input.PreferredContact != "BOTH" {
		return fmtError("preferred_contact_method must be PHONE, MESSAGE, or BOTH")
	}
	if len(input.ImageURLs) == 0 {
		return fmtError("at least one listing photo is required")
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
	if strings.TrimSpace(input.ListingType) == "" {
		input.ListingType = "RENT"
	}
	if strings.TrimSpace(input.PreferredContact) == "" {
		input.PreferredContact = "BOTH"
	}
}

type publicationDecision struct {
	isPublished bool
	publishedAt *time.Time
	expiresAt   *time.Time
	status      int
}

func (h *ownerHandler) publicationPolicy(ctx context.Context, identity middleware.UserIdentity, input ownerPropertyInput, creating bool) (publicationDecision, error) {
	decision := publicationDecision{isPublished: input.IsPublished, status: http.StatusConflict}
	scheduled := input.ScheduledFor != nil
	if input.ScheduledFor != nil && !input.ScheduledFor.After(time.Now()) {
		return decision, fmtError("scheduled_for must be in the future")
	}
	// Every authenticated user may save a property draft. Public publication
	// remains controlled by the existing verification and moderation policy.
	if identity.Role == "TENANT" && (input.IsPublished || scheduled) {
		decision.isPublished = false
		decision.publishedAt = nil
		decision.expiresAt = nil
		return decision, nil
	}
	if input.ScheduledFor != nil {
		decision.isPublished = false
	}
	if !decision.isPublished && input.ScheduledFor == nil {
		return decision, nil
	}
	var verification string
	if err := h.pool.QueryRow(ctx, `SELECT verification_status FROM users WHERE id=$1`, identity.ID).Scan(&verification); err != nil {
		return publicationDecision{status: http.StatusInternalServerError}, fmtError("could not verify account status")
	}
	if identity.Role != "ADMIN" && verification != "VERIFIED" {
		return decision, fmtError("KYC verification is required before publishing a listing")
	}
	if identity.Role == "AGENT" {
		if creating {
			var count int
			if err := h.pool.QueryRow(ctx, `SELECT COUNT(*) FROM properties WHERE (owner_id=$1 OR agent_id=$1) AND deleted_at IS NULL AND created_at >= date_trunc('month', NOW())`, identity.ID).Scan(&count); err != nil {
				return publicationDecision{status: http.StatusInternalServerError}, fmtError("could not check posting quota")
			}
			if count >= 10 {
				return decision, fmtError("monthly Komisiyoneri posting quota reached")
			}
		}
		publishedAt := time.Now()
		if scheduled {
			expires := input.ScheduledFor.Add(30 * 24 * time.Hour)
			decision.expiresAt = &expires
			return decision, nil
		}
		decision.publishedAt = &publishedAt
		expires := publishedAt.Add(30 * 24 * time.Hour)
		decision.expiresAt = &expires
		return decision, nil
	}
	var expiryDays *int
	err := h.pool.QueryRow(ctx, `
		SELECT sp.listing_expiry_days
		FROM subscriptions s JOIN subscription_plans sp ON sp.code=s.plan_code
		WHERE s.user_id=$1 AND s.status='ACTIVE' AND (s.ends_at IS NULL OR s.ends_at > NOW()) AND sp.is_active=TRUE
		ORDER BY s.ends_at DESC NULLS LAST LIMIT 1
	`, identity.ID).Scan(&expiryDays)
	if err != nil {
		if err == pgx.ErrNoRows {
			return decision, fmtError("an active property-owner subscription is required before publishing")
		}
		return publicationDecision{status: http.StatusInternalServerError}, fmtError("could not resolve subscription")
	}
	if expiryDays == nil {
		return decision, fmtError("the selected subscription has no configured listing expiry")
	}
	if scheduled {
		expires := input.ScheduledFor.Add(time.Duration(*expiryDays) * 24 * time.Hour)
		decision.expiresAt = &expires
		return decision, nil
	}
	publishedAt := time.Now()
	decision.publishedAt = &publishedAt
	expires := publishedAt.Add(time.Duration(*expiryDays) * 24 * time.Hour)
	decision.expiresAt = &expires
	return decision, nil
}

func (h *ownerHandler) validateLocationHierarchy(ctx context.Context, input ownerPropertyInput) error {
	province, district, sector, cell, village := strings.TrimSpace(input.ProvinceCode), strings.TrimSpace(input.DistrictCode), strings.TrimSpace(input.SectorCode), strings.TrimSpace(input.CellCode), strings.TrimSpace(input.VillageCode)
	if province == "" && district == "" && sector == "" && cell == "" && village == "" {
		return nil
	}
	if province == "" || (sector != "" && district == "") || (cell != "" && sector == "") || (village != "" && cell == "") {
		return fmtError("location codes must follow Province, District, Sector, Cell, Village order")
	}
	var valid bool
	err := h.pool.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM rwanda_locations p
			WHERE p.code=$1 AND p.admin_level='PROVINCE'
			  AND ($2='' OR EXISTS (SELECT 1 FROM rwanda_locations d WHERE d.code=$2 AND d.admin_level='DISTRICT' AND d.parent_code=p.code))
			  AND ($3='' OR EXISTS (SELECT 1 FROM rwanda_locations s WHERE s.code=$3 AND s.admin_level='SECTOR' AND s.parent_code=$2))
			  AND ($4='' OR EXISTS (SELECT 1 FROM rwanda_locations c WHERE c.code=$4 AND c.admin_level='CELL' AND c.parent_code=$3))
			  AND ($5='' OR EXISTS (SELECT 1 FROM rwanda_locations v WHERE v.code=$5 AND v.admin_level='VILLAGE' AND v.parent_code=$4))
		)`, province, district, sector, cell, village).Scan(&valid)
	if err != nil {
		return fmtError("could not validate Rwanda location")
	}
	if !valid {
		return fmtError("location codes do not match the Rwanda administrative hierarchy")
	}
	return nil
}

func nullableAgentID(identity middleware.UserIdentity) *string {
	if identity.Role != "AGENT" {
		return nil
	}
	return &identity.ID
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
	SELECT p.id, p.title, COALESCE(p.description,''), p.property_type, p.listing_type, p.rental_price, p.currency,
		p.bedrooms, p.bathrooms, COALESCE(p.address_line,''), COALESCE(p.neighborhood,''), p.district,
		COALESCE(p.sector,''), COALESCE(p.province_code,''), COALESCE(p.district_code,''), COALESCE(p.sector_code,''),
		COALESCE(p.cell_code,''), COALESCE(p.village_code,''), p.tags, p.preferred_contact_method, p.scheduled_for,
		p.published_at, p.expires_at, p.availability_status, p.verification_status, p.is_published, p.created_at,
		cover.url,
		COALESCE((SELECT array_agg(images.url ORDER BY images.sort_order) FROM property_images images WHERE images.property_id=p.id), ARRAY[]::TEXT[])
	FROM properties p LEFT JOIN property_images cover ON cover.property_id=p.id AND cover.is_cover=TRUE`

// legacyOwnerPropertyQuery maps the original property columns into the
// current response shape. It is used only when an older database has not yet
// applied the additive lifecycle/location migration.
const legacyOwnerPropertyQuery = `
	SELECT p.id, p.title, COALESCE(p.description,''), p.property_type, 'RENT'::TEXT, p.rental_price, p.currency,
		p.bedrooms, p.bathrooms, COALESCE(p.address_line,''), COALESCE(p.neighborhood,''), p.district,
		COALESCE(p.sector,''), ''::TEXT, ''::TEXT, ''::TEXT, ''::TEXT, ''::TEXT, '{}'::TEXT[], 'BOTH'::TEXT,
		NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, p.availability_status, p.verification_status,
		p.is_published, p.created_at, cover.url,
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
		if err := rows.Scan(&property.ID, &property.Title, &property.Description, &property.PropertyType, &property.ListingType,
			&property.RentalPrice, &property.Currency, &property.Bedrooms, &property.Bathrooms, &property.AddressLine,
			&property.Neighborhood, &property.District, &property.Sector, &property.ProvinceCode, &property.DistrictCode,
			&property.SectorCode, &property.CellCode, &property.VillageCode, &property.Tags, &property.PreferredContact,
			&property.ScheduledFor, &property.PublishedAt, &property.ExpiresAt, &property.AvailabilityStatus,
			&property.VerificationStatus, &property.IsPublished, &property.CreatedAt, &property.CoverImageURL, &property.ImageURLs); err != nil {
			return nil, err
		}
		properties = append(properties, property)
	}
	return properties, nil
}
