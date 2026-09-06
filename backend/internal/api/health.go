package api

import (
	"encoding/json"
	"net/http"
	"time"
)

// healthHandler responds to GET /health with a simple JSON liveness check.
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"ok":      true,
		"service": "inzuhub-backend",
		"time":    time.Now().UTC().Format(time.RFC3339),
	})
}
