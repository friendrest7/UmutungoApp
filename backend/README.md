# UmutungoApp — Go Backend

This service is deployed independently from the Next.js frontend. Render should
use `backend` as the service root, build with `go build -o bin/server ./cmd/server`,
and start with `./bin/server`.

Production-ready Go API server for the UmutungoApp Rwanda rental marketplace.

## Stack

| Layer | Package |
|-------|---------|
| HTTP router | [chi v5](https://github.com/go-chi/chi) |
| PostgreSQL driver | [pgx v5](https://github.com/jackc/pgx) |
| Migrations | [golang-migrate](https://github.com/golang-migrate/migrate) |
| Query layer | [sqlc](https://sqlc.dev/) *(Phase 2)* |

## Quick start

```bash
# 1. Copy environment variables
cp .env.example .env
# Edit .env with DATABASE_URL and JWT_SECRET

# 2. Start a local Postgres instance (Docker)
docker run -d \
  --name umutungo-db \
  -e POSTGRES_USER=umutungo \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=umutungo_dev \
  -p 5432:5432 \
  postgres:16-alpine

# 3. Run migrations
go run ./cmd/migrate up

# 4. Seed demo data (development databases only; destructive reset)
# The explicit session settings are required. Never use this against production.
PGOPTIONS='-c app.env=development -c app.umutungo_seed_allowed=true' \
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/seeds/seed.sql

# 5. Start the server
go run ./cmd/server
# → Listening on http://localhost:8080
```

## Project structure

```
backend/
├── cmd/
│   ├── server/         # HTTP server entry point
│   └── migrate/        # Migration runner entry point
├── internal/
│   ├── api/            # HTTP handlers and router
│   ├── config/         # Environment configuration
│   └── middleware/     # CORS, logging
├── migrations/
│   ├── *.up.sql        # Forward migrations
│   ├── *.down.sql      # Reverse migrations
│   └── seeds/          # Development seed data
├── .env.example
├── go.mod
└── README.md
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| GET | `/api/properties` | List properties |
| GET | `/api/properties/{slug}` | Single property |
| POST | `/api/leads` | Submit viewing request |
| POST | `/api/ai/chat` | AI concierge (Groq proxy) |
| POST | `/api/ai/parse-search` | AI filter extractor |

## Running migrations

```bash
# Apply all pending migrations
go run ./cmd/migrate up

# Roll back the last migration
go run ./cmd/migrate down

# Check current migration version
go run ./cmd/migrate version
```

## Seeding demo data

```bash
# Destructive development reset. This truncates application tables first.
# It is not idempotent and must never run against production.
PGOPTIONS='-c app.env=development -c app.umutungo_seed_allowed=true' \
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/seeds/seed.sql
```

The seed script requires both explicit PostgreSQL session settings shown above and
fails closed when they are absent. It is intended only for local/demo databases.

## Environment variables

See `.env.example` for the full list with descriptions.

`DATABASE_URL` and `JWT_SECRET` are required variables. For Render, use the
Supabase Session pooler URL with `sslmode=require`. All other variables have
defaults.

The Go migration runner must be run from the `backend` directory. It converts
the `postgresql://` or `postgres://` URL scheme to the `pgx5://` scheme required
by the registered golang-migrate driver; the application server continues to use
the original PostgreSQL URL through pgxpool.

## Security notes

- The shared demo password is available only through the frontend's local
  `DEMO_PASSWORD_HASH`; demo credentials are disabled whenever `NODE_ENV=production`.
- Google OAuth remains the only production authentication provider.
