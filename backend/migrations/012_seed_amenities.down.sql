-- Migration 012 DOWN: Remove seeded amenities
-- Only removes the known catalogue entries; custom amenities added later are untouched.

DELETE FROM amenities WHERE slug IN (
    'wifi', 'parking', 'water', 'security', 'generator',
    'garden', 'swimming_pool', 'inside_toilet', 'air_conditioning',
    'tiled_floors', 'cctv', 'borehole'
);
