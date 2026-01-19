package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"

	"kojan-map/user/models"
)

type AuthService struct {
	db             *gorm.DB
	googleClientID string
	jwtSecret      []byte
}

func NewAuthService(db *gorm.DB, googleClientID string, jwtSecretKey string) *AuthService {
	if jwtSecretKey == "" {
		log.Fatal("JWT_SECRET_KEY is not set")
	}
	return &AuthService{
		db:             db,
		googleClientID: googleClientID,
		jwtSecret:      []byte(jwtSecretKey),
	}
}

// Google OAuth Token response
type GoogleTokenResponse struct {
	Iss           string `json:"iss"`
	Azp           string `json:"azp"`
	Aud           string `json:"aud"`
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Picture       string `json:"picture"`
	Name          string `json:"name"`
	Iat           string `json:"iat"`
	Exp           string `json:"exp"`
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

// VerifyGoogleToken - Verify Google ID token via tokeninfo endpoint
func (as *AuthService) VerifyGoogleToken(idToken string) (*GoogleTokenResponse, error) {
	if idToken == "" {
		return nil, errors.New("empty id token")
	}

	url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)
	resp, err := http.Get(url)
	if err != nil {
		return nil, errors.New("failed to contact Google tokeninfo")
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("google token verification failed: %s", string(body))
	}

	var googleResp GoogleTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&googleResp); err != nil {
		return nil, errors.New("failed to parse Google response")
	}

	if as.googleClientID != "" && googleResp.Aud != as.googleClientID {
		return nil, errors.New("invalid audience")
	}

	return &googleResp, nil
}

// ExchangeTokenForUser - Exchange Google token for User and JWT
func (as *AuthService) ExchangeTokenForUser(googleToken, role string) (*AuthResponse, error) {
	// Verify Google ID token via tokeninfo endpoint
	googleResp, err := as.VerifyGoogleToken(googleToken)
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
		Gmail:            googleResp.Email,
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
		Email:    user.Gmail,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // 24時間有効
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(as.jwtSecret)
}

// VerifyJWT - Verify and parse JWT token
func (as *AuthService) VerifyJWT(tokenString string) (*JWTClaims, error) {
	claims := &JWTClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// HS256アルゴリズムのみ許可（Algorithm Confusion Attack対策）
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return as.jwtSecret, nil
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
