-- Public search is read frequently and uses partial text matches.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_properties_public_feed
    ON properties (created_at DESC)
    WHERE is_published = TRUE
      AND deleted_at IS NULL
      AND verification_status = 'VERIFIED'
      AND availability_status = 'AVAILABLE';

CREATE INDEX idx_properties_public_title_trgm
    ON properties USING GIN (title gin_trgm_ops);
CREATE INDEX idx_properties_public_description_trgm
    ON properties USING GIN (description gin_trgm_ops);
CREATE INDEX idx_properties_public_district_trgm
    ON properties USING GIN (district gin_trgm_ops);
CREATE INDEX idx_properties_public_neighborhood_trgm
    ON properties USING GIN (neighborhood gin_trgm_ops);

