package middleware

import (
	"github.com/gin-gonic/gin"
)

// AuthMiddleware is a stub authentication middleware
// TODO: Implement actual Google OAuth authentication
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Stub implementation: always authenticate as admin
		// In production, this should verify JWT/OAuth tokens
		c.Set("userRole", "admin")
		c.Set("userId", "admin-stub-user")
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
