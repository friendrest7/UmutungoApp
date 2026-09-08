package api

import "testing"

func TestNormalizeRwandaPhone(t *testing.T) {
	tests := map[string]string{
		"0788123456":       "0788123456",
		"+250 788 123 456": "0788123456",
		"250788123456":     "0788123456",
		"0718123456":       "",
		"078812345":        "",
	}
	for input, expected := range tests {
		if got := normalizeRwandaPhone(input); got != expected {
			t.Fatalf("normalizeRwandaPhone(%q) = %q, want %q", input, got, expected)
		}
	}
}

func TestSecureOTP(t *testing.T) {
	code, err := secureOTP()
	if err != nil || len(code) != 6 {
		t.Fatalf("secureOTP() = %q, %v", code, err)
	}
}
