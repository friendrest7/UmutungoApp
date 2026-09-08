package api

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/inzuhub/backend/internal/integrations"
	"github.com/inzuhub/backend/internal/middleware"
)

type paymentHandler struct {
	pool     *pgxpool.Pool
	provider integrations.PaymentProvider
}

type subscriptionCheckout struct {
	PlanCode string `json:"plan_code"`
	Provider string `json:"provider"`
	Phone    string `json:"phone"`
}

func (h *paymentHandler) plans(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pool.Query(r.Context(), `SELECT code,display_name,monthly_price,currency,listing_expiry_days,monthly_post_cap FROM subscription_plans WHERE is_active=TRUE ORDER BY CASE code WHEN 'SILVER' THEN 1 WHEN 'GOLD' THEN 2 WHEN 'PLATINUM' THEN 3 ELSE 4 END`)
	if err != nil {
		jsonError(w, "could not fetch subscription plans", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type plan struct {
		Code       string   `json:"code"`
		Name       string   `json:"display_name"`
		Price      *float64 `json:"monthly_price,omitempty"`
		Currency   string   `json:"currency"`
		ExpiryDays *int     `json:"listing_expiry_days,omitempty"`
		MonthlyCap *int     `json:"monthly_post_cap,omitempty"`
	}
	items := make([]plan, 0)
	for rows.Next() {
		var item plan
		if err := rows.Scan(&item.Code, &item.Name, &item.Price, &item.Currency, &item.ExpiryDays, &item.MonthlyCap); err != nil {
			jsonError(w, "could not read subscription plan", http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}
	jsonOK(w, map[string]any{"ok": true, "plans": items})
}

func (h *paymentHandler) checkout(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	var input subscriptionCheckout
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid subscription checkout", http.StatusBadRequest)
		return
	}
	input.PlanCode = strings.ToUpper(strings.TrimSpace(input.PlanCode))
	input.Provider = strings.ToUpper(strings.TrimSpace(input.Provider))
	if input.PlanCode != "SILVER" && input.PlanCode != "GOLD" && input.PlanCode != "PLATINUM" {
		jsonError(w, "unsupported subscription plan", http.StatusBadRequest)
		return
	}
	if input.Provider != "MTN_MOMO" && input.Provider != "AIRTEL_MONEY" {
		jsonError(w, "provider must be MTN_MOMO or AIRTEL_MONEY", http.StatusBadRequest)
		return
	}
	var price float64
	var currency string
	err := h.pool.QueryRow(r.Context(), `SELECT monthly_price,currency FROM subscription_plans WHERE code=$1 AND is_active=TRUE`, input.PlanCode).Scan(&price, &currency)
	if err == pgx.ErrNoRows {
		jsonError(w, "subscription plan not found", http.StatusNotFound)
		return
	}
	if err != nil {
		jsonError(w, "could not load subscription plan", http.StatusInternalServerError)
		return
	}
	if price <= 0 {
		jsonError(w, "this subscription plan is not priced yet", http.StatusConflict)
		return
	}
	if h.provider == nil {
		jsonError(w, "mobile-money provider is not configured", http.StatusServiceUnavailable)
		return
	}
	providerReference, err := h.provider.Request(r.Context(), integrations.PaymentRequest{Provider: input.Provider, Amount: int64(price), Currency: currency, Phone: strings.TrimSpace(input.Phone), Purpose: "SUBSCRIPTION"})
	if err != nil {
		jsonError(w, "could not start mobile-money payment", http.StatusBadGateway)
		return
	}
	var subscriptionID, paymentID string
	tx, err := h.pool.Begin(r.Context())
	if err != nil {
		jsonError(w, "could not start payment transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())
	if err = tx.QueryRow(r.Context(), `INSERT INTO subscriptions (user_id,plan_code,status,provider_reference) VALUES ($1,$2,'PENDING',$3) RETURNING id`, identity.ID, input.PlanCode, providerReference).Scan(&subscriptionID); err != nil {
		jsonError(w, "could not create subscription", http.StatusInternalServerError)
		return
	}
	if err = tx.QueryRow(r.Context(), `INSERT INTO payments (user_id,subscription_id,purpose,provider,provider_reference,amount,currency) VALUES ($1,$2,'SUBSCRIPTION',$3,$4,$5,$6) RETURNING id`, identity.ID, subscriptionID, input.Provider, providerReference, price, currency).Scan(&paymentID); err != nil {
		jsonError(w, "could not create payment", http.StatusInternalServerError)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		jsonError(w, "could not save payment", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "payment_id": paymentID, "subscription_id": subscriptionID, "status": "PENDING"})
}

func (h *paymentHandler) history(w http.ResponseWriter, r *http.Request) {
	identity, _ := middleware.CurrentUser(r.Context())
	rows, err := h.pool.Query(r.Context(), `SELECT id,purpose,provider,amount,currency,status,receipt_number,created_at,confirmed_at FROM payments WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`, identity.ID)
	if err != nil {
		jsonError(w, "could not fetch payment history", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type payment struct {
		ID          string     `json:"id"`
		Purpose     string     `json:"purpose"`
		Provider    string     `json:"provider"`
		Amount      float64    `json:"amount"`
		Currency    string     `json:"currency"`
		Status      string     `json:"status"`
		Receipt     *string    `json:"receipt_number,omitempty"`
		CreatedAt   time.Time  `json:"created_at"`
		ConfirmedAt *time.Time `json:"confirmed_at,omitempty"`
	}
	items := make([]payment, 0)
	for rows.Next() {
		var item payment
		if err := rows.Scan(&item.ID, &item.Purpose, &item.Provider, &item.Amount, &item.Currency, &item.Status, &item.Receipt, &item.CreatedAt, &item.ConfirmedAt); err != nil {
			jsonError(w, "could not read payment", http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}
	jsonOK(w, map[string]any{"ok": true, "payments": items})
}

func (h *paymentHandler) webhook(w http.ResponseWriter, r *http.Request) {
	if h.provider == nil {
		jsonError(w, "payment provider is not configured", http.StatusServiceUnavailable)
		return
	}
	jsonError(w, "webhook verification is not configured", http.StatusNotImplemented)
}
