package main

import (
	"context" // ★追加
	"fmt"
	"log"
	"net/http"  // ★追加
	"os"        // ★追加
	"os/signal" // ★追加
	"time"      // ★追加

	"kojan-map/router"
	"kojan-map/shared/config"
	userconfig "kojan-map/user/config"
	usermiddleware "kojan-map/user/middleware"
	// "kojan-map/user/migrations"
	"kojan-map/user/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// @title こじゃんとやまっぷ API
// @version 1.0
// @description 管理者用API
// @host localhost:8080
// @BasePath /
func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db := config.ConnectDB(cfg)

	// DBマイグレーション（dev/test環境のみ）
	if cfg.AppEnv == "dev" || cfg.AppEnv == "test" {
		log.Printf("Current Environment: %s - Running AutoMigrate...", cfg.AppEnv)
		if err := db.AutoMigrate(
			&models.User{},
			&models.Post{},
			&models.Place{},
			&models.Genre{},
			&models.UserReaction{},
			&models.UserBlock{},
			&models.Report{},
			&models.Contact{},
			&models.BusinessRequest{},
			&models.Session{}, // Sessionテーブル保証
		); err != nil {
			log.Fatalf("DB migration failed: %v", err)
		}
	} else {
		log.Printf("Current Environment: %s - Skipping AutoMigrate for safety.", cfg.AppEnv)
	}

	// Initialize user-side database context
	userconfig.DB = db

	// Initialize user-side middleware
	jwtSecret := cfg.GetJWTSecret()
	usermiddleware.SetJWTSecret(jwtSecret)

	// Create Gin router
	r := gin.Default()

	// CORS configuration
	// Configから取得したURLを使用するように統一
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health check endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "こじゃんとやまっぷ API サーバー起動中！🚀",
			"status":  "healthy",
			"env":     cfg.AppEnv,
		})
	})

	// Setup routes
	router.SetupAdminRoutes(r, db)
	router.SetupUserRoutes(r, db, cfg)

	// Start server with Graceful Shutdown support
	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	// ゴルーチンでサーバー起動
	go func() {
		log.Printf("Server is running on port %s in %s mode...", cfg.ServerPort, cfg.AppEnv)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// 終了シグナル待機 (Graceful Shutdown)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exited gracefully")
}
