package models

import "github.com/golang-jwt/jwt/v5"

// JWTClaims - Custom JWT claims shared across auth middleware and services.
type JWTClaims struct {
	UserID   string `json:"user_id"`
	GoogleID string `json:"google_id"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}
