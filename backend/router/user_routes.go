package router

import (
	"kojan-map/user/handlers"
	"kojan-map/user/services"
	"kojan-map/user/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupUserRoutes configures all user-facing API routes
func SetupUserRoutes(r *gin.Engine, _ *gorm.DB) {
	// services
	authService := &services.AuthService{}
	userService := &services.UserService{}
	postService := &services.PostService{}
	placeService := &services.PlaceService{}
	genreService := &services.GenreService{}
	blockService := &services.BlockService{}
	reportService := &services.ReportService{}
	contactService := &services.ContactService{}
	businessAppService := &services.BusinessApplicationService{}
	businessService := &services.BusinessService{}

	// handlers
	authHandler := handlers.NewAuthHandler(userService, authService)
	postHandler := handlers.NewPostHandler(postService, placeService, genreService)
	otherHandler := handlers.NewBlockHandler(blockService) // This handler name in code is BlockHandler
	reportHandler := handlers.NewReportHandler(reportService)
	contactHandler := handlers.NewContactHandler(contactService)
	businessAppHandler := handlers.NewBusinessApplicationHandler(businessAppService)
	businessHandler := handlers.NewBusinessHandler(businessService, postService)

	// Public routes
	api := r.Group("/api")
	{
		// Auth
		api.POST("/users/register", authHandler.Register)
		api.POST("/auth/exchange-token", authHandler.ExchangeToken)
		
		// Posts (Read)
		api.GET("/posts", postHandler.GetPosts)
		api.GET("/posts/detail", postHandler.GetPostDetail)
		api.GET("/posts/search", postHandler.SearchByKeyword)
		api.GET("/posts/search/genre", postHandler.SearchByGenre)
		api.GET("/posts/search/period", postHandler.SearchByPeriod)
	}

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// Posts (Write)
		protected.POST("/posts", postHandler.CreatePost)
		protected.DELETE("/posts", postHandler.DeletePost)
		protected.POST("/posts/reaction", postHandler.AddReaction)
		protected.GET("/posts/reaction/status", postHandler.CheckReactionStatus)
		protected.GET("/posts/history", postHandler.GetPostHistory)
		protected.GET("/posts/history/reactions", postHandler.GetPostHistory) // Reuse for now or update service

		// Block/Report/Inquiry
		protected.POST("/users/block", otherHandler.BlockUser)
		protected.DELETE("/users/block", otherHandler.UnblockUser)
		protected.GET("/users/block/list", otherHandler.GetBlockList)
		protected.POST("/report", reportHandler.CreateReport)
		protected.POST("/contact/validate", contactHandler.CreateContact)

		// Business Registration
		protected.POST("/business/application", businessAppHandler.CreateBusinessApplication)

		// Business Dashboard (Business Role required - should add more middleware if needed)
		protected.GET("/business/stats", businessHandler.GetBusinessStats)
		protected.GET("/business/profile", businessHandler.GetBusinessProfile)
		protected.PUT("/business/profile", businessHandler.UpdateBusinessProfile)
		protected.POST("/business/icon", businessHandler.UploadBusinessIcon)
		protected.GET("/business/posts/count", businessHandler.GetBusinessPostCount)
		protected.GET("/business/revenue", businessHandler.GetBusinessRevenue)
		protected.PUT("/business/name", businessHandler.UpdateBusinessName)
		protected.PUT("/business/address", businessHandler.UpdateBusinessAddress)
		protected.PUT("/business/phone", businessHandler.UpdateBusinessPhone)

		// Auth (Logout/Withdrawal)
		protected.PUT("/auth/logout", authHandler.Logout)
		protected.PUT("/auth/withdrawal", authHandler.Withdrawal)
	}
}
