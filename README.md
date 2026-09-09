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

1. Import the repository into Vercel.
2. Set the project root directory to `frontend`.
3. Keep the framework as Next.js. Vercel uses `npm run build` automatically.
4. Add `BACKEND_API_URL=https://<your-render-service>.onrender.com` in the Vercel
   project settings. Do not add `DATABASE_URL` to Vercel.

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
