-- Migration 010 UP: Create reviews table
-- Tenant reviews of properties they have viewed.
-- Business rule: one PUBLISHED review per tenant per property (drafts allowed).

CREATE TABLE reviews (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id  UUID        NOT NULL REFERENCES properties (id) ON DELETE RESTRICT,
    tenant_id    UUID        NOT NULL REFERENCES users (id)      ON DELETE RESTRICT,
    viewing_id   UUID                 REFERENCES viewings (id)   ON DELETE SET NULL,
    rating       SMALLINT    NOT NULL,
    body         TEXT,
    is_published BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT reviews_rating_range
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT reviews_body_min_length
        CHECK (body IS NULL OR length(trim(body)) >= 10)
);

-- One published review per tenant per property
CREATE UNIQUE INDEX idx_reviews_one_published_per_tenant
    ON reviews (property_id, tenant_id)
    WHERE is_published = TRUE;

CREATE INDEX idx_reviews_property_id ON reviews (property_id);
CREATE INDEX idx_reviews_tenant_id   ON reviews (tenant_id);
CREATE INDEX idx_reviews_rating      ON reviews (property_id, rating);
