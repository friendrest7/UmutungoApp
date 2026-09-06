-- =============================================================
-- 11_commissions.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- 4 commission records for Claude (AGENT) covering all statuses:
--   CM1: PAID     — P1, viewing completed and commission settled
--   CM2: APPROVED — P2, viewing completed, payment pending
--   CM3: PENDING  — P4, viewing confirmed but not yet completed
--   CM4: CANCELLED — P3, viewing was cancelled
--
-- Rate: 8% of one month's rent (standard Rwanda agent commission).
-- =============================================================

INSERT INTO commissions (
    id, agent_id, property_id, viewing_id,
    amount, currency, rate_percent,
    status, due_date, paid_at, notes,
    created_at, updated_at
)
VALUES

    -- CM1: P1 Kacyiru Apartment — PAID
    -- 8% of 420,000 RWF = 33,600 RWF
    (
        '00000007-0000-0000-0000-000000000001',
        '00000001-0000-0000-0000-000000000003',  -- Claude
        '00000002-0000-0000-0000-000000000001',  -- P1
        '00000004-0000-0000-0000-000000000001',  -- V1
        33600.00, 'RWF', 8.00,
        'PAID',
        (NOW() - INTERVAL '15 days')::DATE,
        NOW() - INTERVAL '12 days',
        'Commission for Kacyiru apartment rental. One month rent basis at 8%.',
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '12 days'
    ),

    -- CM2: P2 Kimihurura House — APPROVED (awaiting payment)
    -- 8% of 650,000 RWF = 52,000 RWF
    (
        '00000007-0000-0000-0000-000000000002',
        '00000001-0000-0000-0000-000000000003',  -- Claude
        '00000002-0000-0000-0000-000000000002',  -- P2
        '00000004-0000-0000-0000-000000000002',  -- V2
        52000.00, 'RWF', 8.00,
        'APPROVED',
        (NOW() + INTERVAL '5 days')::DATE,
        NULL,
        'Commission approved by owner. Payment due end of week.',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '2 days'
    ),

    -- CM3: P4 Kiyovu Villa — PENDING (viewing not yet completed)
    -- 8% of 1,200,000 RWF = 96,000 RWF
    (
        '00000007-0000-0000-0000-000000000003',
        '00000001-0000-0000-0000-000000000003',  -- Claude
        '00000002-0000-0000-0000-000000000004',  -- P4
        '00000004-0000-0000-0000-000000000003',  -- V3
        96000.00, 'RWF', 8.00,
        'PENDING',
        NULL,
        NULL,
        'Commission record created on viewing confirmation. Awaiting viewing completion.',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),

    -- CM4: P3 Kicukiro Garden Home — CANCELLED
    -- Amount recorded as minimum fee; actual amount was waived on cancellation
    (
        '00000007-0000-0000-0000-000000000004',
        '00000001-0000-0000-0000-000000000003',  -- Claude
        '00000002-0000-0000-0000-000000000003',  -- P3
        '00000004-0000-0000-0000-000000000005',  -- V5
        5000.00, 'RWF', 8.00,
        'CANCELLED',
        NULL,
        NULL,
        'Viewing was cancelled by tenant before completion. Commission record voided.',
        NOW() - INTERVAL '28 days',
        NOW() - INTERVAL '28 days'
    )

ON CONFLICT (id) DO NOTHING;
