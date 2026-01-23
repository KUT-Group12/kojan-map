package middleware

import (
    "net/http"
    "os"
    "strings"

    "github.com/gin-gonic/gin"
)

// CORSMiddleware はCORSミドルウェア（user用）
func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
        if allowedOrigins == "" {
            allowedOrigins = "http://localhost:5173,http://localhost:3000"
        }

        origin := c.Request.Header.Get("Origin")
        if origin != "" && contains(strings.Split(allowedOrigins, ","), origin) {
            c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
            c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        }

        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }

        c.Next()
    }
}

// contains は文字列スライスに特定の文字列が含まれるかチェック
func contains(slice []string, str string) bool {
    for _, item := range slice {
        if strings.TrimSpace(item) == str {
            return true
        }
    }
    return false
}
