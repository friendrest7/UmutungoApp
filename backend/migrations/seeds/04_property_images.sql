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
    ),

    -- P9: Kicukiro family house — Unsplash
    (
        '00000003-0000-0000-0000-000000000013',
        '00000002-0000-0000-0000-000000000009',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'Bright family house exterior in Kicukiro', TRUE, 0
    ),

    -- P10: City apartment — Unsplash
    (
        '00000003-0000-0000-0000-000000000014',
        '00000002-0000-0000-0000-000000000010',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
        'Modern apartment interior near Kigali City Centre', TRUE, 0
    ),

    -- P11: Nyarutarama villa — Unsplash
    (
        '00000003-0000-0000-0000-000000000015',
        '00000002-0000-0000-0000-000000000011',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        'Executive villa exterior in Nyarutarama', TRUE, 0
    ),

    -- P12: Huye studio — Unsplash
    (
        '00000003-0000-0000-0000-000000000016',
        '00000002-0000-0000-0000-000000000012',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'Furnished studio interior in Huye', TRUE, 0
    ),

    -- P13: Kimihurura office — Unsplash
    (
        '00000003-0000-0000-0000-000000000017',
        '00000002-0000-0000-0000-000000000013',
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
        'Serviced office interior in Kimihurura', TRUE, 0
    ),

    -- P14: Bugesera land — Unsplash
    (
        '00000003-0000-0000-0000-000000000018',
        '00000002-0000-0000-0000-000000000014',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        'Open residential land near Bugesera', TRUE, 0
    ),

    -- P15: Musanze house — Unsplash
    (
        '00000003-0000-0000-0000-000000000019',
        '00000002-0000-0000-0000-000000000015',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80',
        'Family house exterior in Musanze', TRUE, 0
    ),

    -- P16: Rubavu apartment — Unsplash
    (
        '00000003-0000-0000-0000-000000000020',
        '00000002-0000-0000-0000-000000000016',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
        'Lake-side apartment interior in Rubavu', TRUE, 0
    ),

    -- P17: Nyagatare villa — Unsplash
    (
        '00000003-0000-0000-0000-000000000021',
        '00000002-0000-0000-0000-000000000017',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        'Country villa exterior in Nyagatare', TRUE, 0
    ),

    -- P18: Kicukiro development land — Unsplash
    (
        '00000003-0000-0000-0000-000000000022',
        '00000002-0000-0000-0000-000000000018',
        'https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=1200&q=80',
        'Development land in Kicukiro', TRUE, 0
    ),

    -- P19: Kacyiru townhouse — Unsplash
    (
        '00000003-0000-0000-0000-000000000023',
        '00000002-0000-0000-0000-000000000019',
        'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1200&q=80',
        'Townhouse exterior in Kacyiru', TRUE, 0
    ),

    -- P20: Gikondo apartment — Unsplash
    (
        '00000003-0000-0000-0000-000000000024',
        '00000002-0000-0000-0000-000000000020',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        'One-bedroom apartment interior in Gikondo', TRUE, 0
    ),

    -- P21: Kiyovu villa — Unsplash
    (
        '00000003-0000-0000-0000-000000000025',
        '00000002-0000-0000-0000-000000000021',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        'Elegant villa living room in Kiyovu', TRUE, 0
    ),

    -- P22: Rubavu studio — Unsplash
    (
        '00000003-0000-0000-0000-000000000026',
        '00000002-0000-0000-0000-000000000022',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'Compact studio near Gisenyi beach', TRUE, 0
    ),

    -- P23: Kigali CBD office — Unsplash
    (
        '00000003-0000-0000-0000-000000000027',
        '00000002-0000-0000-0000-000000000023',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
        'Central office suite in Kigali City Centre', TRUE, 0
    ),

    -- P24: Rwamagana land — Unsplash
    (
        '00000003-0000-0000-0000-000000000028',
        '00000002-0000-0000-0000-000000000024',
        'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80',
        'Roadside land plot in Rwamagana', TRUE, 0
    ),

    -- P25: Gatsibo house — Unsplash
    (
        '00000003-0000-0000-0000-000000000029',
        '00000002-0000-0000-0000-000000000025',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        'Affordable family house in Gatsibo', TRUE, 0
    ),

    -- P26: Musanze apartment — Unsplash
    (
        '00000003-0000-0000-0000-000000000030',
        '00000002-0000-0000-0000-000000000026',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80',
        'Two-bedroom apartment in Musanze', TRUE, 0
    ),

    -- P27: Huye villa — Unsplash
    (
        '00000003-0000-0000-0000-000000000031',
        '00000002-0000-0000-0000-000000000027',
        'https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1200&q=80',
        'Garden villa in Huye', TRUE, 0
    ),

    -- P28: Gacuriro land — Unsplash
    (
        '00000003-0000-0000-0000-000000000032',
        '00000002-0000-0000-0000-000000000028',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
        'Prime development land in Gacuriro', TRUE, 0
    )

ON CONFLICT (id) DO NOTHING;
