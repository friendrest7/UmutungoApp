-- Migration 006 UP: Create property_amenities junction table
-- Associates amenities with properties. Composite PK prevents duplicates.

CREATE TABLE property_amenities (
    property_id UUID NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
    amenity_id  UUID NOT NULL REFERENCES amenities  (id) ON DELETE RESTRICT,

    PRIMARY KEY (property_id, amenity_id)
);

CREATE INDEX idx_property_amenities_amenity_id
    ON property_amenities (amenity_id);
