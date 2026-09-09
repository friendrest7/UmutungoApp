-- =============================================================
-- 00_truncate.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- Clears all application data before re-seeding.
-- Requires explicit development session settings and is blocked otherwise.
-- =============================================================

DO $$
BEGIN
  -- Fail closed unless the caller explicitly identifies a development session.
  IF current_setting('app.env', true) IS DISTINCT FROM 'development'
     OR current_setting('app.umutungo_seed_allowed', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION
      'Seed truncate REFUSED: set app.env=development and '
      'app.umutungo_seed_allowed=true explicitly for local demo seeding.';
  END IF;
END
$$;

-- Truncate in reverse dependency order so FK constraints are satisfied
TRUNCATE TABLE
    commissions,
    reviews,
    messages,
    conversations,
    viewings,
    property_amenities,
    property_images,
    properties,
    google_accounts,
    users
RESTART IDENTITY CASCADE;

-- NOTE: amenities catalogue is NOT truncated here.
-- It is managed by migration 012 and re-upserted by 05_amenities.sql.
