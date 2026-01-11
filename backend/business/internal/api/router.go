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
	postRepo := impl.NewPostRepoImpl(db)
	blockRepo := impl.NewBlockRepoImpl(db)
	reportRepo := impl.NewReportRepoImpl(db)
	contactRepo := impl.NewContactRepoImpl(db)
	paymentRepo := impl.NewPaymentRepoImpl(db)

	// Initialize services
	authService := svcimpl.NewAuthServiceImpl(authRepo)
	memberService := svcimpl.NewMemberServiceImpl(memberRepo, authRepo)
	statsService := svcimpl.NewStatsServiceImpl(statsRepo)
	postService := svcimpl.NewPostServiceImpl(postRepo)
	blockService := svcimpl.NewBlockServiceImpl(blockRepo)
	reportService := svcimpl.NewReportServiceImpl(reportRepo)
	contactService := svcimpl.NewContactServiceImpl(contactRepo)
	paymentService := svcimpl.NewPaymentServiceImpl(paymentRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	memberHandler := handler.NewMemberHandler(memberService)
	statsHandler := handler.NewStatsHandler(statsService)
	postHandler := handler.NewPostHandler(postService)
	blockHandler := handler.NewBlockHandler(blockService)
	reportHandler := handler.NewReportHandler(reportService)
	contactHandler := handler.NewContactHandler(contactService)
	paymentHandler := handler.NewPaymentHandler(paymentService)

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

	// Post routes
	api.GET("/business/posts", postHandler.ListPosts)
	api.GET("/posts/:postId", postHandler.GetPost)
	api.POST("/posts", postHandler.CreatePost)
	api.PUT("/posts/anonymize", postHandler.AnonymizePost)
	api.GET("/posts/history", postHandler.GetPostHistory)

	// Block routes
	api.POST("/block", blockHandler.CreateBlock)
	api.DELETE("/block", blockHandler.DeleteBlock)

	// Report routes
	api.POST("/report", reportHandler.CreateReport)

	// Contact routes
	api.POST("/contact", contactHandler.CreateContact)

	// Stripe redirect (mock)
	api.POST("/business/stripe/redirect", paymentHandler.CreateRedirect)

	// Healthcheck
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
}

func notImplemented(c *gin.Context) {
	response.SendSuccess(c, http.StatusNotImplemented, gin.H{"message": "not implemented yet"})
}
