-- Migration 005 UP: Create amenities catalogue table
-- Normalized amenity definitions. Populated by seed migration 012.

CREATE TABLE amenities (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug     TEXT NOT NULL,
    label    TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'GENERAL',

    CONSTRAINT amenities_slug_unique UNIQUE (slug),

    CONSTRAINT amenities_category_check
        CHECK (category IN ('GENERAL', 'SAFETY', 'UTILITIES', 'OUTDOOR', 'ACCESSIBILITY'))
);

CREATE INDEX idx_amenities_slug     ON amenities (slug);
CREATE INDEX idx_amenities_category ON amenities (category);
