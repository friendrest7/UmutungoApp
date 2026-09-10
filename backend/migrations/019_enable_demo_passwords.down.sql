UPDATE users
SET password_hash = NULL,
    updated_at = NOW()
WHERE email IN (
    'tenant@umutungo.demo',
    'owner@umutungo.demo',
    'agent@umutungo.demo',
    'admin@umutungo.demo'
)
AND password_hash = '$2a$12$p6zFjKTat0hRakVy.xMm.eXUj9gITXfp0BkJhDchEKN2BQAJ9bN9a';

