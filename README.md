# UmutungoApp

UmutungoApp is organized as two independently deployable applications:

- `frontend/`: Next.js application for Vercel.
- `backend/`: Go HTTP API and PostgreSQL migrations for Render.

## Local development

### Frontend

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` or
`BACKEND_API_URL` in `frontend/.env.local` to the backend URL. The local default
is `http://localhost:8080`.

Production checks:

```bash
npm run lint
npm run build
npm start
```

### Backend

```bash
cd backend
copy .env.example .env
go mod download
go run ./cmd/migrate up
go run ./cmd/server
```

The API runs at `http://localhost:8080`. `DATABASE_URL` is required. Start a
local PostgreSQL instance before running migrations or the server.

Backend tests and compilation:

```bash
go test ./...
```

## Deployment

The production data flow is:

```text
Browser -> Vercel Next.js -> Render Go API -> Supabase PostgreSQL
```

The browser never receives `DATABASE_URL`. Vercel calls the Next.js server
routes, and those routes call the Render API using the server-only
`BACKEND_API_URL` variable.

### Vercel

#### One-time project setup

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository.
2. When prompted, set **Root Directory** to `frontend`.
3. Framework is auto-detected as **Next.js**. Leave all build settings as-is —
   `vercel.json` inside `frontend/` overrides them where necessary.
4. Click **Deploy**. The first deploy will fail if environment variables are
   missing — that is expected. Add them in the next step.

#### Environment variables

Open **Project Settings → Environment Variables** and add the following keys.
Use the `frontend/.env.production.example` file as the canonical reference.

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Production, Preview | Your Vercel URL, e.g. `https://umutungo.vercel.app` |
| `BACKEND_API_URL` | Production, Preview | Your Render backend URL |
| `BACKEND_JWT_SECRET` | Production, Preview | Must match the backend value |
| `AUTH_SECRET` | Production, Preview | Generate: `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Production, Preview | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Production, Preview | Google OAuth client secret |
| `NEXT_PUBLIC_SUPABASE_URL` | All | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Supabase service role — **never expose in browser** |
| `GROQ_API_KEY` | Production, Preview | Server-only AI key |
| `BLOB_READ_WRITE_TOKEN` | Production, Preview | Vercel Blob token (auto-injected when Blob store is linked) |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | All | Restrict to your domain in Google Cloud Console |
| `RESEND_API_KEY` | Production, Preview | Transactional email |
| `NEXT_TELEMETRY_DISABLED` | All | Set to `1` |

> **Do not** add `DATABASE_URL` to Vercel — it belongs only on Render (backend).

#### Google OAuth redirect URI

In the Google Cloud Console, add these Authorised Redirect URIs to your OAuth
client:

```
https://<your-vercel-domain>/api/auth/callback/google
https://<your-preview-branch>.vercel.app/api/auth/callback/google
```

#### Re-deploy after adding variables

After saving all environment variables, trigger a new deployment:

```bash
# using Vercel CLI
vercel --prod
```

Or push a new commit — Vercel will pick it up automatically.

### Render

1. Create a Web Service from this repository.
2. Set the root directory to `backend`.
3. Use `go build -o bin/server ./cmd/server` as the build command.
4. Use `./bin/server` as the start command.
5. Add `DATABASE_URL`, `APP_ENV=production`, and `CORS_ORIGINS` in Render's
   environment settings. `CORS_ORIGINS` must include the deployed Vercel origin.

### Supabase database

1. Create a Supabase project and open **Connect**.
2. Copy the PostgreSQL **Session pooler** connection string for a hosted
   backend such as Render. Keep `sslmode=require` in the URL.
3. Set that value as Render's `DATABASE_URL`. Never put it in the frontend or
   commit it to Git.
4. From the `backend` directory, apply the schema against Supabase:

   ```bash
   $env:DATABASE_URL="postgresql://..."
   go run ./cmd/migrate up
   ```

5. For demo data only, run the seed script against a non-production Supabase
   project. The seed script intentionally refuses production truncation.

After deployment, verify the chain in this order:

```text
https://<your-render-service>.onrender.com/health
https://<your-vercel-app>/api/properties
https://<your-vercel-app>/        (search the homes section)
```

The same settings are included in `backend/render.yaml`. Run migrations against
the production database before serving traffic:

```bash
go run ./cmd/migrate up
```

## Secrets and environment files

`.env*`, OAuth client-secret JSON files, build output, dependency directories,
and Go binaries are ignored by Git. Copy the example environment files locally
and provide production secrets through Vercel and Render environment settings.

No deployment is performed by this repository setup.
