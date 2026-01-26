package router

import (
	"kojan-map/shared/config"
	"kojan-map/user/handlers"
	"kojan-map/user/middleware"
	"kojan-map/user/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupUserRoutes configures all user-facing API routes
func SetupUserRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// 1. Services Initialization
	authService := services.NewAuthService(db, cfg.GoogleClientID, cfg.JWTSecret, cfg.AppEnv)
	userService := services.NewUserService(db)
	postService := services.NewPostService(db)
	placeService := services.NewPlaceService(db)
	genreService := services.NewGenreService(db)
	blockService := services.NewBlockService(db)
	reportService := services.NewReportService(db)
	contactService := services.NewContactService(db)
	businessAppService := services.NewBusinessApplicationService(db)
	businessService := services.NewBusinessService(db)

	// 2. Handlers Initialization
	authHandler := handlers.NewAuthHandler(userService, authService)
	postHandler := handlers.NewPostHandler(postService, placeService, genreService)
	genreHandler := handlers.NewGenreHandler(genreService)
	otherHandler := handlers.NewBlockHandler(blockService)
	reportHandler := handlers.NewReportHandler(reportService)
	contactHandler := handlers.NewContactHandler(contactService)
	businessAppHandler := handlers.NewBusinessApplicationHandler(businessAppService)
	businessHandler := handlers.NewBusinessHandler(businessService, postService)

	// 3. Public routes
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

		// Genres (Public)
		api.GET("/genres", genreHandler.GetGenres)
	}

	// 4. Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// Posts (Write)
		protected.POST("/posts", postHandler.CreatePost)
		protected.DELETE("/posts", postHandler.DeletePost)         // 復活
		protected.POST("/posts/reaction", postHandler.AddReaction) // 復活
		protected.GET("/posts/reaction/status", postHandler.CheckReactionStatus)
		protected.GET("/posts/history", postHandler.GetPostHistory)
		protected.GET("/posts/history/reactions", postHandler.GetReactionHistory)

		// Block/Report/Inquiry
		protected.POST("/users/block", otherHandler.BlockUser)
		protected.DELETE("/users/block", otherHandler.UnblockUser)
		protected.GET("/users/block/list", otherHandler.GetBlockList)
		protected.POST("/report", reportHandler.CreateReport)
		protected.POST("/contact/validate", contactHandler.CreateContact)

		// Business Registration
		protected.POST("/business/application", businessAppHandler.CreateBusinessApplication)

		// Auth (Logout/Withdrawal)
		protected.GET("/auth/me", authHandler.GetCurrentUser) // 追加
		protected.PUT("/auth/logout", authHandler.Logout)
		protected.PUT("/auth/withdrawal", authHandler.Withdrawal)
	}

	// 5. Business-only routes
	business := r.Group("/api/business")
	business.Use(middleware.AuthMiddleware(), middleware.BusinessOnlyMiddleware())
	{
		business.GET("/stats", businessHandler.GetBusinessStats)
		business.GET("/profile", businessHandler.GetBusinessProfile)
		business.PUT("/profile", businessHandler.UpdateBusinessProfile)
		business.POST("/icon", businessHandler.UploadBusinessIcon)
		business.GET("/posts/count", businessHandler.GetBusinessPostCount)
		business.GET("/revenue", businessHandler.GetBusinessRevenue)
		business.PUT("/name", businessHandler.UpdateBusinessName)
		business.PUT("/address", businessHandler.UpdateBusinessAddress)
		business.PUT("/phone", businessHandler.UpdateBusinessPhone)
	}
}
