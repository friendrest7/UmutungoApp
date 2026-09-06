-- Migration 004 UP: Create property_images table

CREATE TABLE property_images (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id  UUID        NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
    url          TEXT        NOT NULL,
    alt_text     TEXT,
    is_cover     BOOLEAN     NOT NULL DEFAULT FALSE,
    sort_order   SMALLINT    NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce a single cover image per property
CREATE UNIQUE INDEX idx_property_images_one_cover
    ON property_images (property_id)
    WHERE is_cover = TRUE;

CREATE INDEX idx_property_images_property_id
    ON property_images (property_id);

CREATE INDEX idx_property_images_sort
    ON property_images (property_id, sort_order);
