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
	FrontendURL    string
	AllowedOrigins []string // ←追加
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
		FrontendURL:    getEnv("FRONTEND_URL", "http://localhost:5173"),
		AllowedOrigins: getAllowedOrigins(),
	}
}

func getAllowedOrigins() []string {
	originsStr := os.Getenv("ALLOWED_ORIGINS")
	if originsStr == "" {
		return []string{"http://localhost:5173"}
	}
	// カンマ区切りでパース
	var origins []string
	current := ""
	for _, r := range originsStr {
		if r == ',' {
			if current != "" {
				origins = append(origins, current)
			}
			current = ""
		} else {
			current += string(r)
		}
	}
	if current != "" {
		origins = append(origins, current)
	}
	return origins
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
