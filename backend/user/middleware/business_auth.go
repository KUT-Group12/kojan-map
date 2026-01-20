package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/user/models"
)

// BusinessOnlyMiddleware checks if the authenticated user has business role
// This middleware must be used after AuthMiddleware
func BusinessOnlyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user claims set by AuthMiddleware
		claimsInterface, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		claims, ok := claimsInterface.(*models.JWTClaims)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user claims"})
			c.Abort()
			return
		}

		// Check if user role is "business"
		if claims.Role != "business" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Business role required"})
			c.Abort()
			return
		}

		c.Next()
	}
}
