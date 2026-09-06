-- Migration 002 UP: Create google_accounts table
-- Links a Google OAuth identity to a platform user account.
-- Deduplication logic:
--   1. Look up by google_sub → if found, return existing user
--   2. Look up by email      → if found, link this Google identity to existing user
--   3. Neither found         → create new user + new google_account row

CREATE TABLE google_accounts (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    google_sub     TEXT        NOT NULL,   -- stable Google subject identifier
    email          TEXT        NOT NULL,   -- email reported by Google token
    avatar_url     TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT google_accounts_sub_unique UNIQUE (google_sub)
);

CREATE INDEX idx_google_accounts_user_id    ON google_accounts (user_id);
CREATE INDEX idx_google_accounts_google_sub ON google_accounts (google_sub);
