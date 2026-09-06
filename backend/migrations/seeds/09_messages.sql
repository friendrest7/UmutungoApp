-- =============================================================
-- 09_messages.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- 12 demo messages across 3 conversation threads.
--   C1 (Alice ↔ Claude, P1): 5 messages
--   C2 (Alice ↔ Claude, P2): 4 messages
--   C3 (Alice ↔ Emmanuel, P8): 3 messages
-- =============================================================

INSERT INTO messages (
    id, conversation_id, sender_id,
    body, is_read, created_at
)
VALUES

    -- ── C1: Alice ↔ Claude about Kacyiru Apartment ─────────────

    (
        '00000008-0000-0000-0000-000000000001',
        '00000005-0000-0000-0000-000000000001',  -- C1
        '00000001-0000-0000-0000-000000000001',  -- Alice
        'Hello, I am interested in the Kacyiru apartment. Is it still available?',
        TRUE,
        NOW() - INTERVAL '24 days'
    ),
    (
        '00000008-0000-0000-0000-000000000002',
        '00000005-0000-0000-0000-000000000001',  -- C1
        '00000001-0000-0000-0000-000000000003',  -- Claude
        'Hello Alice! Yes, it is still available. Would you like to schedule a viewing this week?',
        TRUE,
        NOW() - INTERVAL '24 days' + INTERVAL '2 hours'
    ),
    (
        '00000008-0000-0000-0000-000000000003',
        '00000005-0000-0000-0000-000000000001',  -- C1
        '00000001-0000-0000-0000-000000000001',  -- Alice
        'That would be great. I am free on Saturday afternoon.',
        TRUE,
        NOW() - INTERVAL '23 days'
    ),
    (
        '00000008-0000-0000-0000-000000000004',
        '00000005-0000-0000-0000-000000000001',  -- C1
        '00000001-0000-0000-0000-000000000003',  -- Claude
        'Perfect. I will confirm Saturday at 14:00. Please bring your national ID or passport.',
        TRUE,
        NOW() - INTERVAL '23 days' + INTERVAL '1 hour'
    ),
    (
        '00000008-0000-0000-0000-000000000005',
        '00000005-0000-0000-0000-000000000001',  -- C1
        '00000001-0000-0000-0000-000000000001',  -- Alice
        'Thank you, Claude! See you on Saturday.',
        TRUE,
        NOW() - INTERVAL '23 days' + INTERVAL '3 hours'
    ),

    -- ── C2: Alice ↔ Claude about Kimihurura House ──────────────

    (
        '00000008-0000-0000-0000-000000000006',
        '00000005-0000-0000-0000-000000000002',  -- C2
        '00000001-0000-0000-0000-000000000001',  -- Alice
        'Hi Claude, I visited the Kacyiru flat last week and really liked it. '
        'I would also love to see the Kimihurura house.',
        TRUE,
        NOW() - INTERVAL '16 days'
    ),
    (
        '00000008-0000-0000-0000-000000000007',
        '00000005-0000-0000-0000-000000000002',  -- C2
        '00000001-0000-0000-0000-000000000003',  -- Claude
        'Great to hear, Alice! The Kimihurura house is a wonderful property. '
        'The owner is very flexible on the move-in date.',
        TRUE,
        NOW() - INTERVAL '16 days' + INTERVAL '30 minutes'
    ),
    (
        '00000008-0000-0000-0000-000000000008',
        '00000005-0000-0000-0000-000000000002',  -- C2
        '00000001-0000-0000-0000-000000000001',  -- Alice
        'What is included in the rent? Is water and security covered?',
        TRUE,
        NOW() - INTERVAL '15 days'
    ),
    (
        '00000008-0000-0000-0000-000000000009',
        '00000005-0000-0000-0000-000000000002',  -- C2
        '00000001-0000-0000-0000-000000000003',  -- Claude
        'Yes — running water, 24-hour security, and covered parking are all included in the rent. '
        'The generator also kicks in during power cuts at no extra charge.',
        TRUE,
        NOW() - INTERVAL '15 days' + INTERVAL '45 minutes'
    ),

    -- ── C3: Alice ↔ Emmanuel about Remera House ────────────────

    (
        '00000008-0000-0000-0000-000000000010',
        '00000005-0000-0000-0000-000000000003',  -- C3
        '00000001-0000-0000-0000-000000000001',  -- Alice
        'Hello, I saw the Remera listing on InzuHub. Can you tell me more about the neighbourhood?',
        TRUE,
        NOW() - INTERVAL '2 days'
    ),
    (
        '00000008-0000-0000-0000-000000000011',
        '00000005-0000-0000-0000-000000000003',  -- C3
        '00000001-0000-0000-0000-000000000002',  -- Emmanuel
        'Hello Alice! Remera is a very convenient area — close to the airport road, '
        'MTN Centre, and several supermarkets. The street is quiet but well connected.',
        TRUE,
        NOW() - INTERVAL '2 days' + INTERVAL '3 hours'
    ),
    (
        '00000008-0000-0000-0000-000000000012',
        '00000005-0000-0000-0000-000000000003',  -- C3
        '00000001-0000-0000-0000-000000000001',  -- Alice
        'Thank you! Is the price at all negotiable if I sign a 12-month lease?',
        FALSE,  -- unread — Emmanuel has not replied yet
        NOW() - INTERVAL '1 day'
    )

ON CONFLICT (id) DO NOTHING;
