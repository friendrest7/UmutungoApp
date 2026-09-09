package api

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"github.com/umutungoapp/backend/internal/integrations"
)

type otpHandler struct {
	pool     *pgxpool.Pool
	sms      integrations.SMSProvider
	demoMode bool
}

type otpRequest struct {
	Phone   string `json:"phone"`
	Purpose string `json:"purpose"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Role    string `json:"role"`
}

type otpVerifyRequest struct {
	Phone   string `json:"phone"`
	Purpose string `json:"purpose"`
	Code    string `json:"code"`
}

func (h *otpHandler) request(w http.ResponseWriter, r *http.Request) {
	var input otpRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid OTP request", http.StatusBadRequest)
		return
	}
	phone := normalizeRwandaPhone(input.Phone)
	purpose := strings.ToUpper(strings.TrimSpace(input.Purpose))
	if phone == "" || !validOTPPurpose(purpose) {
		jsonError(w, "a valid Rwanda phone number and purpose are required", http.StatusBadRequest)
		return
	}
	metadata := map[string]string{}
	if purpose == "REGISTER" {
		input.Name = strings.TrimSpace(input.Name)
		input.Email = strings.ToLower(strings.TrimSpace(input.Email))
		input.Role = strings.ToUpper(strings.TrimSpace(input.Role))
		if input.Name == "" || len(input.Name) > 160 || input.Email == "" || !strings.Contains(input.Email, "@") || (input.Role != "TENANT" && input.Role != "OWNER" && input.Role != "AGENT") {
			jsonError(w, "registration requires name, email, and a valid role", http.StatusBadRequest)
			return
		}
		metadata = map[string]string{"name": input.Name, "email": input.Email, "role": input.Role}
	}
	if h.sms == nil && !h.demoMode {
		jsonError(w, "SMS/OTP provider is not configured", http.StatusServiceUnavailable)
		return
	}
	var recent int
	if err := h.pool.QueryRow(r.Context(), `SELECT COUNT(*) FROM otp_challenges WHERE phone=$1 AND created_at > NOW() - INTERVAL '10 minutes'`, phone).Scan(&recent); err != nil {
		jsonError(w, "could not check OTP rate limit", http.StatusInternalServerError)
		return
	}
	if recent >= 5 {
		jsonError(w, "too many OTP requests", http.StatusTooManyRequests)
		return
	}
	code, err := secureOTP()
	if h.demoMode {
		code = "111111"
	}
	if err != nil {
		jsonError(w, "could not create OTP", http.StatusInternalServerError)
		return
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(code), bcrypt.DefaultCost)
	if err != nil {
		jsonError(w, "could not secure OTP", http.StatusInternalServerError)
		return
	}
	var challengeID string
	metadataJSON, _ := json.Marshal(metadata)
	if err := h.pool.QueryRow(r.Context(), `INSERT INTO otp_challenges (phone,purpose,code_hash,expires_at,metadata) VALUES ($1,$2,$3,NOW()+INTERVAL '5 minutes',$4) RETURNING id`, phone, purpose, string(hashed), metadataJSON).Scan(&challengeID); err != nil {
		jsonError(w, "could not create OTP challenge", http.StatusInternalServerError)
		return
	}
	if h.sms != nil {
		if _, err := h.sms.SendOTP(r.Context(), integrations.OTPMessage{Phone: phone, Code: code}); err != nil {
			_, _ = h.pool.Exec(r.Context(), `DELETE FROM otp_challenges WHERE id=$1`, challengeID)
			jsonError(w, "could not send OTP", http.StatusBadGateway)
			return
		}
	} else if !h.demoMode {
		_, _ = h.pool.Exec(r.Context(), `DELETE FROM otp_challenges WHERE id=$1`, challengeID)
		jsonError(w, "SMS/OTP provider is not configured", http.StatusServiceUnavailable)
		return
	}
	response := map[string]any{"ok": true, "expires_in_seconds": 300}
	if h.demoMode {
		response["demo_mode"] = true
		response["demo_code"] = code
	}
	jsonOK(w, response)
}

func (h *otpHandler) verify(w http.ResponseWriter, r *http.Request) {
	var input otpVerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid OTP verification request", http.StatusBadRequest)
		return
	}
	phone := normalizeRwandaPhone(input.Phone)
	purpose := strings.ToUpper(strings.TrimSpace(input.Purpose))
	if phone == "" || len(strings.TrimSpace(input.Code)) != 6 || !validOTPPurpose(purpose) {
		jsonError(w, "phone, purpose, and six-digit code are required", http.StatusBadRequest)
		return
	}
	var challengeID, codeHash string
	var metadata json.RawMessage
	var attempts int
	err := h.pool.QueryRow(r.Context(), `SELECT id,code_hash,attempt_count,metadata FROM otp_challenges WHERE phone=$1 AND purpose=$2 AND consumed_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`, phone, purpose).Scan(&challengeID, &codeHash, &attempts, &metadata)
	if err == pgx.ErrNoRows {
		jsonError(w, "OTP expired or not found", http.StatusUnauthorized)
		return
	}
	if err != nil {
		jsonError(w, "could not load OTP", http.StatusInternalServerError)
		return
	}
	if attempts >= 5 {
		jsonError(w, "OTP attempt limit reached", http.StatusTooManyRequests)
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(codeHash), []byte(strings.TrimSpace(input.Code))); err != nil {
		_, _ = h.pool.Exec(r.Context(), `UPDATE otp_challenges SET attempt_count=attempt_count+1 WHERE id=$1`, challengeID)
		jsonError(w, "invalid OTP", http.StatusUnauthorized)
		return
	}
	if _, err := h.pool.Exec(r.Context(), `UPDATE otp_challenges SET consumed_at=NOW() WHERE id=$1`, challengeID); err != nil {
		jsonError(w, "could not consume OTP", http.StatusInternalServerError)
		return
	}
	var user struct {
		ID          string
		Email       string
		DisplayName string
		Role        string
	}
	accountExists := h.pool.QueryRow(r.Context(), `UPDATE users SET phone_verified=TRUE, updated_at=NOW() WHERE phone=$1 RETURNING id,email,display_name,role`, phone).Scan(&user.ID, &user.Email, &user.DisplayName, &user.Role) == nil
	if !accountExists && purpose == "REGISTER" {
		var registration struct {
			Name  string `json:"name"`
			Email string `json:"email"`
			Role  string `json:"role"`
		}
		if err := json.Unmarshal(metadata, &registration); err != nil || registration.Name == "" || registration.Email == "" {
			jsonError(w, "registration details are missing", http.StatusBadRequest)
			return
		}
		err := h.pool.QueryRow(r.Context(), `INSERT INTO users (email,phone,phone_verified,display_name,role,verification_status) VALUES ($1,$2,TRUE,$3,$4,CASE WHEN $4='TENANT' THEN 'VERIFIED' ELSE 'PENDING' END) RETURNING id,email,display_name,role`, registration.Email, phone, registration.Name, registration.Role).Scan(&user.ID, &user.Email, &user.DisplayName, &user.Role)
		if err != nil {
			jsonError(w, "email or phone is already registered", http.StatusConflict)
			return
		}
		accountExists = true
	}
	payload := map[string]any{"ok": true, "phone": phone, "verified": true, "account_exists": accountExists}
	if accountExists {
		payload["user"] = map[string]any{"id": user.ID, "email": user.Email, "name": user.DisplayName, "role": user.Role}
	}
	jsonOK(w, payload)
}

func secureOTP() (string, error) {
	var bytes [4]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return "", err
	}
	number := uint32(bytes[0])<<24 | uint32(bytes[1])<<16 | uint32(bytes[2])<<8 | uint32(bytes[3])
	return fmt.Sprintf("%06d", number%1000000), nil
}

var rwandaPhone = regexp.MustCompile(`^07[2389][0-9]{7}$`)

func normalizeRwandaPhone(value string) string {
	phone := strings.NewReplacer(" ", "", "-", "", "(", "", ")", "").Replace(strings.TrimSpace(value))
	if strings.HasPrefix(phone, "+250") {
		phone = "0" + strings.TrimPrefix(phone, "+250")
	}
	if strings.HasPrefix(phone, "250") {
		phone = "0" + strings.TrimPrefix(phone, "250")
	}
	if !rwandaPhone.MatchString(phone) {
		return ""
	}
	return phone
}

func validOTPPurpose(value string) bool {
	return value == "REGISTER" || value == "LOGIN" || value == "PHONE_VERIFY" || value == "PASSWORD_RESET"
}
