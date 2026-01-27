package config

import (
	"fmt"
	"log"
	"time" // timeパッケージを追加

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// ConnectDB establishes a database connection
func ConnectDB(cfg *Config) *gorm.DB {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	var db *gorm.DB
	var err error

	// リトライ設定: 1秒おきに最大30回試行 (計30秒待機)
	maxRetries := 30
	for i := 0; i < maxRetries; i++ {
		// 接続試行中はエラーログを抑制するために Silent モードを使用
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		})

		if err == nil {
			break // 接続成功したらループを抜ける
		}

		log.Printf("Waiting for database to be ready (attempt %d/%d)...", i+1, maxRetries)
		time.Sleep(1 * time.Second)
	}

	// ループ後もエラーならFatalで終了
	if err != nil {
		log.Fatalf("Failed to connect to database after %d attempts: %v", maxRetries, err)
	}

	// 接続成功後はログレベルを Info に戻す（必要に応じて）
	db.Logger = logger.Default.LogMode(logger.Info)

	// ★DBコネクションプール設定
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get sql.DB from gorm.DB: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)  // 待機する接続数
	sqlDB.SetMaxOpenConns(100) // 最大接続数
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Database connection established successfully")
	return db
}
