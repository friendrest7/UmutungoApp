-- Migration 012 UP: Seed amenities catalogue
-- This migration populates the normalized amenities reference data.
-- It is idempotent: re-running will update labels without creating duplicates.

INSERT INTO amenities (slug, label, category) VALUES
    ('wifi',            'Wi-Fi',                  'UTILITIES'),
    ('parking',         'Parking',                'GENERAL'),
    ('water',           'Running Water',           'UTILITIES'),
    ('security',        'Security / Guard',        'SAFETY'),
    ('generator',       'Generator / Backup Power','UTILITIES'),
    ('garden',          'Garden',                  'OUTDOOR'),
    ('swimming_pool',   'Swimming Pool',           'OUTDOOR'),
    ('inside_toilet',   'Inside Toilet',           'GENERAL'),
    ('air_conditioning','Air Conditioning',        'GENERAL'),
    ('tiled_floors',    'Tiled Floors',            'GENERAL'),
    ('cctv',            'CCTV Cameras',            'SAFETY'),
    ('borehole',        'Borehole Water',          'UTILITIES')
ON CONFLICT (slug) DO UPDATE
    SET label    = EXCLUDED.label,
        category = EXCLUDED.category;
