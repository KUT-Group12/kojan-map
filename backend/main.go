package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"kojan-map/user/config"
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

func main() {
	// データベース接続を初期化
	config.InitDatabase()

	// マイグレーションを実行
	if err := migrations.RunMigrations(); err != nil {
		log.Fatal("Migration failed:", err)
	}

	// Ginエンジンを作成
	router := gin.Default()

	// CORSミドルウェアを追加
	router.Use(corsMiddleware())

	// サービスとハンドラーを初期化
	userService := &services.UserService{}
	authService := services.NewAuthService(config.DB)
	authHandler := handlers.NewAuthHandler(userService, authService)
	userHandler := handlers.NewUserHandler(userService)
	postService := &services.PostService{}
	placeService := services.NewPlaceService(config.DB)
	genreService := services.NewGenreService(config.DB)
	postHandler := handlers.NewPostHandler(postService, placeService, genreService)
	blockService := &services.BlockService{}
	blockHandler := handlers.NewBlockHandler(blockService)
	reportService := &services.ReportService{}
	reportHandler := handlers.NewReportHandler(reportService)
	contactService := &services.ContactService{}
	contactHandler := handlers.NewContactHandler(contactService)
	businessApplicationService := &services.BusinessApplicationService{}
	businessApplicationHandler := handlers.NewBusinessApplicationHandler(businessApplicationService)

	// ルートを設定
	setupRoutes(router, authHandler, userHandler, postHandler, blockHandler, reportHandler, contactHandler, businessApplicationHandler, middleware.AuthMiddleware())

	// サーバーを起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("こじゃんとやまっぷ API サーバー起動中！🚀 (Port: %s)\n", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

// setupRoutes ルーティングを設定
func setupRoutes(
	router *gin.Engine,
	authHandler *handlers.AuthHandler,
	userHandler *handlers.UserHandler,
	postHandler *handlers.PostHandler,
	blockHandler *handlers.BlockHandler,
	reportHandler *handlers.ReportHandler,
	contactHandler *handlers.ContactHandler,
	businessApplicationHandler *handlers.BusinessApplicationHandler,
	authMiddleware gin.HandlerFunc,
) {
	// ヘルスチェック
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "こじゃんとやまっぷ API サーバー起動中！🚀",
		})
	})

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
	router.PUT("/api/posts/anonymize", postHandler.AnonymizePost)
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
}

// corsMiddleware CORS設定
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
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