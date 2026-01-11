package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/business/pkg/response"
)

// RegisterRoutes sets up route groups for business backend.
// Handlers are placeholders; implementation will be added after DB schema alignment.
func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	// Auth
	api.POST("/auth/google", notImplemented)
	api.POST("/auth/business/login", notImplemented)
	api.POST("/auth/logout", notImplemented)

	// Member
	api.GET("/business/mypage/details", notImplemented)
	api.PUT("/business/member/name", notImplemented)
	api.PUT("/business/member/icon", notImplemented)
	api.PUT("/business/member/anonymize", notImplemented)
	api.GET("/business/member", notImplemented)

	// Dashboard stats
	api.GET("/business/post/total", notImplemented)
	api.GET("/business/reaction/total", notImplemented)
	api.GET("/business/view/total", notImplemented)
	api.GET("/business/engagement", notImplemented)

	// Posts
	api.GET("/business/posts", notImplemented)
	api.GET("/posts/:postId", notImplemented)
	api.POST("/posts", notImplemented) // TODO: enforce 5MB image limit & MIME check in handler
	api.PUT("/posts/anonymize", notImplemented)
	api.GET("/posts/history", notImplemented)

	// Blocks
	api.POST("/block", notImplemented)
	api.DELETE("/block", notImplemented)

	// Reports
	api.POST("/report", notImplemented)

	// Contact
	api.POST("/contact", notImplemented)

	// Stripe redirect
	api.POST("/business/stripe/redirect", notImplemented)

	// Healthcheck
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
}

func notImplemented(c *gin.Context) {
	response.SendSuccess(c, http.StatusNotImplemented, gin.H{"message": "not implemented yet"})
}
