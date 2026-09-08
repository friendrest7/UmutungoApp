DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS support_requests;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS notification_preferences;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS moderation_actions;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS saved_searches;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS listing_interactions;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS subscription_plans;

ALTER TABLE property_images
    DROP CONSTRAINT IF EXISTS property_media_size_check,
    DROP CONSTRAINT IF EXISTS property_media_type_check,
    DROP COLUMN IF EXISTS storage_key,
    DROP COLUMN IF EXISTS byte_size,
    DROP COLUMN IF EXISTS mime_type,
    DROP COLUMN IF EXISTS media_type;

ALTER TABLE properties
    DROP CONSTRAINT IF EXISTS properties_village_fk,
    DROP CONSTRAINT IF EXISTS properties_cell_fk,
    DROP CONSTRAINT IF EXISTS properties_sector_fk,
    DROP CONSTRAINT IF EXISTS properties_district_fk,
    DROP CONSTRAINT IF EXISTS properties_province_fk,
    DROP CONSTRAINT IF EXISTS properties_location_hierarchy_check,
    DROP CONSTRAINT IF EXISTS properties_contact_method_check,
    DROP CONSTRAINT IF EXISTS properties_listing_type_check,
    DROP COLUMN IF EXISTS deleted_by,
    DROP COLUMN IF EXISTS deleted_at,
    DROP COLUMN IF EXISTS expires_at,
    DROP COLUMN IF EXISTS published_at,
    DROP COLUMN IF EXISTS scheduled_for,
    DROP COLUMN IF EXISTS preferred_contact_method,
    DROP COLUMN IF EXISTS tags,
    DROP COLUMN IF EXISTS village_code,
    DROP COLUMN IF EXISTS cell_code,
    DROP COLUMN IF EXISTS sector_code,
    DROP COLUMN IF EXISTS district_code,
    DROP COLUMN IF EXISTS province_code,
    DROP COLUMN IF EXISTS listing_type;

DROP TABLE IF EXISTS rwanda_locations;
DROP TABLE IF EXISTS kyc_documents;
DROP TABLE IF EXISTS kyc_submissions;
DROP TABLE IF EXISTS role_upgrade_requests;
DROP TABLE IF EXISTS otp_challenges;

DROP INDEX IF EXISTS idx_users_verification_status;
DROP INDEX IF EXISTS idx_users_phone;
ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_verification_status_check,
    DROP COLUMN IF EXISTS suspended_reason,
    DROP COLUMN IF EXISTS suspended_at,
    DROP COLUMN IF EXISTS verification_status,
    DROP COLUMN IF EXISTS bio,
    DROP COLUMN IF EXISTS phone_verified,
    DROP COLUMN IF EXISTS phone;
