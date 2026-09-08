ALTER TABLE otp_challenges
    ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}';
