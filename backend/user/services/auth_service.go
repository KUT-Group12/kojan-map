package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"

	"kojan-map/user/models"
)

type AuthService struct {
	db *gorm.DB
}

// getJWTSecret JWT秘密鍵を環境変数から取得
func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET_KEY")
	if secret == "" {
		panic("JWT_SECRET_KEY is not set in environment variables")
	}
	return []byte(secret)
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

// Google OAuth Token response
type GoogleTokenResponse struct {
	Iss           string `json:"iss"`
	Azp           string `json:"azp"`
	Aud           string `json:"aud"`
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	AtHash        string `json:"at_hash"`
	Picture       string `json:"picture"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Iat           int64  `json:"iat"`
	Exp           int64  `json:"exp"`
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

// VerifyGoogleToken - Verify Google OAuth token
// Note: This is a simplified verification. For production, use google-auth-library-golang
func (as *AuthService) VerifyGoogleToken(token string) (*GoogleTokenResponse, error) {
	// Google tokeninfo endpoint to verify token
	url := fmt.Sprintf("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s", token)

	resp, err := http.Get(url)
	if err != nil {
		return nil, errors.New("failed to verify token with Google")
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("google token verification failed: %s", string(body))
	}

	var googleResp GoogleTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&googleResp); err != nil {
		return nil, errors.New("failed to parse Google response")
	}

	return &googleResp, nil
}

// ExchangeTokenForUser - Exchange Google token for User and JWT
func (as *AuthService) ExchangeTokenForUser(googleToken, role string) (*AuthResponse, error) {
	// Verify Google token
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
	return token.SignedString(getJWTSecret())
}

// VerifyJWT - Verify and parse JWT token
func (as *AuthService) VerifyJWT(tokenString string) (*JWTClaims, error) {
	claims := &JWTClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return getJWTSecret(), nil
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
