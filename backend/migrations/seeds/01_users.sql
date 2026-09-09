-- =============================================================
-- 01_users.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- Inserts one demo user for each application role.
-- UUIDs are stable and hardcoded so cross-script references work.
-- No password hashes. No Google OAuth credentials.
-- Development-only password authentication uses the frontend's bcrypt hash
-- environment variable and these stable seeded identities.
-- =============================================================

INSERT INTO users (id, email, display_name, avatar_url, role, is_active, created_at, updated_at)
VALUES
    -- TENANT: Alice Uwase
    (
        '00000001-0000-0000-0000-000000000001',
        'tenant@umutungo.demo',
        'Alice Uwase',
        NULL,
        'TENANT',
        TRUE,
        NOW() - INTERVAL '60 days',
        NOW() - INTERVAL '1 day'
    ),

    -- OWNER: Emmanuel Habimana
    (
        '00000001-0000-0000-0000-000000000002',
        'owner@umutungo.demo',
        'Emmanuel Habimana',
        NULL,
        'OWNER',
        TRUE,
        NOW() - INTERVAL '90 days',
        NOW() - INTERVAL '5 days'
    ),

    -- AGENT: Claude Nkurunziza
    (
        '00000001-0000-0000-0000-000000000003',
        'agent@umutungo.demo',
        'Claude Nkurunziza',
        NULL,
        'AGENT',
        TRUE,
        NOW() - INTERVAL '90 days',
        NOW() - INTERVAL '2 days'
    ),

    -- ADMIN: UmutungoApp Admin
    (
        '00000001-0000-0000-0000-000000000004',
        'admin@umutungo.demo',
        'UmutungoApp Admin',
        NULL,
        'ADMIN',
        TRUE,
        NOW() - INTERVAL '120 days',
        NOW()
    )

ON CONFLICT (email) DO NOTHING;
