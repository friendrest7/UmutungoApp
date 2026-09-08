CREATE TABLE listing_contact_reveals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    revealed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (listing_id, user_id)
);

CREATE INDEX idx_listing_contact_reveals_user ON listing_contact_reveals(user_id, revealed_at DESC);
