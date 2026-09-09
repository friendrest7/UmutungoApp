// UmutungoApp Backend — Database migration runner
// Usage:
//
//	go run ./cmd/migrate up       — apply all pending migrations
//	go run ./cmd/migrate down     — roll back the last migration
//	go run ./cmd/migrate version  — print current migration version
//	go run ./cmd/migrate force N  — force version N (use with care)
package main

import (
	"errors"
	"fmt"
	"log"
	"net/url"
	"os"
	"strconv"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	"github.com/umutungoapp/backend/internal/config"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "usage: migrate <up|down|version|force N>")
		os.Exit(1)
	}

	cfg := config.Load()

	dbURL, err := migrationDatabaseURL(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("invalid DATABASE_URL: %v", err)
	}

	m, err := migrate.New("file://migrations", dbURL)
	if err != nil {
		log.Fatalf("failed to initialise migrate: %v", err)
	}
	defer func() {
		srcErr, dbErr := m.Close()
		if srcErr != nil {
			log.Printf("migrate source close error: %v", srcErr)
		}
		if dbErr != nil {
			log.Printf("migrate db close error: %v", dbErr)
		}
	}()

	cmd := os.Args[1]
	switch cmd {
	case "up":
		if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
			log.Fatalf("migrate up: %v", err)
		}
		v, _, _ := m.Version()
		log.Printf("migrations applied — version: %d", v)

	case "down":
		if err := m.Steps(-1); err != nil {
			log.Fatalf("migrate down: %v", err)
		}
		v, _, _ := m.Version()
		log.Printf("rolled back one migration — version: %d", v)

	case "version":
		v, dirty, err := m.Version()
		if err != nil {
			log.Fatalf("version: %v", err)
		}
		log.Printf("current migration version: %d (dirty: %v)", v, dirty)

	case "force":
		if len(os.Args) < 3 {
			log.Fatal("force requires a version number: migrate force N")
		}
		n, err := strconv.Atoi(os.Args[2])
		if err != nil {
			log.Fatalf("invalid version: %v", err)
		}
		if err := m.Force(n); err != nil {
			log.Fatalf("force: %v", err)
		}
		log.Printf("forced version to %d", n)

	default:
		fmt.Fprintf(os.Stderr, "unknown command: %s\n", cmd)
		os.Exit(1)
	}
}

func migrationDatabaseURL(rawURL string) (string, error) {
	dbURL, err := url.Parse(rawURL)
	if err != nil {
		return "", err
	}

	switch dbURL.Scheme {
	case "postgres", "postgresql", "pgx5":
		dbURL.Scheme = "pgx5"
	default:
		return "", fmt.Errorf("unsupported database URL scheme %q", dbURL.Scheme)
	}

	return dbURL.String(), nil
}
