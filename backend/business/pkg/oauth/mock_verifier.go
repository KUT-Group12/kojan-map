package oauth

import (
	"context"
	"fmt"
)

// MockGoogleTokenVerifier is a mock implementation for testing.
type MockGoogleTokenVerifier struct {
	clientID string
}

// NewMockGoogleTokenVerifier creates a mock token verifier for testing.
func NewMockGoogleTokenVerifier(clientID string) *MockGoogleTokenVerifier {
	return &MockGoogleTokenVerifier{clientID: clientID}
}

// VerifyToken returns mock claims for testing.
// For test tokens, it extracts the googleID from the token string.
func (v *MockGoogleTokenVerifier) VerifyToken(ctx context.Context, token string) (*TokenClaims, error) {
	if token == "" {
		return nil, fmt.Errorf("token is required")
	}

	// For test purposes, use the token as a hint for the subject
	// In real tests, you'd pass specific tokens that encode user information
	claims := &TokenClaims{
		Sub:        "user123", // Default test user
		Email:      "test@example.com",
		Name:       "Test User",
		Issuer:     "https://accounts.google.com",
		AUD:        v.clientID,
		Expiration: int64(9999999999), // Far future
	}

	return claims, nil
}
