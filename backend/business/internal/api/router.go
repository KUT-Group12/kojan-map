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
	memberRepo := impl.NewBusinessMemberRepoImpl(db)
	statsRepo := impl.NewStatsRepoImpl(db)

	// Initialize services
	authService := svcimpl.NewAuthServiceImpl(authRepo)
	memberService := svcimpl.NewMemberServiceImpl(memberRepo, authRepo)
	statsService := svcimpl.NewStatsServiceImpl(statsRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	memberHandler := handler.NewMemberHandler(memberService)
	statsHandler := handler.NewStatsHandler(statsService)

	// Auth routes
	api.POST("/auth/google", authHandler.GoogleAuth)
	api.POST("/auth/business/login", authHandler.BusinessLogin)
	api.POST("/auth/logout", authHandler.Logout)

	// Member routes
	api.GET("/business/mypage/details", memberHandler.GetBusinessDetails)
	api.PUT("/business/member/name", memberHandler.UpdateBusinessName)
	api.PUT("/business/member/icon", memberHandler.UpdateBusinessIcon)
	api.PUT("/business/member/anonymize", memberHandler.AnonymizeMember)
	api.GET("/business/member", memberHandler.GetMemberInfo)

	// Dashboard stats routes
	api.GET("/business/post/total", statsHandler.GetTotalPosts)
	api.GET("/business/reaction/total", statsHandler.GetTotalReactions)
	api.GET("/business/view/total", statsHandler.GetTotalViews)
	api.GET("/business/engagement", statsHandler.GetEngagementRate)

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
