package jwt

import (
	"fmt"
	"os"
	"time"

	jwtlib "github.com/golang-jwt/jwt/v5"
)

// TokenManager handles JWT token generation and validation.
type TokenManager struct {
	secret    string
	blacklist *TokenBlacklist
}

// NewTokenManager creates a new token manager.
func NewTokenManager() *TokenManager {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "dev-secret-key-please-change-in-production"
	}
	return &TokenManager{
		secret:    secret,
		blacklist: NewTokenBlacklist(),
	}
}

// Claims represents JWT custom claims.
type Claims struct {
	UserID    string `json:"userId"`
	Gmail     string `json:"gmail"`
	Role      string `json:"role"`
	TokenType string `json:"tokenType"` // "access" or "refresh"
	jwtlib.RegisteredClaims
}

// GenerateToken generates a JWT token for the user (access token, 1 hour expiry).
func (tm *TokenManager) GenerateToken(userID, gmail, role string) (string, error) {
	if userID == "" || gmail == "" || role == "" {
		return "", fmt.Errorf("userId, gmail, and role are required")
	}

	expirationTime := time.Now().Add(1 * time.Hour) // 1 hour for access token
	claims := &Claims{
		UserID:    userID,
		Gmail:     gmail,
		Role:      role,
		TokenType: "access",
		RegisteredClaims: jwtlib.RegisteredClaims{
			ExpiresAt: jwtlib.NewNumericDate(expirationTime),
			IssuedAt:  jwtlib.NewNumericDate(time.Now()),
			Issuer:    "kojan-map-business",
		},
	}

	token := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(tm.secret))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

// GenerateTokenPair generates both access and refresh tokens.
func (tm *TokenManager) GenerateTokenPair(userID, gmail, role string) (accessToken, refreshToken string, err error) {
	if userID == "" || gmail == "" || role == "" {
		return "", "", fmt.Errorf("userId, gmail, and role are required")
	}

	// Access token: 1 hour
	accessExpiration := time.Now().Add(1 * time.Hour)
	accessClaims := &Claims{
		UserID:    userID,
		Gmail:     gmail,
		Role:      role,
		TokenType: "access",
		RegisteredClaims: jwtlib.RegisteredClaims{
			ExpiresAt: jwtlib.NewNumericDate(accessExpiration),
			IssuedAt:  jwtlib.NewNumericDate(time.Now()),
			Issuer:    "kojan-map-business",
		},
	}

	accessToken, err = jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, accessClaims).SignedString([]byte(tm.secret))
	if err != nil {
		return "", "", fmt.Errorf("failed to sign access token: %w", err)
	}

	// Refresh token: 7 days
	refreshExpiration := time.Now().Add(7 * 24 * time.Hour)
	refreshClaims := &Claims{
		UserID:    userID,
		Gmail:     gmail,
		Role:      role,
		TokenType: "refresh",
		RegisteredClaims: jwtlib.RegisteredClaims{
			ExpiresAt: jwtlib.NewNumericDate(refreshExpiration),
			IssuedAt:  jwtlib.NewNumericDate(time.Now()),
			Issuer:    "kojan-map-business",
		},
	}

	refreshToken, err = jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, refreshClaims).SignedString([]byte(tm.secret))
	if err != nil {
		return "", "", fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return accessToken, refreshToken, nil
}

// VerifyToken verifies and parses a JWT token.
func (tm *TokenManager) VerifyToken(tokenString string) (*Claims, error) {
	return tm.VerifyTokenWithType(tokenString, "")
}

// VerifyTokenWithType verifies a token with optional type check ("access" or "refresh").
func (tm *TokenManager) VerifyTokenWithType(tokenString, expectedType string) (*Claims, error) {
	// Check if token is revoked first
	if tm.blacklist.IsRevoked(tokenString) {
		return nil, fmt.Errorf("token has been revoked")
	}

	claims := &Claims{}
	token, err := jwtlib.ParseWithClaims(tokenString, claims, func(token *jwtlib.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwtlib.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(tm.secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("token is invalid")
	}

	// Check token type if specified
	if expectedType != "" && claims.TokenType != expectedType {
		return nil, fmt.Errorf("token type mismatch: expected %s, got %s", expectedType, claims.TokenType)
	}

	return claims, nil
}

// RevokeToken adds a token to the blacklist (used for logout).
func (tm *TokenManager) RevokeToken(tokenString string) error {
	claims, err := tm.VerifyToken(tokenString)
	if err != nil {
		return fmt.Errorf("cannot revoke invalid token: %w", err)
	}

	// Add token to blacklist with its expiration time
	if claims.ExpiresAt != nil {
		tm.blacklist.RevokeToken(tokenString, claims.ExpiresAt.Time)
	}else {
		// Fallback: revoke with a reasonable future time if no expiration
		tm.blacklist.RevokeToken(tokenString, time.Now().Add(24*time.Hour))
	}

	return nil
}

// Stop stops the token manager (cleanup goroutines).
func (tm *TokenManager) Stop() {
	tm.blacklist.Stop()
}
