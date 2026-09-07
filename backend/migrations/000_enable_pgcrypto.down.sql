-- Migration 000 DOWN: Remove the UUID extension after all schema objects.

DROP EXTENSION IF EXISTS pgcrypto;