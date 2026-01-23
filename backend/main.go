package main

import (
	"fmt"
	"log"

	"kojan-map/router"
	"kojan-map/shared/config"
	userconfig "kojan-map/user/config"
	usermiddleware "kojan-map/user/middleware"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "kojan-map/docs" // Swagger docs
)

// @title こじゃんとやまっぷ API
// @version 1.0
// @description こじゃんとやまっぷのバックエンドAPIドキュメント
// @description
// @description このAPIは一般ユーザー、ビジネスユーザー、管理者向けの機能を提供します。
// @description 認証が必要なエンドポイントではBearer JWTトークンを使用します。

// @contact.name API サポート
// @contact.email support@kojan-map.example.com

// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description JWT認証トークン。ヘッダーに "Bearer {token}" の形式で指定してください。
func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db := config.ConnectDB(cfg)

	// Initialize user-side database context (shared with admin)
	userconfig.DB = db

	// Initialize user-side middleware
	jwtSecret := cfg.GetJWTSecret()
	usermiddleware.SetJWTSecret(jwtSecret)

	// Create Gin router
	r := gin.Default()

	// Apply CORS middleware
	r.Use(usermiddleware.CORSMiddleware())

	// Health check endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "こじゃんとやまっぷ API サーバー起動中！🚀",
			"status":  "healthy",
		})
	})

	// Setup routes
	router.SetupAdminRoutes(r, db)
	router.SetupUserRoutes(r, db)

	// Swagger UI endpoint
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Start server
	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("Server is running on port %s...", cfg.ServerPort)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
