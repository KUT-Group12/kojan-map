package main

import (
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"kojan-map/business/internal/api"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/middleware"
	"kojan-map/business/pkg/logger"
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

	// ルーティング登録（実装は後続タスクで追加予定）
	api.RegisterRoutes(app.Engine, app.DB)

	// アプリケーション起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := fmt.Sprintf(":%s", port)
	if err := app.Run(addr); err != nil {
		log.Error("Application runtime error: %v", err)
		os.Exit(1)
	}
}
