-- =============================================================
-- 05_amenities.sql
-- DEVELOPMENT / DEMO DATA ONLY
--
-- Re-upserts the amenities catalogue.
-- This is identical to migration 012 and is safe to run again.
-- Running this ensures the catalogue is present even if migration
-- 012 was skipped or the amenities table was manually cleared.
-- =============================================================

INSERT INTO amenities (slug, label, category)
VALUES
    ('wifi',             'Wi-Fi',                   'UTILITIES'),
    ('parking',          'Parking',                 'GENERAL'),
    ('water',            'Running Water',            'UTILITIES'),
    ('security',         'Security / Guard',         'SAFETY'),
    ('generator',        'Generator / Backup Power', 'UTILITIES'),
    ('garden',           'Garden',                   'OUTDOOR'),
    ('swimming_pool',    'Swimming Pool',            'OUTDOOR'),
    ('inside_toilet',    'Inside Toilet',            'GENERAL'),
    ('air_conditioning', 'Air Conditioning',         'GENERAL'),
    ('tiled_floors',     'Tiled Floors',             'GENERAL'),
    ('cctv',             'CCTV Cameras',             'SAFETY'),
    ('borehole',         'Borehole Water',           'UTILITIES')
ON CONFLICT (slug) DO UPDATE
    SET label    = EXCLUDED.label,
        category = EXCLUDED.category;
