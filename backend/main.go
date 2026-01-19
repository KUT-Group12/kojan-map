package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/gorm"

	"kojan-map/router"
	"kojan-map/shared/config"
	userconfig "kojan-map/user/config"
	"kojan-map/user/handlers"
	"kojan-map/user/middleware"
	"kojan-map/user/migrations"
	"kojan-map/user/services"
)

func init() {
	// .envファイルを読み込む
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}
}

// @title こじゃんとやまっぷ API
// @version 1.0
// @description 管理者用・一般会員用API
// @host localhost:8080
// @BasePath /
func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize JWT secret for middleware
	middleware.SetJWTSecret(cfg.JWTSecretKey)

	// Connect to database
	db := config.ConnectDB(cfg)
	// Share DB instance with user package services relying on user/config.DB
	userconfig.DB = db

	// マイグレーションを実行
	if err := migrations.RunMigrations(db); err != nil {
		log.Fatal("Migration failed:", err)
	}

	// Create Gin router
	r := gin.Default()

	// CORSミドルウェアを追加
	r.Use(corsMiddleware())

	// Health check endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "こじゃんとやまっぷ API サーバー起動中！🚀",
			"status":  "healthy",
		})
	})

	// Setup admin routes
	router.SetupAdminRoutes(r, db)

	// Setup user routes (一般会員用)
	setupUserRoutes(r, db, middleware.AuthMiddleware(), cfg.GoogleClientID, cfg)

	// Start server
	port := cfg.ServerPort
	if port == "" {
		port = os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}
	}

	addr := fmt.Sprintf(":%s", port)
	log.Printf("こじゃんとやまっぷ API サーバー起動中！🚀 (Port: %s)", port)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// setupUserRoutes 一般会員用ルーティングを設定
func setupUserRoutes(
	router *gin.Engine,
	db *gorm.DB,
	authMiddleware gin.HandlerFunc,
	googleClientID string,
	cfg *config.Config,
) {
	// サービスとハンドラーを初期化
	userService := &services.UserService{}
	authService := services.NewAuthService(db, googleClientID, cfg.JWTSecretKey)
	authHandler := handlers.NewAuthHandler(userService, authService)
	userHandler := handlers.NewUserHandler(userService)
	postService := &services.PostService{}
	placeService := services.NewPlaceService(db)
	genreService := services.NewGenreService(db)
	postHandler := handlers.NewPostHandler(postService, placeService, genreService)
	blockService := &services.BlockService{}
	blockHandler := handlers.NewBlockHandler(blockService)
	reportService := &services.ReportService{}
	reportHandler := handlers.NewReportHandler(reportService)
	contactService := &services.ContactService{}
	contactHandler := handlers.NewContactHandler(contactService)
	businessApplicationService := &services.BusinessApplicationService{}
	businessApplicationHandler := handlers.NewBusinessApplicationHandler(businessApplicationService)
	businessService := &services.BusinessService{}
	businessHandler := handlers.NewBusinessHandler(businessService, postService)

	// 認証関連ルート
	router.POST("/api/users/register", authHandler.Register)
	router.PUT("/api/auth/logout", authHandler.Logout)
	router.PUT("/api/auth/withdrawal", authHandler.Withdrawal)
	// Google OAuth 認証エンドポイント
	router.POST("/api/auth/exchange-token", authHandler.ExchangeToken)
	router.POST("/api/auth/verify-token", authHandler.VerifyToken)
	router.GET("/api/auth/me", authHandler.GetCurrentUser)
	router.POST("/api/auth/refresh", authHandler.Refresh)

	// ユーザー情報ルート
	router.GET("/api/member/info", userHandler.GetMemberInfo)
	router.GET("/api/mypage/details", userHandler.GetMypageDetails)
	router.GET("/api/posts/history/reactions", userHandler.GetReactionHistory)

	// 投稿関連ルート
	router.GET("/api/posts", postHandler.GetPosts)
	router.GET("/api/posts/detail", postHandler.GetPostDetail)
	router.POST("/api/posts", postHandler.CreatePost)
	router.DELETE("/api/posts", postHandler.DeletePost)
	router.GET("/api/posts/history", postHandler.GetPostHistory)
	router.GET("/api/posts/pin/scale", postHandler.GetPinSize)
	router.POST("/api/posts/reaction", postHandler.AddReaction)
	router.GET("/api/posts/reaction/status", postHandler.CheckReactionStatus)

	// 検索ルート
	router.GET("/api/posts/search", postHandler.SearchByKeyword)
	router.GET("/api/posts/search/genre", postHandler.SearchByGenre)
	router.GET("/api/posts/search/period", postHandler.SearchByPeriod)

	// ブロック関連ルート
	router.POST("/api/users/block", blockHandler.BlockUser)
	router.DELETE("/api/users/block", blockHandler.UnblockUser)
	router.GET("/api/users/block/list", blockHandler.GetBlockList)

	// 通報関連ルート
	router.POST("/api/report", reportHandler.CreateReport)

	// 問い合わせ関連ルート
	router.POST("/api/contact/validate", contactHandler.CreateContact)

	// 事業者申請関連ルート
	router.POST("/api/business/application", businessApplicationHandler.CreateBusinessApplication)

	// 事業者ユーザー関連ルート（認証必須）
	router.GET("/api/business/stats", authMiddleware, businessHandler.GetBusinessStats)
	router.GET("/api/business/profile", authMiddleware, businessHandler.GetBusinessProfile)
	router.PUT("/api/business/profile", authMiddleware, businessHandler.UpdateBusinessProfile)
	router.POST("/api/business/icon", authMiddleware, businessHandler.UploadBusinessIcon)
	router.GET("/api/business/posts/count", authMiddleware, businessHandler.GetBusinessPostCount)
	router.GET("/api/business/revenue", authMiddleware, businessHandler.GetBusinessRevenue)
	router.PUT("/api/business/name", authMiddleware, businessHandler.UpdateBusinessName)
	router.PUT("/api/business/address", authMiddleware, businessHandler.UpdateBusinessAddress)
	router.PUT("/api/business/phone", authMiddleware, businessHandler.UpdateBusinessPhone)
}

// corsMiddleware CORS設定
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			allowedOrigins = "*" // デフォルトは全許可（開発環境用）
		}
		c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigins)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
