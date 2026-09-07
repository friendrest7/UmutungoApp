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
	oh := &ownerHandler{pool: pool}
	adh := &adminHandler{pool: pool}
	ah := &aiHandler{cfg: cfg}

	// ── Routes ───────────────────────────────────────────────────
	r.Get("/health", healthHandler)

	r.Route("/api", func(r chi.Router) {
		// Properties
		r.Get("/properties", ph.list)
		r.Get("/properties/{slug}", ph.get)

		// Leads / viewing requests
		r.With(middleware.RequireAuth(pool, cfg)).Post("/leads", lh.create)
		r.With(middleware.RequireAuth(pool, cfg)).Get("/leads/me", lh.listMine)

		// Owner property management
		r.Route("/owner", func(r chi.Router) {
			r.Use(middleware.RequireAuth(pool, cfg))
			r.Use(middleware.RequireRole("OWNER", "ADMIN"))
			r.Get("/properties", oh.list)
			r.Post("/properties", oh.create)
			r.Put("/properties/{id}", oh.update)
			r.Delete("/properties/{id}", oh.remove)
			r.Get("/viewings", oh.viewings)
		})

		r.Route("/admin", func(r chi.Router) {
			r.Use(middleware.RequireAuth(pool, cfg))
			r.Use(middleware.RequireRole("ADMIN"))
			r.Get("/summary", adh.summary)
			r.Get("/users", adh.users)
		})

		// AI proxies
		r.Post("/ai/chat", ah.chat)
		r.Post("/ai/parse-search", ah.parseSearch)
	})

	return r
}
