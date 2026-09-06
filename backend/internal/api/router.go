// Package api wires together all HTTP handlers and middleware.
package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/inzuhub/backend/internal/config"
	"github.com/inzuhub/backend/internal/middleware"
)

// NewRouter builds and returns the root HTTP handler.
func NewRouter(cfg *config.Config, pool *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()

	// ── Global middleware ────────────────────────────────────────
	r.Use(middleware.Logger)
	r.Use(middleware.CORS(cfg.CORSOrigins))
	r.Use(chimw.Recoverer)
	r.Use(chimw.RequestID)

	// ── Dependency injection via handler structs ─────────────────
	ph := &propertiesHandler{pool: pool, cfg: cfg}
	lh := &leadsHandler{pool: pool}
	ah := &aiHandler{cfg: cfg}

	// ── Routes ───────────────────────────────────────────────────
	r.Get("/health", healthHandler)

	r.Route("/api", func(r chi.Router) {
		// Properties
		r.Get("/properties",        ph.list)
		r.Get("/properties/{slug}", ph.get)

		// Leads / viewing requests
		r.Post("/leads", lh.create)

		// AI proxies
		r.Post("/ai/chat",         ah.chat)
		r.Post("/ai/parse-search", ah.parseSearch)
	})

	return r
}
