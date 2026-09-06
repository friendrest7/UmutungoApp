-- =============================================================
-- 03_properties.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- 8 demo properties in Kigali.
-- All owned by Emmanuel Habimana (owner@inzuhub.demo).
-- Properties P1–P5 are managed by Claude Nkurunziza (agent).
-- Properties P6–P8 have no assigned agent.
-- Mix of verification/availability statuses.
-- =============================================================

-- Shorthand references to demo user UUIDs
-- owner_id  = '00000001-0000-0000-0000-000000000002' (Emmanuel)
-- agent_id  = '00000001-0000-0000-0000-000000000003' (Claude)

INSERT INTO properties (
    id, owner_id, agent_id,
    title, description,
    property_type, rental_price, currency,
    bedrooms, bathrooms,
    address_line, neighborhood, district, sector,
    latitude, longitude,
    verification_status, availability_status, is_published,
    created_at, updated_at
)
VALUES

    -- P1: Light-filled apartment in Kacyiru (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000001',
        '00000001-0000-0000-0000-000000000002',
        '00000001-0000-0000-0000-000000000003',
        'Light-filled apartment in Kacyiru',
        'A bright and modern 2-bedroom apartment on the second floor of a secure compound in Kacyiru. '
        'Features tiled floors, reliable running water, and Wi-Fi ready infrastructure. '
        'Walking distance to embassies, restaurants, and public transport.',
        'APARTMENT', 420000.00, 'RWF',
        2, 1,
        'KG 5 Ave, Kacyiru', 'Kacyiru', 'Gasabo', 'Kacyiru',
        -1.944100, 30.061900,
        'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '45 days', NOW() - INTERVAL '2 days'
    ),

    -- P2: Quiet family home near town (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000002',
        '00000001-0000-0000-0000-000000000002',
        '00000001-0000-0000-0000-000000000003',
        'Quiet family home near town',
        'A well-maintained 3-bedroom family home in the calm residential streets of Kimihurura. '
        'The property includes a covered parking space, security guard, generator backup, '
        'and a small outdoor sitting area. Close to schools and supermarkets.',
        'HOUSE', 650000.00, 'RWF',
        3, 2,
        'KG 12 St, Kimihurura', 'Kimihurura', 'Gasabo', 'Kimihurura',
        -1.958600, 30.074200,
        'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '40 days', NOW() - INTERVAL '3 days'
    ),

    -- P3: Modern home with a private garden (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000003',
        '00000001-0000-0000-0000-000000000002',
        '00000001-0000-0000-0000-000000000003',
        'Modern home with a private garden',
        'Spacious 3-bedroom house in Gikondo with a beautifully kept private garden. '
        'Ideal for families looking for outdoor space without leaving the city. '
        'Security, parking, and Wi-Fi infrastructure included.',
        'HOUSE', 550000.00, 'RWF',
        3, 2,
        'KK 15 Ave, Gikondo', 'Gikondo', 'Kicukiro', 'Gikondo',
        -1.976900, 30.066900,
        'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '35 days', NOW() - INTERVAL '4 days'
    ),

    -- P4: Executive villa in Kiyovu (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000004',
        '00000001-0000-0000-0000-000000000002',
        '00000001-0000-0000-0000-000000000003',
        'Executive villa in Kiyovu',
        'A prestigious 4-bedroom executive villa in the upmarket Kiyovu neighbourhood. '
        'Features include a swimming pool, CCTV security system, air conditioning, '
        'generator backup, borehole water supply, and a large landscaped garden. '
        'Ideal for diplomats, senior executives, or families seeking premium living.',
        'VILLA', 1200000.00, 'RWF',
        4, 3,
        'KN 3 Ave, Kiyovu', 'Kiyovu', 'Nyarugenge', 'Kiyovu',
        -1.955400, 30.058700,
        'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '50 days', NOW() - INTERVAL '1 day'
    ),

    -- P5: Cosy studio near university (VERIFIED, RENTED)
    (
        '00000002-0000-0000-0000-000000000005',
        '00000001-0000-0000-0000-000000000002',
        '00000001-0000-0000-0000-000000000003',
        'Cosy studio near university',
        'A compact and affordable studio apartment in Nyamirambo, close to the University '
        'of Rwanda and public transport hubs. Suitable for students or young professionals. '
        'Running water and inside toilet included.',
        'STUDIO', 180000.00, 'RWF',
        1, 1,
        'KN 47 St, Nyamirambo', 'Nyamirambo', 'Nyarugenge', 'Nyamirambo',
        -1.970500, 30.041500,
        'VERIFIED', 'RENTED', TRUE,
        NOW() - INTERVAL '60 days', NOW() - INTERVAL '10 days'
    ),

    -- P6: Spacious 4BR house in Kibagabaga (PENDING, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000006',
        '00000001-0000-0000-0000-000000000002',
        NULL,
        'Spacious 4-bedroom house in Kibagabaga',
        'A large 4-bedroom house in the growing Kibagabaga neighbourhood of Gasabo district. '
        'Recently renovated with tiled floors and inside toilets. Verification in progress. '
        'Good road access and proximity to local markets.',
        'HOUSE', 850000.00, 'RWF',
        4, 3,
        'KG 33 Ave, Kibagabaga', 'Kibagabaga', 'Gasabo', 'Kibagabaga',
        -1.933600, 30.100100,
        'PENDING', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day'
    ),

    -- P7: Budget apartment in Gikondo (UNVERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000007',
        '00000001-0000-0000-0000-000000000002',
        NULL,
        'Budget apartment in Gikondo',
        'An affordable 1-bedroom apartment in Gikondo, suitable for singles or couples. '
        'Basic amenities including running water and inside toilet. '
        'Listing is pending full verification by InzuHub.',
        'APARTMENT', 280000.00, 'RWF',
        1, 1,
        'KK 8 St, Gikondo', 'Gikondo', 'Kicukiro', 'Gikondo',
        -1.976900, 30.066900,
        'UNVERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'
    ),

    -- P8: Three-bedroom house in Remera (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000008',
        '00000001-0000-0000-0000-000000000002',
        NULL,
        'Three-bedroom house in Remera',
        'A comfortable 3-bedroom house in Remera, conveniently located near the airport road, '
        'supermarkets, and public transport. Features Wi-Fi infrastructure, parking, '
        'security, and tiled floors throughout.',
        'HOUSE', 620000.00, 'RWF',
        3, 2,
        'KG 9 Ave, Remera', 'Remera', 'Gasabo', 'Remera',
        -1.950100, 30.089200,
        'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days'
    )

ON CONFLICT (id) DO NOTHING;
