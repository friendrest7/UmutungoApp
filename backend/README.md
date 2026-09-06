# InzuHub — Go Backend

Production-ready Go API server for the InzuHub Rwanda rental marketplace.

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
# Edit .env with your DATABASE_URL

# 2. Start a local Postgres instance (Docker)
docker run -d \
  --name inzuhub-db \
  -e POSTGRES_USER=inzuhub \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=inzuhub_dev \
  -p 5432:5432 \
  postgres:16-alpine

# 3. Run migrations
go run ./cmd/migrate up

# 4. Seed demo data
psql "$DATABASE_URL" -f migrations/seeds/seed.sql

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
# Full seed (idempotent — safe to run multiple times)
psql "$DATABASE_URL" -f migrations/seeds/seed.sql
```

The seed script is idempotent. Running it multiple times will not create duplicates.
It is **blocked in production** by an environment guard.

## Environment variables

See `.env.example` for the full list with descriptions.

The `DATABASE_URL` is the only required variable. All others have defaults.

## Security notes

- `DATABASE_URL` is never exposed to the Next.js frontend or browser
- Only the Go backend connects to PostgreSQL
- All connections use `sslmode=require` in production
- The demo user accounts (`*@inzuhub.demo`) exist only in development databases
