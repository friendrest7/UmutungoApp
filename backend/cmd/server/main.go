// InzuHub Backend — HTTP server entry point
// Run with: go run ./cmd/server
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/inzuhub/backend/internal/api"
	"github.com/inzuhub/backend/internal/config"
	"github.com/inzuhub/backend/internal/lifecycle"
)

func main() {
	cfg := config.Load()

	// ── Database connection pool ─────────────────────────────────
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("cannot connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("database ping failed: %v", err)
	}
	log.Println("database connection established")

	// ── Router ───────────────────────────────────────────────────
	router := api.NewRouter(cfg, pool)

	// ── HTTP server ──────────────────────────────────────────────
	addr := fmt.Sprintf(":%s", cfg.Port)
	server := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// ── Graceful shutdown ────────────────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Printf("InzuHub backend listening on http://localhost%s (env: %s)", addr, cfg.AppEnv)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	lifecycleCtx, stopLifecycle := context.WithCancel(context.Background())
	defer stopLifecycle()
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for {
			if err := lifecycle.RunOnce(lifecycleCtx, pool); err != nil {
				log.Printf("listing lifecycle run failed: %v", err)
			}
			select {
			case <-ticker.C:
			case <-lifecycleCtx.Done():
				return
			}
		}
	}()

	<-quit
	log.Println("shutting down server…")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("forced shutdown: %v", err)
	}
	log.Println("server stopped")
}
