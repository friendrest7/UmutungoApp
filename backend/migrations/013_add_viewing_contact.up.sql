-- Migration 013 UP: Store contact details captured with a viewing request

ALTER TABLE viewings
    ADD COLUMN tenant_phone TEXT;
