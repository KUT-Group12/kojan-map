package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"kojan-map/business/internal/api/handler"
	"kojan-map/business/internal/repository/impl"
	svcimpl "kojan-map/business/internal/service/impl"
	"kojan-map/business/pkg/response"
)

// RegisterRoutes sets up route groups for business backend.
func RegisterRoutes(r *gin.Engine, db *gorm.DB) {
	api := r.Group("/api")

	// Initialize repositories
	authRepo := impl.NewAuthRepoImpl(db)

	// Initialize services
	authService := svcimpl.NewAuthServiceImpl(authRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)

	// Auth routes
	api.POST("/auth/google", authHandler.GoogleAuth)
	api.POST("/auth/business/login", authHandler.BusinessLogin)
	api.POST("/auth/logout", authHandler.Logout)

	// Member routes (TODO)
	api.GET("/business/mypage/details", notImplemented)
	api.PUT("/business/member/name", notImplemented)
	api.PUT("/business/member/icon", notImplemented)
	api.PUT("/business/member/anonymize", notImplemented)
	api.GET("/business/member", notImplemented)

	// Dashboard stats routes (TODO)
	api.GET("/business/post/total", notImplemented)
	api.GET("/business/reaction/total", notImplemented)
	api.GET("/business/view/total", notImplemented)
	api.GET("/business/engagement", notImplemented)

	// Post routes (TODO)
	api.GET("/business/posts", notImplemented)
	api.GET("/posts/:postId", notImplemented)
	api.POST("/posts", notImplemented) // TODO: enforce 5MB image limit & MIME check in handler
	api.PUT("/posts/anonymize", notImplemented)
	api.GET("/posts/history", notImplemented)

	// Block routes (TODO)
	api.POST("/block", notImplemented)
	api.DELETE("/block", notImplemented)

	// Report routes (TODO)
	api.POST("/report", notImplemented)

	// Contact routes (TODO)
	api.POST("/contact", notImplemented)

	// Stripe redirect (TODO)
	api.POST("/business/stripe/redirect", notImplemented)

	// Healthcheck
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
}

func notImplemented(c *gin.Context) {
	response.SendSuccess(c, http.StatusNotImplemented, gin.H{"message": "not implemented yet"})
}
