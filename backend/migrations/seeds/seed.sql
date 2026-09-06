-- =============================================================
-- InzuHub — Master Seed Script
-- DEVELOPMENT / DEMO DATA ONLY — NOT FOR PRODUCTION USE
--
-- Usage:
--   psql "$DATABASE_URL" -f migrations/seeds/seed.sql
--
-- This script is idempotent. Running it multiple times will NOT
-- create duplicate records. All inserts use ON CONFLICT DO NOTHING
-- or ON CONFLICT DO UPDATE keyed on stable deterministic UUIDs.
-- =============================================================

\echo '=== InzuHub seed: starting ==='
\echo ''

-- Safety guard: refuse to run truncation in production
\i migrations/seeds/00_truncate.sql

\echo '[1/11] users...'
\i migrations/seeds/01_users.sql

\echo '[2/11] google_accounts (intentionally empty for demo users)...'
\i migrations/seeds/02_google_accounts.sql

\echo '[3/11] properties...'
\i migrations/seeds/03_properties.sql

\echo '[4/11] property_images...'
\i migrations/seeds/04_property_images.sql

\echo '[5/11] amenities catalogue...'
\i migrations/seeds/05_amenities.sql

\echo '[6/11] property_amenities...'
\i migrations/seeds/06_property_amenities.sql

\echo '[7/11] viewings...'
\i migrations/seeds/07_viewings.sql

\echo '[8/11] conversations...'
\i migrations/seeds/08_conversations.sql

\echo '[9/11] messages...'
\i migrations/seeds/09_messages.sql

\echo '[10/11] reviews...'
\i migrations/seeds/10_reviews.sql

\echo '[11/11] commissions...'
\i migrations/seeds/11_commissions.sql

\echo ''
\echo '=== InzuHub seed: complete ==='
\echo ''
\echo 'Demo accounts:'
\echo '  tenant@inzuhub.demo  — TENANT  (Alice Uwase)'
\echo '  owner@inzuhub.demo   — OWNER   (Emmanuel Habimana)'
\echo '  agent@inzuhub.demo   — AGENT   (Claude Nkurunziza)'
\echo '  admin@inzuhub.demo   — ADMIN   (InzuHub Admin)'
