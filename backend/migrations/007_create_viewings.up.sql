-- Migration 007 UP: Create viewings table
-- Connects a tenant to a property with optional agent involvement.

CREATE TABLE viewings (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id     UUID        NOT NULL REFERENCES properties (id) ON DELETE RESTRICT,
    tenant_id       UUID        NOT NULL REFERENCES users (id)      ON DELETE RESTRICT,
    agent_id        UUID                 REFERENCES users (id)      ON DELETE SET NULL,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_for   TIMESTAMPTZ,
    status          TEXT        NOT NULL DEFAULT 'PENDING',
    tenant_message  TEXT,
    agent_notes     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT viewings_status_check
        CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'))
);

-- Prevent a tenant from having two open viewings for the same property
CREATE UNIQUE INDEX idx_viewings_no_duplicate_pending
    ON viewings (property_id, tenant_id)
    WHERE status IN ('PENDING', 'CONFIRMED');

CREATE INDEX idx_viewings_property_id   ON viewings (property_id);
CREATE INDEX idx_viewings_tenant_id     ON viewings (tenant_id);
CREATE INDEX idx_viewings_agent_id      ON viewings (agent_id);
CREATE INDEX idx_viewings_status        ON viewings (status);
CREATE INDEX idx_viewings_scheduled_for ON viewings (scheduled_for)
    WHERE scheduled_for IS NOT NULL;
