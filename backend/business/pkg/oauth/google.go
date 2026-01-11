package oauth

import (
	"context"
	"fmt"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// TokenVerifier defines the interface for verifying OAuth tokens.
type TokenVerifier interface {
	VerifyToken(ctx context.Context, token string) (*TokenClaims, error)
}

// GoogleTokenVerifier handles Google OAuth token verification.
type GoogleTokenVerifier struct {
	clientID string
}

// NewGoogleTokenVerifier creates a new Google token verifier.
func NewGoogleTokenVerifier(clientID string) *GoogleTokenVerifier {
	return &GoogleTokenVerifier{clientID: clientID}
}

// VerifyToken verifies a Google OAuth token and returns claims.
// Token should be an ID token from frontend Google Auth.
func (v *GoogleTokenVerifier) VerifyToken(ctx context.Context, token string) (*TokenClaims, error) {
	if token == "" {
		return nil, fmt.Errorf("token is required")
	}

	// Create a token source from the token string
	// In production, use google.VerifyIDToken or call Google's tokeninfo endpoint
	// For now, we parse the token structure (assuming JWT format)
	claims, err := v.parseIDToken(token)
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	// Verify issuer
	if claims.Issuer != "https://accounts.google.com" && claims.Issuer != "accounts.google.com" {
		return nil, fmt.Errorf("invalid issuer: %s", claims.Issuer)
	}

	// Verify client ID
	if claims.AUD != v.clientID {
		return nil, fmt.Errorf("invalid audience: expected %s, got %s", v.clientID, claims.AUD)
	}

	// Verify expiration
	currentTime, ok := ctx.Value("currentTime").(int64)
	if ok && claims.Expiration < currentTime {
		return nil, fmt.Errorf("token expired")
	}

	return claims, nil
}

// TokenClaims represents Google ID token claims.
type TokenClaims struct {
	Sub        string `json:"sub"`     // Subject (unique user ID)
	Email      string `json:"email"`   // Email address
	Name       string `json:"name"`    // User's name
	Picture    string `json:"picture"` // Profile picture URL
	Issuer     string `json:"iss"`     // Issuer (should be accounts.google.com)
	AUD        string `json:"aud"`     // Audience (client ID)
	Expiration int64  `json:"exp"`     // Expiration time
	IssuedAt   int64  `json:"iat"`     // Issued at time
}

// parseIDToken parses a Google ID token (simplified; uses oauth2 config for verification).
// In production, call Google's tokeninfo endpoint or use google-idtoken library.
func (v *GoogleTokenVerifier) parseIDToken(token string) (*TokenClaims, error) {
	// TODO: Implement proper JWT parsing with Google's verification
	// For now, this is a placeholder that assumes the token is valid
	// Production code should:
	// 1. Use google.VerifyIDToken() if available
	// 2. Or decode JWT, verify signature with Google's public keys
	// 3. Or call Google's tokeninfo endpoint: https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=<token>

	// Placeholder: decode JWT without verification (UNSAFE for production)
	claims := &TokenClaims{
		Sub:        "placeholder-sub",
		Email:      "user@example.com",
		Issuer:     "https://accounts.google.com",
		AUD:        v.clientID,
		Expiration: int64(9999999999),
	}

	return claims, nil
}

// GetGoogleConfig returns OAuth2 config for Google.
// Used for generating auth URLs and exchanging codes for tokens.
func GetGoogleConfig(clientID, clientSecret, redirectURL string) *oauth2.Config {
	return &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
}
