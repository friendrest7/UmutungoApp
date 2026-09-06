-- =============================================================
-- 04_property_images.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- References image files already present in /public/images/properties/.
-- Each property has at least one cover image.
-- URLs use the Next.js public path format.
-- =============================================================

INSERT INTO property_images (id, property_id, url, alt_text, is_cover, sort_order)
VALUES

    -- P1: Kacyiru Apartment
    (
        '00000003-0000-0000-0000-000000000001',
        '00000002-0000-0000-0000-000000000001',
        '/images/properties/kigali-apartment.jpg',
        'Light-filled apartment interior in Kacyiru, Kigali',
        TRUE, 0
    ),
    (
        '00000003-0000-0000-0000-000000000002',
        '00000002-0000-0000-0000-000000000001',
        '/images/properties/kigali-home.jpg',
        'Exterior view of residential area near Kacyiru',
        FALSE, 1
    ),

    -- P2: Kimihurura Family Home
    (
        '00000003-0000-0000-0000-000000000003',
        '00000002-0000-0000-0000-000000000002',
        '/images/properties/kigali-home.jpg',
        'Family home exterior in Kimihurura, Kigali',
        TRUE, 0
    ),
    (
        '00000003-0000-0000-0000-000000000004',
        '00000002-0000-0000-0000-000000000002',
        '/images/properties/kigali-villa.jpg',
        'Garden and compound view of Kimihurura property',
        FALSE, 1
    ),

    -- P3: Kicukiro Garden Home
    (
        '00000003-0000-0000-0000-000000000005',
        '00000002-0000-0000-0000-000000000003',
        '/images/properties/kigali-villa.jpg',
        'Modern house with private garden in Gikondo, Kigali',
        TRUE, 0
    ),
    (
        '00000003-0000-0000-0000-000000000006',
        '00000002-0000-0000-0000-000000000003',
        '/images/properties/kigali-apartment.jpg',
        'Interior view of Gikondo property',
        FALSE, 1
    ),

    -- P4: Kiyovu Executive Villa
    (
        '00000003-0000-0000-0000-000000000007',
        '00000002-0000-0000-0000-000000000004',
        '/images/properties/kigali-villa.jpg',
        'Executive villa with pool in Kiyovu, Kigali',
        TRUE, 0
    ),

    -- P5: Nyamirambo Studio
    (
        '00000003-0000-0000-0000-000000000008',
        '00000002-0000-0000-0000-000000000005',
        '/images/properties/kigali-apartment.jpg',
        'Compact studio apartment in Nyamirambo, Kigali',
        TRUE, 0
    ),

    -- P6: Kibagabaga House
    (
        '00000003-0000-0000-0000-000000000009',
        '00000002-0000-0000-0000-000000000006',
        '/images/properties/kigali-home.jpg',
        'Spacious house in Kibagabaga, Gasabo district',
        TRUE, 0
    ),

    -- P7: Gikondo Budget Apartment
    (
        '00000003-0000-0000-0000-000000000010',
        '00000002-0000-0000-0000-000000000007',
        '/images/properties/kigali-apartment.jpg',
        'Budget apartment in Gikondo, Kicukiro district',
        TRUE, 0
    ),

    -- P8: Remera House
    (
        '00000003-0000-0000-0000-000000000011',
        '00000002-0000-0000-0000-000000000008',
        '/images/properties/kigali-home.jpg',
        'Three-bedroom house in Remera, Gasabo district',
        TRUE, 0
    ),
    (
        '00000003-0000-0000-0000-000000000012',
        '00000002-0000-0000-0000-000000000008',
        '/images/properties/kigali-villa.jpg',
        'Back garden view of Remera property',
        FALSE, 1
    )

ON CONFLICT (id) DO NOTHING;
