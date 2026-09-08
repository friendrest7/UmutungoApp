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
	eh := &engagementHandler{pool: pool}
	mh := &messagingHandler{pool: pool}
	rvh := &reviewsHandler{pool: pool}
	ch := &contactHandler{pool: pool}
	loch := &locationsHandler{pool: pool}
	oph := &otpHandler{pool: pool, demoMode: cfg.DemoMode}
	phw := &passwordHandler{pool: pool}
	payh := &paymentHandler{pool: pool, demoMode: cfg.DemoMode}
	accountH := &accountHandler{pool: pool}
	adh := &adminHandler{pool: pool}
	ah := &aiHandler{cfg: cfg}

	// ── Routes ───────────────────────────────────────────────────
	r.Get("/health", healthHandler)

	r.Route("/api", func(r chi.Router) {
		// OTP endpoints deliberately return a configuration error until a real
		// SMS provider is injected; they never report a fake sent/success state.
		r.Post("/auth/otp/request", oph.request)
		r.Post("/auth/otp/verify", oph.verify)
		r.Post("/auth/password/login", phw.login)
		r.Post("/auth/password/register", phw.register)
		r.Get("/subscription-plans", payh.plans)
		r.Get("/locations", loch.list)
		r.Post("/payments/webhook", payh.webhook)
		// Properties
		r.Get("/properties", ph.list)
		r.Get("/properties/{slug}", ph.get)
		r.Get("/properties/{id}/comments", eh.comments)
		r.Get("/properties/{id}/reviews", rvh.list)

		r.With(middleware.RequireAuth(pool, cfg)).Post("/reports", eh.report)
		r.With(middleware.RequireAuth(pool, cfg)).Post("/bookings", eh.createBooking)
		r.With(middleware.RequireAuth(pool, cfg)).Patch("/bookings/{id}/status", eh.updateBookingStatus)

		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAuth(pool, cfg))
			r.Post("/properties/{id}/comments", eh.addComment)
			r.Post("/properties/{id}/reviews", rvh.create)
			r.Post("/properties/{id}/contact", ch.reveal)
			r.Post("/properties/{id}/interactions/{kind}", eh.interaction)
			r.Delete("/properties/{id}/interactions/{kind}", eh.removeInteraction)
			r.Get("/properties/{id}/interactions", eh.interactionState)
			r.Get("/notifications", eh.notifications)
			r.Patch("/notifications/{id}/read", eh.markNotificationRead)
			r.Get("/notification-preferences", eh.notificationPreferences)
			r.Patch("/notification-preferences", eh.updateNotificationPreferences)
			r.Get("/messages/unread-count", mh.unreadCount)
			r.Get("/conversations", mh.list)
			r.Post("/conversations", mh.start)
			r.Get("/conversations/{id}/messages", mh.messages)
			r.Post("/conversations/{id}/messages", mh.send)
			r.Get("/saved-searches", eh.savedSearches)
			r.Post("/saved-searches", eh.createSavedSearch)
			r.Delete("/saved-searches/{id}", eh.deleteSavedSearch)
			r.Post("/subscriptions/checkout", payh.checkout)
			r.Get("/payments", payh.history)
			r.Post("/payments/booking", payh.bookingDeposit)
		})

		// Leads / viewing requests
		r.With(middleware.RequireAuth(pool, cfg)).Post("/leads", lh.create)
		r.With(middleware.RequireAuth(pool, cfg)).Get("/leads/me", lh.listMine)

		// Authenticated account, KYC and support operations.
		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAuth(pool, cfg))
			accountRoutes(r, accountH)
		})

		// Owner property management
		r.Route("/owner", func(r chi.Router) {
			r.Use(middleware.RequireAuth(pool, cfg))
			r.Use(middleware.RequireRole("OWNER", "AGENT", "ADMIN"))
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
			r.Get("/kyc", adh.kycQueue)
			r.Patch("/kyc/{id}", adh.reviewKYC)
			r.Get("/role-requests", adh.roleRequests)
			r.Patch("/role-requests/{id}", adh.reviewRoleRequest)
			r.Get("/reports", adh.reports)
			r.Patch("/reports/{id}", adh.reviewReport)
			r.Patch("/users/{id}/status", adh.setUserStatus)
			r.Patch("/properties/{id}/status", adh.setPropertyStatus)
		})

		// AI proxies
		r.Post("/ai/chat", ah.chat)
		r.Post("/ai/parse-search", ah.parseSearch)
	})

	return r
}
