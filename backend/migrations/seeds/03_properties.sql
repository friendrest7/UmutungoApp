-- =============================================================
-- 03_properties.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- 28 demo properties across Rwanda.
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
    ),

    -- P9: Family house in Kicukiro (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000009',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Bright family house in Kicukiro',
        'A spacious four-bedroom family house with a secure compound, parking, and a quiet garden near schools and public transport.',
        'HOUSE', 720000.00, 'RWF',
        4, 2, 'KK 28 Ave, Niboye', 'Niboye', 'Kicukiro', 'Niboye',
        -1.984000, 30.103000, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '18 days', NOW() - INTERVAL '2 days'
    ),

    -- P10: Affordable apartment in Nyarugenge (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000010',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Modern apartment near Kigali City Centre',
        'A clean two-bedroom apartment with reliable water, tiled floors, and easy access to shops and public transport.',
        'APARTMENT', 380000.00, 'RWF',
        2, 1, 'KN 7 St, Kiyovu', 'Kiyovu', 'Nyarugenge', 'Nyarugenge',
        -1.953600, 30.060500, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '16 days', NOW() - INTERVAL '2 days'
    ),

    -- P11: Premium villa in Gasabo (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000011',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Executive five-bedroom villa in Nyarutarama',
        'A premium villa with a private garden, staff quarters, secure parking, and panoramic Kigali views.',
        'VILLA', 1500000.00, 'RWF',
        5, 4, 'KG 9 Ave, Nyarutarama', 'Nyarutarama', 'Gasabo', 'Remera',
        -1.936000, 30.098200, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days'
    ),

    -- P12: Student studio in Huye (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000012',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Furnished student studio in Huye',
        'A compact furnished studio close to the university, shops, and everyday transport.',
        'STUDIO', 220000.00, 'RWF',
        0, 1, 'KG 15 Rd, Ngoma', 'Ngoma', 'Huye', 'Ngoma',
        -2.596700, 29.739400, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '14 days', NOW() - INTERVAL '2 days'
    ),

    -- P13: Office in Gasabo (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000013',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Serviced office in Kimihurura',
        'A flexible office suite with reception space, secure access, parking, and backup power for a growing business.',
        'OFFICE', 900000.00, 'RWF',
        0, 2, 'KG 12 St, Kimihurura', 'Kimihurura', 'Gasabo', 'Kimihurura',
        -1.954000, 30.082500, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '13 days', NOW() - INTERVAL '2 days'
    ),

    -- P14: Residential land in Bugesera (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000014',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Residential land plot near Bugesera airport',
        'A level residential plot with road access, suitable for a family home or small development project.',
        'LAND', 2500000.00, 'RWF',
        0, 0, 'RN3, Nyamata', 'Nyamata', 'Bugesera', 'Nyamata',
        -2.147000, 30.065000, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '12 days', NOW() - INTERVAL '2 days'
    ),

    -- P15: Mountain house in Musanze (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000015',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Three-bedroom house with a volcano view',
        'A warm family home in Musanze with a large compound, mountain views, and quick access to the town centre.',
        'HOUSE', 450000.00, 'RWF',
        3, 2, 'Musanze Town Road', 'Musanze Town', 'Musanze', 'Muhoza',
        -1.498800, 29.634900, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '11 days', NOW() - INTERVAL '2 days'
    ),

    -- P16: Lake-side apartment in Rubavu (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000016',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Lake-side apartment in Rubavu',
        'A bright two-bedroom apartment close to Lake Kivu, restaurants, and the main road through Gisenyi.',
        'APARTMENT', 500000.00, 'RWF',
        2, 1, 'Lake Kivu Road', 'Gisenyi', 'Rubavu', 'Gisenyi',
        -1.702900, 29.256200, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days'
    ),

    -- P17: Country villa in Nyagatare (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000017',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Country villa with garden in Nyagatare',
        'A comfortable four-bedroom villa with a private garden, perimeter wall, and plenty of family space.',
        'VILLA', 780000.00, 'RWF',
        4, 3, 'Nyagatare Main Road', 'Nyagatare Town', 'Nyagatare', 'Nyagatare',
        -1.297000, 30.325000, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '9 days', NOW() - INTERVAL '2 days'
    ),

    -- P18: Development land in Kicukiro (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000018',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Serviced development plot in Kicukiro',
        'A well-positioned plot with road access and nearby utilities, suitable for apartments or a commercial project.',
        'LAND', 3000000.00, 'RWF',
        0, 0, 'KK 15 Ave, Gikondo', 'Gikondo', 'Kicukiro', 'Gikondo',
        -1.976800, 30.079300, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days'
    ),

    -- P19: Kacyiru townhouse (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000019',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Quiet townhouse in Kacyiru',
        'A comfortable two-bedroom townhouse with parking, security, and quick access to offices, schools, and restaurants.',
        'HOUSE', 580000.00, 'RWF',
        2, 2, 'KG 5 Ave, Kacyiru', 'Kacyiru', 'Gasabo', 'Kacyiru',
        -1.935500, 30.071500, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days'
    ),

    -- P20: Gikondo apartment (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000020',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Affordable one-bedroom apartment in Gikondo',
        'A practical apartment for a professional or couple with secure access and nearby public transport.',
        'APARTMENT', 430000.00, 'RWF',
        1, 1, 'KK 8 St, Gikondo', 'Gikondo', 'Kicukiro', 'Gikondo',
        -1.976900, 30.079300, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '6 days', NOW() - INTERVAL '2 days'
    ),

    -- P21: Kiyovu villa (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000021',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Elegant villa in Kiyovu',
        'A four-bedroom villa with a landscaped garden, staff room, secure compound, and entertaining areas.',
        'VILLA', 1100000.00, 'RWF',
        4, 3, 'KN 3 Ave, Kiyovu', 'Kiyovu', 'Nyarugenge', 'Kiyovu',
        -1.955400, 30.058700, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'
    ),

    -- P22: Rubavu studio (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000022',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Compact studio near Gisenyi beach',
        'A simple studio apartment close to Lake Kivu, cafés, and the town centre.',
        'STUDIO', 260000.00, 'RWF',
        0, 1, 'Beach Road, Gisenyi', 'Gisenyi', 'Rubavu', 'Gisenyi',
        -1.702900, 29.256200, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'
    ),

    -- P23: Kigali CBD office (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000023',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Central office suite in Nyarugenge',
        'A professional office suite with meeting space, reception area, secure parking, and reliable internet access.',
        'OFFICE', 1200000.00, 'RWF',
        0, 2, 'KN 4 Ave, Kigali City Centre', 'City Centre', 'Nyarugenge', 'Nyarugenge',
        -1.944300, 30.061900, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
    ),

    -- P24: Rwamagana land (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000024',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Roadside land plot in Rwamagana',
        'A gently sloping plot with road access, suitable for a home, shops, or a small hospitality project.',
        'LAND', 1800000.00, 'RWF',
        0, 0, 'Kayonza Road, Rwamagana', 'Rwamagana Town', 'Rwamagana', 'Muhazi',
        -1.948700, 30.434700, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
    ),

    -- P25: Gatsibo family house (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000025',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Affordable family house in Gatsibo',
        'A three-bedroom home with a secure yard and easy access to local markets and transport.',
        'HOUSE', 350000.00, 'RWF',
        3, 2, 'Kabarore Road', 'Kabarore', 'Gatsibo', 'Kabarore',
        -1.570000, 30.450000, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
    ),

    -- P26: Musanze apartment (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000026',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Two-bedroom apartment in Musanze',
        'A bright apartment near shops, schools, and the main road, with secure parking and good natural light.',
        'APARTMENT', 320000.00, 'RWF',
        2, 1, 'Muhoza Road', 'Musanze Town', 'Musanze', 'Muhoza',
        -1.498800, 29.634900, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
    ),

    -- P27: Huye villa (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000027',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Garden villa in Huye',
        'A spacious four-bedroom villa with a private garden, parking, and a peaceful residential setting.',
        'VILLA', 680000.00, 'RWF',
        4, 3, 'Butare Heights', 'Huye Town', 'Huye', 'Ngoma',
        -2.596700, 29.739400, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
    ),

    -- P28: Gacuriro development land (VERIFIED, AVAILABLE)
    (
        '00000002-0000-0000-0000-000000000028',
        '00000001-0000-0000-0000-000000000002', NULL,
        'Prime development land in Gacuriro',
        'A well-positioned plot in a growing Kigali neighbourhood, suitable for apartments or a private residence.',
        'LAND', 4000000.00, 'RWF',
        0, 0, 'KG 18 Ave, Gacuriro', 'Gacuriro', 'Gasabo', 'Kinyinya',
        -1.921200, 30.106500, 'VERIFIED', 'AVAILABLE', TRUE,
        NOW(), NOW()
    )

ON CONFLICT (id) DO NOTHING;
