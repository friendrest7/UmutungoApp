-- =============================================================
-- 06_property_amenities.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- Links amenities to properties via the normalized junction table.
-- Uses subqueries on slug to avoid hardcoding amenity UUIDs.
-- =============================================================

INSERT INTO property_amenities (property_id, amenity_id)

-- P1: Kacyiru Apartment
-- wifi, water, inside_toilet, tiled_floors, security
SELECT '00000002-0000-0000-0000-000000000001', id FROM amenities WHERE slug = 'wifi'          UNION ALL
SELECT '00000002-0000-0000-0000-000000000001', id FROM amenities WHERE slug = 'water'         UNION ALL
SELECT '00000002-0000-0000-0000-000000000001', id FROM amenities WHERE slug = 'inside_toilet' UNION ALL
SELECT '00000002-0000-0000-0000-000000000001', id FROM amenities WHERE slug = 'tiled_floors'  UNION ALL
SELECT '00000002-0000-0000-0000-000000000001', id FROM amenities WHERE slug = 'security'      UNION ALL

-- P2: Kimihurura Family Home
-- wifi, parking, water, inside_toilet, security, generator, tiled_floors
SELECT '00000002-0000-0000-0000-000000000002', id FROM amenities WHERE slug = 'wifi'          UNION ALL
SELECT '00000002-0000-0000-0000-000000000002', id FROM amenities WHERE slug = 'parking'       UNION ALL
SELECT '00000002-0000-0000-0000-000000000002', id FROM amenities WHERE slug = 'water'         UNION ALL
SELECT '00000002-0000-0000-0000-000000000002', id FROM amenities WHERE slug = 'inside_toilet' UNION ALL
SELECT '00000002-0000-0000-0000-000000000002', id FROM amenities WHERE slug = 'security'      UNION ALL
SELECT '00000002-0000-0000-0000-000000000002', id FROM amenities WHERE slug = 'generator'     UNION ALL
SELECT '00000002-0000-0000-0000-000000000002', id FROM amenities WHERE slug = 'tiled_floors'  UNION ALL

-- P3: Kicukiro Garden Home
-- wifi, parking, water, inside_toilet, garden, security, tiled_floors
SELECT '00000002-0000-0000-0000-000000000003', id FROM amenities WHERE slug = 'wifi'          UNION ALL
SELECT '00000002-0000-0000-0000-000000000003', id FROM amenities WHERE slug = 'parking'       UNION ALL
SELECT '00000002-0000-0000-0000-000000000003', id FROM amenities WHERE slug = 'water'         UNION ALL
SELECT '00000002-0000-0000-0000-000000000003', id FROM amenities WHERE slug = 'inside_toilet' UNION ALL
SELECT '00000002-0000-0000-0000-000000000003', id FROM amenities WHERE slug = 'garden'        UNION ALL
SELECT '00000002-0000-0000-0000-000000000003', id FROM amenities WHERE slug = 'security'      UNION ALL
SELECT '00000002-0000-0000-0000-000000000003', id FROM amenities WHERE slug = 'tiled_floors'  UNION ALL

-- P4: Kiyovu Executive Villa
-- wifi, parking, water, inside_toilet, garden, swimming_pool, security,
-- generator, air_conditioning, cctv, tiled_floors
SELECT '00000002-0000-0000-0000-000000000004', id FROM amenities WHERE slug = 'wifi'             UNION ALL
SELECT '00000002-0000-0000-0000-000000000004', id FROM amenities WHERE slug = 'parking'          UNION ALL
SELECT '00000002-0000-0000-0000-000000000004', id FROM amenities WHERE slug = 'water'            UNION ALL
SELECT '00000002-0000-0000-0000-000000000004', id FROM amenities WHERE slug = 'inside_toilet'    UNION ALL
SELECT '00000002-0000-0000-0000-000000000004', id FROM amenities WHERE slug = 'garden'           UNION ALL
SELECT '00000002-0000-0000-0000-000000000004', id FROM amenities WHERE slug = 'swimming_pool'    UNION ALL
SELECT '00000002-0000-0000-0000-000000000004', id FROM amenities WHERE slug = 'security'         UNION ALL
SELECT '00000002-0000-0000-0000-000000000004', id FROM amenities WHERE slug = 'generator'        UNION ALL
SELECT '00000002-0000-0000-0000-000000000004', id FROM amenities WHERE slug = 'air_conditioning' UNION ALL
SELECT '00000002-0000-0000-0000-000000000004', id FROM amenities WHERE slug = 'cctv'             UNION ALL
SELECT '00000002-0000-0000-0000-000000000004', id FROM amenities WHERE slug = 'tiled_floors'     UNION ALL

-- P5: Nyamirambo Studio
-- water, inside_toilet
SELECT '00000002-0000-0000-0000-000000000005', id FROM amenities WHERE slug = 'water'         UNION ALL
SELECT '00000002-0000-0000-0000-000000000005', id FROM amenities WHERE slug = 'inside_toilet' UNION ALL

-- P6: Kibagabaga House
-- parking, water, inside_toilet, tiled_floors
SELECT '00000002-0000-0000-0000-000000000006', id FROM amenities WHERE slug = 'parking'       UNION ALL
SELECT '00000002-0000-0000-0000-000000000006', id FROM amenities WHERE slug = 'water'         UNION ALL
SELECT '00000002-0000-0000-0000-000000000006', id FROM amenities WHERE slug = 'inside_toilet' UNION ALL
SELECT '00000002-0000-0000-0000-000000000006', id FROM amenities WHERE slug = 'tiled_floors'  UNION ALL

-- P7: Gikondo Budget Apartment
-- water, inside_toilet
SELECT '00000002-0000-0000-0000-000000000007', id FROM amenities WHERE slug = 'water'         UNION ALL
SELECT '00000002-0000-0000-0000-000000000007', id FROM amenities WHERE slug = 'inside_toilet' UNION ALL

-- P8: Remera House
-- wifi, parking, water, inside_toilet, security, tiled_floors
SELECT '00000002-0000-0000-0000-000000000008', id FROM amenities WHERE slug = 'wifi'          UNION ALL
SELECT '00000002-0000-0000-0000-000000000008', id FROM amenities WHERE slug = 'parking'       UNION ALL
SELECT '00000002-0000-0000-0000-000000000008', id FROM amenities WHERE slug = 'water'         UNION ALL
SELECT '00000002-0000-0000-0000-000000000008', id FROM amenities WHERE slug = 'inside_toilet' UNION ALL
SELECT '00000002-0000-0000-0000-000000000008', id FROM amenities WHERE slug = 'security'      UNION ALL
SELECT '00000002-0000-0000-0000-000000000008', id FROM amenities WHERE slug = 'tiled_floors'

ON CONFLICT (property_id, amenity_id) DO NOTHING;
