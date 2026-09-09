-- Development/demo identities only. The shared pitch password is documented
-- in the frontend environment example and is not used for production users.
UPDATE users
SET password_hash = '$2b$12$5rn8tP9r3y4QRR4YkG5o6exX8kidNheNAymLluslc5XuUWMah7/r2',
    updated_at = NOW()
WHERE email IN (
    'tenant@umutungo.demo',
    'owner@umutungo.demo',
    'agent@umutungo.demo',
    'admin@umutungo.demo'
);

