package api

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"github.com/umutungoapp/backend/internal/config"
)

type aiHandler struct {
	cfg *config.Config
}

const groqChatURL = "https://api.groq.com/openai/v1/chat/completions"

// chat handles POST /api/ai/chat
// Proxies the request body to Groq and streams the response back.
// The frontend must never call Groq directly — this keeps the API key server-side.
func (h *aiHandler) chat(w http.ResponseWriter, r *http.Request) {
	h.proxyToGroq(w, r, h.cfg.GroqModel)
}

// parseSearch handles POST /api/ai/parse-search
// Uses the fast model for low-latency filter extraction.
func (h *aiHandler) parseSearch(w http.ResponseWriter, r *http.Request) {
	h.proxyToGroq(w, r, h.cfg.GroqModelFast)
}

// proxyToGroq forwards the request body to the Groq API, injecting the
// server-side API key. The response is forwarded directly to the client.
func (h *aiHandler) proxyToGroq(w http.ResponseWriter, r *http.Request, model string) {
	if h.cfg.GroqAPIKey == "" {
		jsonError(w, "AI is not configured on this server", http.StatusServiceUnavailable)
		return
	}

	// Read and validate the incoming body
	body, err := io.ReadAll(io.LimitReader(r.Body, 64*1024))
	if err != nil {
		jsonError(w, "could not read request body", http.StatusBadRequest)
		return
	}

	// If the client sent a model field, we override it with the server-chosen model.
	// This prevents clients from using arbitrary models at our expense.
	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		jsonError(w, "invalid JSON body", http.StatusBadRequest)
		return
	}
	payload["model"] = model
	overridden, _ := json.Marshal(payload)

	req, err := http.NewRequestWithContext(r.Context(), http.MethodPost, groqChatURL, bytes.NewReader(overridden))
	if err != nil {
		jsonError(w, "could not build upstream request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+h.cfg.GroqAPIKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		jsonError(w, "AI service is temporarily unavailable", http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

	// Forward status and body
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
