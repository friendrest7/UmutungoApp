// Package config loads and validates environment variables for the backend.
// Call config.Load() once at startup; pass the result to all components.
package config

import (
	"log"
	"os"
	"strings"

	// Load .env file in development (no-op if file not found)
	_ "github.com/joho/godotenv/autoload"
)

// Config holds all runtime configuration loaded from environment variables.
type Config struct {
	// DatabaseURL is the full PostgreSQL connection string.
	// Example: postgresql://user:pass@host:5432/db?sslmode=require
	// NEVER expose this to the frontend or logs.
	DatabaseURL string

	// Port is the HTTP listen port (default: 8080).
	Port string

	// AppEnv is "development" or "production".
	AppEnv string

	// CORSOrigins is the list of allowed frontend origins.
	CORSOrigins []string

	// Groq AI credentials (forwarded from Next.js frontend usage).
	GroqAPIKey    string
	GroqModel     string
	GroqModelFast string

	// JWTSecret is used to sign API tokens.
	JWTSecret string
}

// Load reads environment variables and returns a validated Config.
// Missing required variables cause a fatal log.
func Load() *Config {
	cfg := &Config{
		DatabaseURL:   requireEnv("DATABASE_URL"),
		Port:          envOr("PORT", "8080"),
		AppEnv:        envOr("APP_ENV", "development"),
		GroqAPIKey:    os.Getenv("GROQ_API_KEY"),
		GroqModel:     envOr("GROQ_MODEL", "openai/gpt-oss-120b"),
		GroqModelFast: envOr("GROQ_MODEL_FAST", "openai/gpt-oss-20b"),
		JWTSecret:     os.Getenv("JWT_SECRET"),
	}

	rawOrigins := envOr("CORS_ORIGINS", "http://localhost:3000")
	for _, o := range strings.Split(rawOrigins, ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			cfg.CORSOrigins = append(cfg.CORSOrigins, o)
		}
	}

	return cfg
}

// IsProduction returns true when running in the production environment.
func (c *Config) IsProduction() bool {
	return c.AppEnv == "production"
}

// requireEnv returns the value of an environment variable or fatals.
func requireEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("required environment variable %q is not set", key)
	}
	return v
}

// envOr returns the env var value or a fallback default.
func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
