package api

import (
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

type locationsHandler struct{ pool *pgxpool.Pool }

func (h *locationsHandler) list(w http.ResponseWriter, r *http.Request) {
	level := strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("level")))
	parent := strings.TrimSpace(r.URL.Query().Get("parent_code"))
	valid := map[string]bool{"": true, "PROVINCE": true, "DISTRICT": true, "SECTOR": true, "CELL": true, "VILLAGE": true}
	if !valid[level] {
		jsonError(w, "unsupported location level", http.StatusBadRequest)
		return
	}
	rows, err := h.pool.Query(r.Context(), `SELECT code,name,admin_level,parent_code FROM rwanda_locations WHERE ($1='' OR admin_level=$1) AND (($2='' AND parent_code IS NULL) OR parent_code=$2) ORDER BY name`, level, parent)
	if err != nil {
		jsonError(w, "could not fetch locations", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type location struct {
		Code       string  `json:"code"`
		Name       string  `json:"name"`
		Level      string  `json:"admin_level"`
		ParentCode *string `json:"parent_code,omitempty"`
	}
	items := make([]location, 0)
	for rows.Next() {
		var item location
		if err := rows.Scan(&item.Code, &item.Name, &item.Level, &item.ParentCode); err != nil {
			jsonError(w, "could not read location", http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}
	jsonOK(w, map[string]any{"ok": true, "locations": items})
}
