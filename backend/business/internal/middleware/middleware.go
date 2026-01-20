package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"kojan-map/business/pkg/errors"
)

// ErrorHandlingMiddleware はエラーハンドリングミドルウェア
func ErrorHandlingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// エラーがある場合の処理
		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			apiErr, ok := err.Err.(*errors.APIError)
			if !ok {
				// APIError以外の場合は500エラーにする
				c.JSON(http.StatusInternalServerError, gin.H{
					"errorCode": errors.ErrInternalServer,
					"message":   "Internal Server Error",
				})
				return
			}

			c.JSON(apiErr.StatusCode, gin.H{
				"errorCode": apiErr.ErrorCode,
				"message":   apiErr.Message,
			})
		}
	}
}

// CORSMiddleware はCORSミドルウェア
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 環境変数から許可オリジンを取得（デフォルト: 開発環境のみ）
		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			allowedOrigins = "http://localhost:5173,http://localhost:3000"
		}

		origin := c.Request.Header.Get("Origin")
		// オリジンが許可リストに含まれるか確認
		if origin != "" && contains(strings.Split(allowedOrigins, ","), origin) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
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
