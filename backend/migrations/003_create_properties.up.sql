-- Migration 003 UP: Create properties table

CREATE TABLE properties (
    id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id            UUID           NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    agent_id            UUID                    REFERENCES users (id) ON DELETE SET NULL,
    title               TEXT           NOT NULL,
    description         TEXT,
    property_type       TEXT           NOT NULL,
    rental_price        NUMERIC(12, 2) NOT NULL,
    currency            CHAR(3)        NOT NULL DEFAULT 'RWF',
    bedrooms            SMALLINT       NOT NULL DEFAULT 1,
    bathrooms           SMALLINT       NOT NULL DEFAULT 1,
    address_line        TEXT,
    neighborhood        TEXT,
    district            TEXT           NOT NULL,
    sector              TEXT,
    latitude            NUMERIC(9, 6),
    longitude           NUMERIC(9, 6),
    verification_status TEXT           NOT NULL DEFAULT 'UNVERIFIED',
    availability_status TEXT           NOT NULL DEFAULT 'AVAILABLE',
    is_published        BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT properties_type_check
        CHECK (property_type IN ('APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'OFFICE', 'LAND')),

    CONSTRAINT properties_verification_check
        CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED')),

    CONSTRAINT properties_availability_check
        CHECK (availability_status IN ('AVAILABLE', 'RENTED', 'UNAVAILABLE')),

    CONSTRAINT properties_price_positive
        CHECK (rental_price > 0),

    CONSTRAINT properties_bedrooms_non_negative
        CHECK (bedrooms >= 0),

    CONSTRAINT properties_bathrooms_non_negative
        CHECK (bathrooms >= 0),

    CONSTRAINT properties_currency_format
        CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX idx_properties_owner_id            ON properties (owner_id);
CREATE INDEX idx_properties_agent_id            ON properties (agent_id);
CREATE INDEX idx_properties_district            ON properties (district);
CREATE INDEX idx_properties_property_type       ON properties (property_type);
CREATE INDEX idx_properties_availability_status ON properties (availability_status);
CREATE INDEX idx_properties_verification_status ON properties (verification_status);
CREATE INDEX idx_properties_rental_price        ON properties (rental_price);
CREATE INDEX idx_properties_is_published        ON properties (is_published);
CREATE INDEX idx_properties_latlng              ON properties (latitude, longitude)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
