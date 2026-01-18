package oauth

import (
	"context"
	"fmt"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/idtoken"
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

	// Validate ID token using Google's official idtoken package
	// This verifies signature, expiration, issuer, and audience
	payload, err := idtoken.Validate(ctx, token, v.clientID)
	if err != nil {
		return nil, fmt.Errorf("failed to validate token: %w", err)
	}

	// Extract claims from validated payload
	claims := &TokenClaims{
		Sub:        payload.Subject,
		Issuer:     payload.Issuer,
		AUD:        payload.Audience,
		Expiration: payload.Expires,
		IssuedAt:   payload.IssuedAt,
	}

	// Extract email (required claim)
	if email, ok := payload.Claims["email"].(string); ok {
		claims.Email = email
	} else {
		return nil, fmt.Errorf("email claim not found in token")
	}

	// Optional: Extract additional claims if present
	if name, ok := payload.Claims["name"].(string); ok {
		claims.Name = name
	}
	if picture, ok := payload.Claims["picture"].(string); ok {
		claims.Picture = picture
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
