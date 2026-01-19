package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDatabase データベース接続を初期化
func InitDatabase() {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	var database *gorm.DB
	var err error

	// 最大30秒間、3秒ごとにリトライ
	maxRetries := 10
	for i := 0; i < maxRetries; i++ {
		database, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			DB = database
			log.Println("Database connected successfully")
			return
		}

		log.Printf("Failed to connect to database (attempt %d/%d): %v. Retrying in 3 seconds...", i+1, maxRetries, err)
		time.Sleep(3 * time.Second)
	}

	log.Fatal("Failed to connect to database after multiple retries:", err)
}
