package config

import (
	"log"
	"os"
)

// Config holds all configuration for the application
type Config struct {
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	ServerPort     string
	JWTSecret      string
	GoogleClientID string
	AppEnv         string
	FrontendURL    string // ←追加確認済み
}

// Load loads configuration from environment variables with defaults
func Load() *Config {
	// JWT_SECRET_KEY is required for security
	jwtSecret := os.Getenv("JWT_SECRET_KEY")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET_KEY environment variable must be set")
	}

	return &Config{
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "3306"),
		DBUser:         getEnv("DB_USER", "root"),
		DBPassword:     getEnv("DB_PASSWORD", ""),
		DBName:         getEnv("DB_NAME", "kojanmap"),
		ServerPort:     getEnv("SERVER_PORT", "8080"),
		JWTSecret:      jwtSecret,
		GoogleClientID: getEnv("GOOGLE_CLIENT_ID", ""),
		AppEnv:         getEnv("APP_ENV", "dev"),
		FrontendURL:    getEnv("FRONTEND_URL", "http://localhost:5173"), // ←追加確認済み
	}
}

func (c *Config) GetJWTSecret() string {
	return c.JWTSecret
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
