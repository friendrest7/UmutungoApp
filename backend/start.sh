#!/usr/bin/env sh
# UmutungoApp — Render start script
# Applies pending database migrations then starts the HTTP server.
# Both binaries are compiled during the build step.
set -e

echo "==> Running database migrations..."
./bin/migrate up
echo "==> Migrations complete. Starting server..."
exec ./bin/server
