package main

import "testing"

func TestMigrationDatabaseURL(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "postgresql URL",
			input:    "postgresql://user:password@example.test:5432/umutungo?sslmode=require",
			expected: "pgx5://user:password@example.test:5432/umutungo?sslmode=require",
		},
		{
			name:     "postgres URL",
			input:    "postgres://user:password@example.test:5432/umutungo",
			expected: "pgx5://user:password@example.test:5432/umutungo",
		},
		{
			name:     "already normalized",
			input:    "pgx5://user:password@example.test:5432/umutungo",
			expected: "pgx5://user:password@example.test:5432/umutungo",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			actual, err := migrationDatabaseURL(test.input)
			if err != nil {
				t.Fatalf("migrationDatabaseURL returned an error: %v", err)
			}
			if actual != test.expected {
				t.Fatalf("migrationDatabaseURL = %q, expected %q", actual, test.expected)
			}
		})
	}
}

func TestMigrationDatabaseURLRejectsUnsupportedScheme(t *testing.T) {
	if _, err := migrationDatabaseURL("mysql://user:password@example.test/umutungo"); err == nil {
		t.Fatal("migrationDatabaseURL accepted an unsupported scheme")
	}
}
