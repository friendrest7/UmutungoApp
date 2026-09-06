-- =============================================================
-- 08_conversations.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- 3 conversation threads covering the main messaging patterns:
--   C1: Tenant ↔ Agent about P1
--   C2: Tenant ↔ Agent about P2
--   C3: Tenant ↔ Owner about P8
--
-- The CHECK constraint (participant_a_id < participant_b_id) is
-- respected by ordering the UUIDs lexicographically before insert.
--
-- Alice  = '00000001-0000-0000-0000-000000000001'
-- Claude = '00000001-0000-0000-0000-000000000003'
-- Emmanuel = '00000001-0000-0000-0000-000000000002'
--
-- Lexicographic order:
--   Alice < Claude   → Alice is participant_a in C1, C2
--   Alice < Emmanuel → Alice is participant_a in C3
-- =============================================================

INSERT INTO conversations (
    id,
    participant_a_id,
    participant_b_id,
    property_id,
    created_at,
    last_message_at
)
VALUES

    -- C1: Alice ↔ Claude about P1 (Kacyiru Apartment)
    (
        '00000005-0000-0000-0000-000000000001',
        '00000001-0000-0000-0000-000000000001',  -- Alice  (a < c lexicographically)
        '00000001-0000-0000-0000-000000000003',  -- Claude
        '00000002-0000-0000-0000-000000000001',  -- P1
        NOW() - INTERVAL '24 days',
        NOW() - INTERVAL '22 days'
    ),

    -- C2: Alice ↔ Claude about P2 (Kimihurura House)
    (
        '00000005-0000-0000-0000-000000000002',
        '00000001-0000-0000-0000-000000000001',  -- Alice
        '00000001-0000-0000-0000-000000000003',  -- Claude
        '00000002-0000-0000-0000-000000000002',  -- P2
        NOW() - INTERVAL '16 days',
        NOW() - INTERVAL '14 days'
    ),

    -- C3: Alice ↔ Emmanuel about P8 (Remera House)
    (
        '00000005-0000-0000-0000-000000000003',
        '00000001-0000-0000-0000-000000000001',  -- Alice  (a < b lexicographically? check below)
        '00000001-0000-0000-0000-000000000002',  -- Emmanuel
        '00000002-0000-0000-0000-000000000008',  -- P8
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day'
    )

ON CONFLICT (id) DO NOTHING;
