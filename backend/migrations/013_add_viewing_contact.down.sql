-- Migration 013 DOWN: Remove viewing contact details

ALTER TABLE viewings
    DROP COLUMN IF EXISTS tenant_phone;
