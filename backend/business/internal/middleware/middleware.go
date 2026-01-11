package middleware

import (
	"net/http"

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
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
