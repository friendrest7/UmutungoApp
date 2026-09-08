// Package integrations defines provider boundaries for external services.
// Concrete providers belong behind these interfaces and must be configured at
// deployment time; the domain layer must never treat an unconfigured provider
// as a successful operation.
package integrations

import (
	"context"
	"errors"
)

var ErrNotConfigured = errors.New("integration provider is not configured")

type OTPMessage struct {
	Phone string
	Code  string
}

type SMSProvider interface {
	SendOTP(context.Context, OTPMessage) (providerReference string, err error)
	Send(context.Context, string, string) (providerReference string, err error)
}

// EmailProvider is the boundary for transactional email (receipts, OTPs and
// booking updates). A concrete provider can be added when its API key is supplied.
type EmailMessage struct {
	To      string
	Subject string
	Body    string
}

type EmailProvider interface {
	Send(context.Context, EmailMessage) (providerReference string, err error)
}

type PushMessage struct {
	Token string
	Title string
	Body  string
	Data  map[string]string
}

type PushProvider interface {
	Send(context.Context, PushMessage) (providerReference string, err error)
}

type PaymentRequest struct {
	Provider string
	Amount   int64
	Currency string
	Phone    string
	Purpose  string
}

type PaymentProvider interface {
	Request(context.Context, PaymentRequest) (providerReference string, err error)
	VerifyCallback(context.Context, []byte, string) (providerReference string, successful bool, err error)
}

type ObjectStorage interface {
	CreateUploadURL(context.Context, string, string, int64) (string, error)
	Delete(context.Context, string) error
}

type Geocoder interface {
	Resolve(context.Context, float64, float64) (province, district, sector, cell, village string, err error)
}

type SearchProvider interface {
	IndexListing(context.Context, map[string]any) error
	DeleteListing(context.Context, string) error
}
