-- Allow accounts to authenticate with an email and password.
-- Existing Google/phone accounts remain valid because this is nullable.
ALTER TABLE users ADD COLUMN password_hash TEXT;

