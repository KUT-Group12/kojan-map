package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"kojan-map/business/internal/api"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/middleware"
	"kojan-map/business/pkg/logger"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// App はアプリケーション全体を管理する構造体
type App struct {
	Engine *gin.Engine
	DB     *gorm.DB
	Logger logger.Logger
}

// NewApp はアプリケーションを初期化
func NewApp(db *gorm.DB, log logger.Logger) *App {
	engine := gin.Default()

	// ミドルウェアの登録
	engine.Use(middleware.CORSMiddleware())
	engine.Use(middleware.ErrorHandlingMiddleware())

	return &App{
		Engine: engine,
		DB:     db,
		Logger: log,
	}
}

// Setup はアプリケーションのセットアップを実行
func (a *App) Setup() error {
	// テーブルの作成（マイグレーション）
	if err := a.DB.AutoMigrate(
		&domain.User{},
		&domain.BusinessMember{},
		&domain.Post{},
		&domain.PostImage{},
		&domain.Genre{},
		&domain.PostGenre{},
		&domain.Block{},
		&domain.Report{},
		&domain.Contact{},
	); err != nil {
		a.Logger.Error("Failed to migrate database: %v", err)
		return err
	}

	a.Logger.Info("Database migration completed successfully")

	// ルートの登録はここに追加される
	// a.setupRoutes() などを呼び出す

	return nil
}

// Run はアプリケーションを実行
func (a *App) Run(addr string) error {
	a.Logger.Info("Starting application on %s", addr)
	return a.Engine.Run(addr)
}

// InitDB はデータベース接続を初期化
func InitDB() (*gorm.DB, error) {
	// MySQLの接続文字列を環境変数から取得
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// デフォルト値（開発用）
		dsn = "root:root@tcp(localhost:3306)/kojanmap?parseTime=true&charset=utf8mb4&loc=Local"
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return db, nil
}

func main() {
	// ロガーの初期化
	log := logger.NewSimpleLogger()

	// データベースの初期化
	db, err := InitDB()
	if err != nil {
		log.Error("Database initialization failed: %v", err)
		os.Exit(1)
	}

	// アプリケーションの初期化
	app := NewApp(db, log)

	// セットアップ実行
	if err := app.Setup(); err != nil {
		log.Error("Application setup failed: %v", err)
		os.Exit(1)
	}

	// ルーティング登録とAuthServiceの取得
	authService := api.RegisterRoutes(app.Engine, app.DB)

	// HTTPサーバーの設定
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := fmt.Sprintf(":%s", port)
	srv := &http.Server{
		Addr:    addr,
		Handler: app.Engine,
	}

	// サーバーを別ゴルーチンで起動
	go func() {
		log.Info("Starting application on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Error("Application runtime error: %v", err)
			os.Exit(1)
		}
	}()

	// グレースフルシャットダウンのためのシグナルハンドリング
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutting down server...")

	// リソースのクリーンアップ
	if authService != nil {
		authService.Close()
		log.Info("AuthService resources cleaned up")
	}

	// HTTPサーバーのグレースフルシャットダウン（5秒のタイムアウト）
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Error("Server forced to shutdown: %v", err)
		os.Exit(1)
	}

	log.Info("Server exited gracefully")
}
