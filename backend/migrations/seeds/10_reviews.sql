-- =============================================================
-- 10_reviews.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- 2 published reviews from Alice (TENANT) for properties she viewed.
-- Linked to completed viewings V1 and V2.
-- The partial unique index (property_id, tenant_id) WHERE is_published = TRUE
-- is respected — one published review per tenant per property.
-- =============================================================

INSERT INTO reviews (
    id, property_id, tenant_id, viewing_id,
    rating, body,
    is_published,
    created_at, updated_at
)
VALUES

    -- R1: Alice reviews P1 Kacyiru Apartment — 5 stars (linked to V1)
    (
        '00000006-0000-0000-0000-000000000001',
        '00000002-0000-0000-0000-000000000001',  -- P1
        '00000001-0000-0000-0000-000000000001',  -- Alice
        '00000004-0000-0000-0000-000000000001',  -- V1
        5,
        'Exactly as described — bright, clean, and the agent was very professional. '
        'The apartment gets great natural light in the morning and the compound is very secure. '
        'Would recommend to anyone looking for a comfortable place in Kacyiru.',
        TRUE,
        NOW() - INTERVAL '18 days',
        NOW() - INTERVAL '18 days'
    ),

    -- R2: Alice reviews P2 Kimihurura House — 4 stars (linked to V2)
    (
        '00000006-0000-0000-0000-000000000002',
        '00000002-0000-0000-0000-000000000002',  -- P2
        '00000001-0000-0000-0000-000000000001',  -- Alice
        '00000004-0000-0000-0000-000000000002',  -- V2
        4,
        'Beautiful home in a quiet area. Slightly above my budget but worth it for the space. '
        'The garden is a real bonus and the neighbourhood feels very safe. '
        'Claude was helpful and answered all my questions promptly.',
        TRUE,
        NOW() - INTERVAL '11 days',
        NOW() - INTERVAL '11 days'
    )

ON CONFLICT (id) DO NOTHING;
