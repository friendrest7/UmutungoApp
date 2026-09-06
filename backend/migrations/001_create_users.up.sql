-- Migration 001 UP: Create users table
-- All authenticated accounts regardless of role.
-- No password column — authentication is handled via Google OAuth.

CREATE TABLE users (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email        TEXT        NOT NULL,
    display_name TEXT        NOT NULL,
    avatar_url   TEXT,
    role         TEXT        NOT NULL DEFAULT 'TENANT',
    is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_role_check
        CHECK (role IN ('TENANT', 'OWNER', 'AGENT', 'ADMIN'))
);

CREATE UNIQUE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role         ON users (role);
