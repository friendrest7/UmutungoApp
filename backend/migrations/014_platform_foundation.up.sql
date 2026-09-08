-- Platform foundation for account, lifecycle, trust, engagement and payment domains.
-- Additive migration: preserves existing MVP tables and rows.

ALTER TABLE users
    ADD COLUMN phone TEXT,
    ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN bio TEXT,
    ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
    ADD COLUMN suspended_at TIMESTAMPTZ,
    ADD COLUMN suspended_reason TEXT;

ALTER TABLE users
    ADD CONSTRAINT users_verification_status_check
    CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'));

CREATE UNIQUE INDEX idx_users_phone ON users (phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_verification_status ON users (verification_status);

CREATE TABLE otp_challenges (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone          TEXT NOT NULL,
    purpose        TEXT NOT NULL,
    code_hash      TEXT NOT NULL,
    expires_at     TIMESTAMPTZ NOT NULL,
    consumed_at    TIMESTAMPTZ,
    attempt_count  SMALLINT NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT otp_purpose_check CHECK (purpose IN ('REGISTER', 'LOGIN', 'PHONE_VERIFY', 'PASSWORD_RESET')),
    CONSTRAINT otp_attempt_count_check CHECK (attempt_count >= 0)
);
CREATE INDEX idx_otp_challenges_phone_purpose ON otp_challenges (phone, purpose, created_at DESC);

CREATE TABLE role_upgrade_requests (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_role TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'PENDING',
    reason       TEXT,
    reviewed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT role_upgrade_role_check CHECK (requested_role IN ('OWNER', 'AGENT')),
    CONSTRAINT role_upgrade_status_check CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'MORE_INFO'))
);
CREATE UNIQUE INDEX idx_role_upgrade_one_pending ON role_upgrade_requests(user_id, requested_role) WHERE status = 'PENDING';

CREATE TABLE kyc_submissions (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type         TEXT NOT NULL,
    document_reference    TEXT,
    physical_address      TEXT NOT NULL,
    status                TEXT NOT NULL DEFAULT 'PENDING',
    submitted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by           UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at           TIMESTAMPTZ,
    review_reason         TEXT,
    CONSTRAINT kyc_document_type_check CHECK (document_type IN ('NATIONAL_ID', 'RDB_BUSINESS_REGISTRATION', 'OTHER_CONFIGURED')),
    CONSTRAINT kyc_status_check CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'MORE_INFO')),
    CONSTRAINT kyc_address_not_empty CHECK (length(trim(physical_address)) >= 5)
);
CREATE INDEX idx_kyc_submissions_user ON kyc_submissions(user_id, submitted_at DESC);
CREATE INDEX idx_kyc_submissions_queue ON kyc_submissions(status, submitted_at ASC);

CREATE TABLE kyc_documents (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id  UUID NOT NULL REFERENCES kyc_submissions(id) ON DELETE CASCADE,
    storage_key    TEXT NOT NULL,
    original_name  TEXT,
    mime_type      TEXT NOT NULL,
    byte_size      BIGINT NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT kyc_document_size_check CHECK (byte_size > 0 AND byte_size <= 10485760)
);
CREATE INDEX idx_kyc_documents_submission ON kyc_documents(submission_id);

CREATE TABLE rwanda_locations (
    code        TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    admin_level TEXT NOT NULL,
    parent_code TEXT REFERENCES rwanda_locations(code) ON DELETE RESTRICT,
    CONSTRAINT rwanda_location_level_check CHECK (admin_level IN ('PROVINCE', 'DISTRICT', 'SECTOR', 'CELL', 'VILLAGE')),
    UNIQUE (parent_code, name)
);
CREATE INDEX idx_rwanda_locations_parent ON rwanda_locations(parent_code, admin_level);

ALTER TABLE properties
    ADD COLUMN listing_type TEXT NOT NULL DEFAULT 'RENT',
    ADD COLUMN province_code TEXT,
    ADD COLUMN district_code TEXT,
    ADD COLUMN sector_code TEXT,
    ADD COLUMN cell_code TEXT,
    ADD COLUMN village_code TEXT,
    ADD COLUMN tags TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN preferred_contact_method TEXT NOT NULL DEFAULT 'BOTH',
    ADD COLUMN scheduled_for TIMESTAMPTZ,
    ADD COLUMN published_at TIMESTAMPTZ,
    ADD COLUMN expires_at TIMESTAMPTZ,
    ADD COLUMN deleted_at TIMESTAMPTZ,
    ADD COLUMN deleted_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE properties
    ADD CONSTRAINT properties_listing_type_check CHECK (listing_type IN ('SALE', 'RENT', 'BOOK')),
    ADD CONSTRAINT properties_contact_method_check CHECK (preferred_contact_method IN ('PHONE', 'MESSAGE', 'BOTH')),
    ADD CONSTRAINT properties_location_hierarchy_check CHECK (
        (province_code IS NULL AND district_code IS NULL AND sector_code IS NULL AND cell_code IS NULL AND village_code IS NULL)
        OR district_code IS NOT NULL
    );

ALTER TABLE properties
    ADD CONSTRAINT properties_province_fk FOREIGN KEY (province_code) REFERENCES rwanda_locations(code),
    ADD CONSTRAINT properties_district_fk FOREIGN KEY (district_code) REFERENCES rwanda_locations(code),
    ADD CONSTRAINT properties_sector_fk FOREIGN KEY (sector_code) REFERENCES rwanda_locations(code),
    ADD CONSTRAINT properties_cell_fk FOREIGN KEY (cell_code) REFERENCES rwanda_locations(code),
    ADD CONSTRAINT properties_village_fk FOREIGN KEY (village_code) REFERENCES rwanda_locations(code);

CREATE INDEX idx_properties_lifecycle ON properties(is_published, scheduled_for, expires_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_location_codes ON properties(province_code, district_code, sector_code, cell_code, village_code);
CREATE INDEX idx_properties_tags ON properties USING GIN(tags);

ALTER TABLE property_images
    ADD COLUMN media_type TEXT NOT NULL DEFAULT 'IMAGE',
    ADD COLUMN mime_type TEXT,
    ADD COLUMN byte_size BIGINT,
    ADD COLUMN storage_key TEXT;

ALTER TABLE property_images
    ADD CONSTRAINT property_media_type_check CHECK (media_type IN ('IMAGE', 'VIDEO')),
    ADD CONSTRAINT property_media_size_check CHECK (byte_size IS NULL OR (byte_size > 0 AND byte_size <= 52428800));

CREATE TABLE subscription_plans (
    code                 TEXT PRIMARY KEY,
    display_name         TEXT NOT NULL,
    monthly_price        NUMERIC(12,2),
    currency             CHAR(3) NOT NULL DEFAULT 'RWF',
    listing_expiry_days  INTEGER,
    monthly_post_cap     INTEGER,
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT subscription_plan_code_check CHECK (code IN ('SILVER', 'GOLD', 'PLATINUM', 'AGENT_PREMIUM')),
    CONSTRAINT subscription_plan_price_check CHECK (monthly_price IS NULL OR monthly_price >= 0),
    CONSTRAINT subscription_plan_expiry_check CHECK (listing_expiry_days IS NULL OR listing_expiry_days > 0),
    CONSTRAINT subscription_plan_cap_check CHECK (monthly_post_cap IS NULL OR monthly_post_cap >= 0)
);

INSERT INTO subscription_plans (code, display_name, listing_expiry_days, monthly_post_cap)
VALUES
    ('SILVER', 'Silver', 90, NULL),
    ('GOLD', 'Gold', 180, NULL),
    ('PLATINUM', 'Platinum', 365, NULL),
    ('AGENT_PREMIUM', 'Komisiyoneri premium', NULL, NULL)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE subscriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    plan_code           TEXT NOT NULL REFERENCES subscription_plans(code),
    status              TEXT NOT NULL DEFAULT 'PENDING',
    provider_reference  TEXT,
    starts_at           TIMESTAMPTZ,
    ends_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT subscription_status_check CHECK (status IN ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'FAILED'))
);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status, ends_at DESC);

CREATE TABLE listing_interactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT interaction_kind_check CHECK (kind IN ('LIKE', 'FAVORITE')),
    UNIQUE (listing_id, user_id, kind)
);
CREATE INDEX idx_listing_interactions_listing ON listing_interactions(listing_id, kind);
CREATE INDEX idx_listing_interactions_user ON listing_interactions(user_id, kind);

CREATE TABLE comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    body        TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'VISIBLE',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT comment_body_check CHECK (length(trim(body)) BETWEEN 1 AND 2000),
    CONSTRAINT comment_status_check CHECK (status IN ('VISIBLE', 'HIDDEN', 'REMOVED'))
);
CREATE INDEX idx_comments_listing_created ON comments(listing_id, created_at DESC);

CREATE TABLE saved_searches (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    filters     JSONB NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_saved_searches_user_active ON saved_searches(user_id, is_active);

CREATE TABLE bookings (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id   UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    client_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    host_id      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    check_in     DATE NOT NULL,
    check_out    DATE NOT NULL,
    guest_count  INTEGER NOT NULL,
    status       TEXT NOT NULL DEFAULT 'REQUESTED',
    note         TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT booking_dates_check CHECK (check_out > check_in),
    CONSTRAINT booking_guest_count_check CHECK (guest_count > 0),
    CONSTRAINT booking_status_check CHECK (status IN ('REQUESTED', 'CONFIRMED', 'DECLINED', 'CANCELLED', 'COMPLETED'))
);
CREATE INDEX idx_bookings_client ON bookings(client_id, created_at DESC);
CREATE INDEX idx_bookings_host ON bookings(host_id, created_at DESC);
CREATE INDEX idx_bookings_listing_dates ON bookings(listing_id, check_in, check_out);

CREATE TABLE reports (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    listing_id     UUID REFERENCES properties(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category       TEXT NOT NULL,
    details        TEXT,
    status         TEXT NOT NULL DEFAULT 'OPEN',
    reviewed_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT report_target_check CHECK (listing_id IS NOT NULL OR reported_user_id IS NOT NULL),
    CONSTRAINT report_category_check CHECK (category IN ('FRAUD', 'DUPLICATE', 'SOLD_UNAVAILABLE', 'OFFENSIVE_CONTENT', 'INCORRECT_INFORMATION', 'OTHER')),
    CONSTRAINT report_status_check CHECK (status IN ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'))
);
CREATE INDEX idx_reports_queue ON reports(status, created_at ASC);

CREATE TABLE moderation_actions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    resource_type  TEXT NOT NULL,
    resource_id    UUID NOT NULL,
    action         TEXT NOT NULL,
    reason         TEXT,
    before_state   JSONB,
    after_state    JSONB,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_moderation_actions_resource ON moderation_actions(resource_type, resource_id, created_at DESC);

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind        TEXT NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    data        JSONB NOT NULL DEFAULT '{}',
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

CREATE TABLE notification_preferences (
    user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    push_enabled            BOOLEAN NOT NULL DEFAULT TRUE,
    sms_enabled             BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled           BOOLEAN NOT NULL DEFAULT TRUE,
    marketing_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    subscription_id     UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    booking_id          UUID REFERENCES bookings(id) ON DELETE SET NULL,
    purpose             TEXT NOT NULL,
    provider            TEXT NOT NULL,
    provider_reference  TEXT,
    amount              NUMERIC(12,2) NOT NULL,
    currency            CHAR(3) NOT NULL DEFAULT 'RWF',
    status              TEXT NOT NULL DEFAULT 'PENDING',
    receipt_number      TEXT UNIQUE,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at        TIMESTAMPTZ,
    CONSTRAINT payment_purpose_check CHECK (purpose IN ('SUBSCRIPTION', 'BOOKING_DEPOSIT', 'BOOST', 'AGENT_PREMIUM')),
    CONSTRAINT payment_provider_check CHECK (provider IN ('MTN_MOMO', 'AIRTEL_MONEY', 'CARD')),
    CONSTRAINT payment_status_check CHECK (status IN ('PENDING', 'SUCCESSFUL', 'FAILED', 'CANCELLED')),
    CONSTRAINT payment_amount_check CHECK (amount > 0)
);
CREATE INDEX idx_payments_user_created ON payments(user_id, created_at DESC);
CREATE UNIQUE INDEX idx_payments_provider_reference ON payments(provider, provider_reference) WHERE provider_reference IS NOT NULL;

CREATE TABLE support_requests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    email       TEXT,
    subject     TEXT NOT NULL,
    message     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'OPEN',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT support_status_check CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
);

CREATE TABLE audit_logs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    action         TEXT NOT NULL,
    resource_type  TEXT NOT NULL,
    resource_id    UUID,
    before_state   JSONB,
    after_state    JSONB,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
