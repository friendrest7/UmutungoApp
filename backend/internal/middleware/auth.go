package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/inzuhub/backend/internal/config"
)

type userIdentityKey struct{}

type UserIdentity struct {
	ID          string
	Email       string
	DisplayName string
	Role        string
	IsActive    bool
}

type identityClaims struct {
	Email       string `json:"email"`
	DisplayName string `json:"name"`
	Role        string `json:"role,omitempty"`
	jwt.RegisteredClaims
}

// RequireAuth verifies the short-lived token issued by the Next.js server and
// resolves its email to the canonical user row in PostgreSQL.
func RequireAuth(pool *pgxpool.Pool, cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if cfg.JWTSecret == "" {
				jsonError(w, "authentication is not configured", http.StatusServiceUnavailable)
				return
			}

			raw := strings.TrimSpace(strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer "))
			if raw == "" {
				jsonError(w, "authentication required", http.StatusUnauthorized)
				return
			}

			claims := &identityClaims{}
			token, err := jwt.ParseWithClaims(raw, claims, func(token *jwt.Token) (any, error) {
				if token.Method != jwt.SigningMethodHS256 {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(cfg.JWTSecret), nil
			}, jwt.WithIssuer("inzu-frontend"), jwt.WithAudience("inzu-backend"), jwt.WithValidMethods([]string{"HS256"}))
			if err != nil || !token.Valid || claims.Email == "" {
				jsonError(w, "invalid authentication token", http.StatusUnauthorized)
				return
			}

			identity, err := resolveUser(r.Context(), pool, claims)
			if err != nil {
				jsonError(w, "could not resolve authenticated user", http.StatusInternalServerError)
				return
			}
			if !identity.IsActive {
				jsonError(w, "account is suspended", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), userIdentityKey{}, identity)))
		})
	}
}

func CurrentUser(ctx context.Context) (UserIdentity, bool) {
	identity, ok := ctx.Value(userIdentityKey{}).(UserIdentity)
	return identity, ok
}

func RequireRole(roles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(roles))
	for _, role := range roles {
		allowed[role] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			identity, ok := CurrentUser(r.Context())
			if !ok {
				jsonError(w, "authentication required", http.StatusUnauthorized)
				return
			}
			if _, allowed := allowed[identity.Role]; !allowed {
				jsonError(w, "insufficient permissions", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func resolveUser(ctx context.Context, pool *pgxpool.Pool, claims *identityClaims) (UserIdentity, error) {
	var identity UserIdentity
	name := strings.TrimSpace(claims.DisplayName)
	if name == "" {
		name = claims.Email
	}

	err := pool.QueryRow(ctx, `
		INSERT INTO users (email, display_name, role)
		VALUES ($1, $2, 'TENANT')
		ON CONFLICT (email) DO UPDATE
		SET display_name = CASE
			WHEN EXCLUDED.display_name <> '' THEN EXCLUDED.display_name
			ELSE users.display_name
		END,
		updated_at = NOW()
		RETURNING id, email, display_name, role, is_active
	`, strings.ToLower(strings.TrimSpace(claims.Email)), name).Scan(
		&identity.ID, &identity.Email, &identity.DisplayName, &identity.Role, &identity.IsActive,
	)
	return identity, err
}

func jsonError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, _ = w.Write([]byte(`{"ok":false,"error":"` + message + `"}`))
}
