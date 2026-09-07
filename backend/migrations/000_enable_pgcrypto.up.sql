-- Migration 000 UP: Enable UUID generation used by the schema.
-- Supabase provides pgcrypto, but the migration declares this dependency
-- explicitly so an empty PostgreSQL database is prepared deterministically.

CREATE EXTENSION IF NOT EXISTS pgcrypto;