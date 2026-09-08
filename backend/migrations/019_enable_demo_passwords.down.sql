UPDATE users
SET password_hash = NULL,
    updated_at = NOW()
WHERE email IN (
    'tenant@inzuhub.demo',
    'owner@inzuhub.demo',
    'agent@inzuhub.demo',
    'admin@inzuhub.demo'
)
AND password_hash = '$2b$12$5rn8tP9r3y4QRR4YkG5o6exX8kidNheNAymLluslc5XuUWMah7/r2';

