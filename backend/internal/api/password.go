package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type passwordHandler struct{ pool *pgxpool.Pool }

type passwordCredentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Role     string `json:"role"`
}

func (h *passwordHandler) login(w http.ResponseWriter, r *http.Request) {
	var input passwordCredentials
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid sign-in request", http.StatusBadRequest)
		return
	}
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	if input.Email == "" || input.Password == "" {
		jsonError(w, "email and password are required", http.StatusBadRequest)
		return
	}

	var user struct {
		ID, Email, DisplayName, Role, PasswordHash string
		IsActive bool
	}
	err := h.pool.QueryRow(r.Context(), `SELECT id,email,display_name,role,password_hash,is_active FROM users WHERE email=$1`, input.Email).
		Scan(&user.ID, &user.Email, &user.DisplayName, &user.Role, &user.PasswordHash, &user.IsActive)
	if err == pgx.ErrNoRows || user.PasswordHash == "" || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)) != nil {
		jsonError(w, "invalid email or password", http.StatusUnauthorized)
		return
	}
	if err != nil {
		jsonError(w, "could not sign in", http.StatusInternalServerError)
		return
	}
	if !user.IsActive {
		jsonError(w, "account is suspended", http.StatusForbidden)
		return
	}
	jsonOK(w, passwordUserPayload(user.ID, user.Email, user.DisplayName, user.Role))
}

func (h *passwordHandler) register(w http.ResponseWriter, r *http.Request) {
	var input passwordCredentials
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid registration request", http.StatusBadRequest)
		return
	}
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.Name = strings.TrimSpace(input.Name)
	input.Role = strings.ToUpper(strings.TrimSpace(input.Role))
	if input.Email == "" || !strings.Contains(input.Email, "@") || input.Name == "" || len(input.Name) > 160 {
		jsonError(w, "name and a valid email are required", http.StatusBadRequest)
		return
	}
	if len(input.Password) < 8 {
		jsonError(w, "password must be at least 8 characters", http.StatusBadRequest)
		return
	}
	if input.Role != "TENANT" && input.Role != "OWNER" && input.Role != "AGENT" {
		input.Role = "TENANT"
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		jsonError(w, "could not secure password", http.StatusInternalServerError)
		return
	}
	var id, email, name, role string
	err = h.pool.QueryRow(r.Context(), `
		INSERT INTO users (email,display_name,role,password_hash,verification_status)
		VALUES ($1,$2,$3,$4,CASE WHEN $3='TENANT' THEN 'VERIFIED' ELSE 'PENDING' END)
		RETURNING id,email,display_name,role`, input.Email, input.Name, input.Role, string(hash)).
		Scan(&id, &email, &name, &role)
	if err != nil {
		jsonError(w, "email is already registered", http.StatusConflict)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(passwordUserPayload(id, email, name, role))
}

func passwordUserPayload(id, email, name, role string) map[string]any {
	return map[string]any{"ok": true, "user": map[string]string{"id": id, "email": email, "name": name, "role": role}}
}

