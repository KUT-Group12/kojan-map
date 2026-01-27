package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"kojan-map/user/services"
)

// AuthMiddleware verifies the JWT token and sets user info in the context.
func AuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims, err := authService.VerifyJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token", "details": err.Error()})
			c.Abort()
			return
		}

		c.Set("googleId", claims.GoogleID)
		c.Set("userRole", claims.Role)
		c.Next()
	}
}

// AdminOnlyMiddleware ensures only admin users can access the route
func AdminOnlyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists || role != "admin" {
			c.JSON(403, gin.H{"error": "admin access required"})
			c.Abort()
			return
		}
		c.Next()
	}
}
