-- Migration 011 UP: Create commissions table
-- Agent commission records tied to a property and optionally a viewing.

CREATE TABLE commissions (
    id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id     UUID           NOT NULL REFERENCES users (id)      ON DELETE RESTRICT,
    property_id  UUID           NOT NULL REFERENCES properties (id) ON DELETE RESTRICT,
    viewing_id   UUID                    REFERENCES viewings (id)   ON DELETE SET NULL,
    amount       NUMERIC(12, 2) NOT NULL,
    currency     CHAR(3)        NOT NULL DEFAULT 'RWF',
    rate_percent NUMERIC(5, 2),
    status       TEXT           NOT NULL DEFAULT 'PENDING',
    due_date     DATE,
    paid_at      TIMESTAMPTZ,
    notes        TEXT,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT commissions_status_check
        CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'DISPUTED', 'CANCELLED')),

    CONSTRAINT commissions_amount_positive
        CHECK (amount > 0),

    CONSTRAINT commissions_rate_range
        CHECK (rate_percent IS NULL OR rate_percent BETWEEN 0 AND 100),

    CONSTRAINT commissions_paid_requires_paid_status
        CHECK (paid_at IS NULL OR status = 'PAID'),

    CONSTRAINT commissions_currency_format
        CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX idx_commissions_agent_id    ON commissions (agent_id);
CREATE INDEX idx_commissions_property_id ON commissions (property_id);
CREATE INDEX idx_commissions_status      ON commissions (status);
CREATE INDEX idx_commissions_due_date    ON commissions (due_date)
    WHERE due_date IS NOT NULL AND status = 'PENDING';
