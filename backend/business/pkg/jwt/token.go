package jwt

import (
	"fmt"
	"os"
	"time"

	jwtlib "github.com/golang-jwt/jwt/v5"
)

// TokenManager handles JWT token generation and validation.
type TokenManager struct {
	secret string
}

// NewTokenManager creates a new token manager.
func NewTokenManager() *TokenManager {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "dev-secret-key-please-change-in-production"
	}
	return &TokenManager{secret: secret}
}

// Claims represents JWT custom claims.
type Claims struct {
	UserID string `json:"userId"`
	Gmail  string `json:"gmail"`
	Role   string `json:"role"`
	jwtlib.RegisteredClaims
}

// GenerateToken generates a JWT token for the user.
func (tm *TokenManager) GenerateToken(userID, gmail, role string) (string, error) {
	if userID == "" || gmail == "" || role == "" {
		return "", fmt.Errorf("userId, gmail, and role are required")
	}

	expirationTime := time.Now().Add(24 * time.Hour) // Token valid for 24 hours
	claims := &Claims{
		UserID: userID,
		Gmail:  gmail,
		Role:   role,
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

// VerifyToken verifies and parses a JWT token.
func (tm *TokenManager) VerifyToken(tokenString string) (*Claims, error) {
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

	return claims, nil
}
