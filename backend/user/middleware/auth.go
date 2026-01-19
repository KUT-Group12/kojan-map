package middleware

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"kojan-map/user/config"
	"kojan-map/user/models"
)

var jwtSecret []byte

// SetJWTSecret sets the JWT secret for middleware to use
func SetJWTSecret(secret string) {
	if secret == "" {
		log.Fatal("JWT_SECRET_KEY cannot be empty")
	}
	jwtSecret = []byte(secret)
}

// AuthMiddleware JWT認証ミドルウェア
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		if jwtSecret == nil {
			log.Println("JWT secret is not initialized")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			c.Abort()
			return
		}

		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			// [must] アルゴリズム検証: HMACのみを許可
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil {
			log.Printf("Token parsing failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(*JWTClaims)
		if !ok || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// [must] セッション無効化チェック: RevokedAt が設定されていないか確認
		var session models.Session
		result := config.DB.Where("id = ?", claims.UserID).First(&session)
		if result.Error == nil && session.RevokedAt != nil {
			// セッションが無効化されている
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Session has been revoked"})
			c.Abort()
			return
		}

		// セッション有効期限チェック
		if time.Now().After(claims.ExpiresAt.Time) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token expired"})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("user", claims)
		c.Next()
	}
}

// JWTClaims - Custom JWT claims
type JWTClaims struct {
	UserID   string `json:"user_id"`
	GoogleID string `json:"google_id"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}
