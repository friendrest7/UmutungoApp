-- =============================================================
-- 07_viewings.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- 5 viewing requests from Alice (TENANT) across various properties.
-- Covers all meaningful statuses: COMPLETED, CONFIRMED, PENDING, CANCELLED.
-- The partial unique index on (property_id, tenant_id) WHERE status IN
-- ('PENDING','CONFIRMED') is respected — no two open viewings for the
-- same property+tenant pair.
-- =============================================================

INSERT INTO viewings (
    id, property_id, tenant_id, agent_id,
    requested_at, scheduled_for,
    status, tenant_message, agent_notes,
    created_at, updated_at
)
VALUES

    -- V1: Alice → P1 Kacyiru Apt, managed by Claude → COMPLETED
    (
        '00000004-0000-0000-0000-000000000001',
        '00000002-0000-0000-0000-000000000001',  -- P1
        '00000001-0000-0000-0000-000000000001',  -- Alice
        '00000001-0000-0000-0000-000000000003',  -- Claude
        NOW() - INTERVAL '22 days',
        NOW() - INTERVAL '20 days',
        'COMPLETED',
        'I am interested in the apartment. I would like to see it this Saturday afternoon if possible.',
        'Viewing went well. Tenant is keen. Awaiting decision.',
        NOW() - INTERVAL '22 days',
        NOW() - INTERVAL '20 days'
    ),

    -- V2: Alice → P2 Kimihurura House, managed by Claude → COMPLETED
    (
        '00000004-0000-0000-0000-000000000002',
        '00000002-0000-0000-0000-000000000002',  -- P2
        '00000001-0000-0000-0000-000000000001',  -- Alice
        '00000001-0000-0000-0000-000000000003',  -- Claude
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '13 days',
        'COMPLETED',
        'Hello, I visited the Kacyiru flat and liked it. I would also like to see the Kimihurura house.',
        'Second viewing for same tenant. Very interested, comparing both properties.',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '13 days'
    ),

    -- V3: Alice → P4 Kiyovu Villa, managed by Claude → CONFIRMED (upcoming)
    (
        '00000004-0000-0000-0000-000000000003',
        '00000002-0000-0000-0000-000000000004',  -- P4
        '00000001-0000-0000-0000-000000000001',  -- Alice
        '00000001-0000-0000-0000-000000000003',  -- Claude
        NOW() - INTERVAL '3 days',
        NOW() + INTERVAL '4 days',
        'CONFIRMED',
        'I would love to view the villa. I am available on Wednesday afternoon.',
        'Confirmed for Wednesday 14:00. Advised tenant to bring ID.',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '1 day'
    ),

    -- V4: Alice → P8 Remera House, no agent → PENDING
    (
        '00000004-0000-0000-0000-000000000004',
        '00000002-0000-0000-0000-000000000008',  -- P8
        '00000001-0000-0000-0000-000000000001',  -- Alice
        NULL,                                    -- no agent assigned
        NOW() - INTERVAL '1 day',
        NULL,
        'PENDING',
        'Hello, I am interested in the Remera house. Can we arrange a viewing this week?',
        NULL,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),

    -- V5: Alice → P3 Kicukiro Garden, managed by Claude → CANCELLED
    (
        '00000004-0000-0000-0000-000000000005',
        '00000002-0000-0000-0000-000000000003',  -- P3
        '00000001-0000-0000-0000-000000000001',  -- Alice
        '00000001-0000-0000-0000-000000000003',  -- Claude
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '28 days',
        'CANCELLED',
        'I would like to view this property if available.',
        'Tenant cancelled the day before — said she was considering a different area.',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '28 days'
    )

ON CONFLICT (id) DO NOTHING;
