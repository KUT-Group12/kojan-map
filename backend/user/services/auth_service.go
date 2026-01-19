package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
	"google.golang.org/api/idtoken"

	"kojan-map/user/models"
)

var jwtSecret []byte

func init() {
	// JWT秘密鍵を起動時に初期化
	secret := os.Getenv("JWT_SECRET_KEY")
	if secret == "" {
		log.Fatal("JWT_SECRET_KEY environment variable is not set")
	}
	jwtSecret = []byte(secret)
}

type AuthService struct {
	db             *gorm.DB
	googleClientID string
}

func NewAuthService(db *gorm.DB, googleClientID string) *AuthService {
	return &AuthService{db: db, googleClientID: googleClientID}
}

// Google OAuth Token response
type GoogleTokenResponse struct {
	Iss           string
	Azp           string
	Aud           string
	Sub           string
	Email         string
	EmailVerified bool
	Picture       string
	Name          string
	Iat           int64
	Exp           int64
}

// Request body for token exchange
type TokenExchangeRequest struct {
	GoogleToken string `json:"google_token"`
	Role        string `json:"role"` // 'general' or 'business'
}

// Response for successful authentication
type AuthResponse struct {
	JWTToken string       `json:"jwt_token"`
	User     *models.User `json:"user"`
}

// JWTClaims - Custom JWT claims
type JWTClaims struct {
	UserID   string `json:"user_id"`
	GoogleID string `json:"google_id"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// VerifyGoogleToken - Verify Google ID token with audience check
func (as *AuthService) VerifyGoogleToken(ctx context.Context, token string) (*GoogleTokenResponse, error) {
	if as.googleClientID == "" {
		return nil, errors.New("google client id is not configured")
	}

	payload, err := idtoken.Validate(ctx, token, as.googleClientID)
	if err != nil {
		return nil, fmt.Errorf("google token verification failed: %w", err)
	}

	name, _ := payload.Claims["name"].(string)
	picture, _ := payload.Claims["picture"].(string)

	return &GoogleTokenResponse{
		Iss:           payload.Issuer,
		Azp:           payload.AuthorizedParty,
		Aud:           payload.Audience,
		Sub:           payload.Subject,
		Email:         payload.Email,
		EmailVerified: payload.EmailVerified,
		Picture:       picture,
		Name:          name,
		Iat:           payload.IssuedAt.Unix(),
		Exp:           payload.Expires.Unix(),
	}, nil
}

// ExchangeTokenForUser - Exchange Google token for User and JWT
func (as *AuthService) ExchangeTokenForUser(googleToken, role string) (*AuthResponse, error) {
	// Verify Google token (ID token) with audience check
	googleResp, err := as.VerifyGoogleToken(context.Background(), googleToken)
	if err != nil {
		return nil, fmt.Errorf("google token verification failed: %w", err)
	}

	// Find or create user
	user, err := as.findOrCreateUser(googleResp, role)
	if err != nil {
		return nil, fmt.Errorf("failed to find or create user: %w", err)
	}

	// Generate JWT token
	jwtToken, err := as.GenerateJWT(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate JWT: %w", err)
	}

	return &AuthResponse{
		JWTToken: jwtToken,
		User:     user,
	}, nil
}

// findOrCreateUser - Find existing user or create new one
func (as *AuthService) findOrCreateUser(googleResp *GoogleTokenResponse, role string) (*models.User, error) {
	var user models.User

	// Check if user with this Google ID exists
	result := as.db.Where("google_id = ?", googleResp.Sub).First(&user)

	if result.Error == nil {
		// User exists, update last login
		user.UpdatedAt = time.Now()
		as.db.Save(&user)
		return &user, nil
	}

	if result.Error != gorm.ErrRecordNotFound {
		return nil, result.Error
	}

	// Create new user
	newUser := models.User{
		ID:               fmt.Sprintf("user_%d", time.Now().UnixNano()),
		GoogleID:         googleResp.Sub,
		Email:            googleResp.Email,
		Role:             role,
		RegistrationDate: time.Now(),
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := as.db.Create(&newUser).Error; err != nil {
		return nil, err
	}

	return &newUser, nil
}

// GenerateJWT - Generate JWT token for user
func (as *AuthService) GenerateJWT(user *models.User) (string, error) {
	claims := JWTClaims{
		UserID:   user.ID,
		GoogleID: user.GoogleID,
		Email:    user.Email,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // 24時間有効
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// VerifyJWT - Verify and parse JWT token
func (as *AuthService) VerifyJWT(tokenString string) (*JWTClaims, error) {
	claims := &JWTClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	if !token.Valid {
		return nil, errors.New("token is not valid")
	}

	return claims, nil
}

// GetUserByID - Get user by ID
func (as *AuthService) GetUserByID(userID string) (*models.User, error) {
	var user models.User
	if err := as.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
