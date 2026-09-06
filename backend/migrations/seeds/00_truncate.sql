-- =============================================================
-- 00_truncate.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- Clears all application data before re-seeding.
-- Protected by a production environment guard.
-- =============================================================

DO $$
BEGIN
  -- Block execution if running against a production database
  IF current_setting('app.env', true) = 'production' THEN
    RAISE EXCEPTION
      'Seed truncate REFUSED: app.env is set to "production". '
      'This script must never run against a production database.';
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
