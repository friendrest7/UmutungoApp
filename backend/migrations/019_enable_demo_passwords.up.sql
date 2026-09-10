-- Development/demo identities only. The shared pitch password is documented
-- in the frontend environment example and is not used for production users.
-- Hash is bcrypt cost-12 of: UmutungoApp@123
UPDATE users
SET password_hash = '$2a$12$p6zFjKTat0hRakVy.xMm.eXUj9gITXfp0BkJhDchEKN2BQAJ9bN9a',
    updated_at = NOW()
WHERE email IN (
    'tenant@umutungo.demo',
    'owner@umutungo.demo',
    'agent@umutungo.demo',
    'admin@umutungo.demo'
);

