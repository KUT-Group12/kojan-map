package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"kojan-map/business/pkg/contextkeys"
	"kojan-map/business/pkg/jwt"
)

// AuthMiddleware はJWTトークンを検証し、UserID等をContextに設定します
func AuthMiddleware(tokenManager *jwt.TokenManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Authorizationヘッダーから Bearer トークンを抽出
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			c.Abort()
			return
		}

		// "Bearer <token>" フォーマットを検証
		const bearerScheme = "Bearer "
		if !strings.HasPrefix(authHeader, bearerScheme) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := authHeader[len(bearerScheme):]
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "empty token"})
			c.Abort()
			return
		}

		// トークンを検証してクレームを取得
		claims, err := tokenManager.VerifyToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("invalid token: %v", err)})
			c.Abort()
			return
		}

		// トークンがブラックリストに登録されていないか確認
		if tokenManager.IsTokenRevoked(tokenString) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token has been revoked"})
			c.Abort()
			return
		}

		// ContextにUserID, Gmail, Roleを設定
		// BusinessIDはuserIDから取得する必要があるため、ここでは設定しない
		newCtx := c.Request.Context()
		newCtx = contextkeys.WithUserID(newCtx, claims.UserID)
		newCtx = contextkeys.WithGmail(newCtx, claims.Gmail)
		newCtx = contextkeys.WithRole(newCtx, claims.Role)

		c.Request = c.Request.WithContext(newCtx)
		c.Next()
	}
}

// OptionalAuthMiddleware はJWTトークンを検証しますが、なくても続行します
// (公開エンドポイント用)
func OptionalAuthMiddleware(tokenManager *jwt.TokenManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Authorizationヘッダーから Bearer トークンを抽出
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// トークンがない場合は続行
			c.Next()
			return
		}

		// "Bearer <token>" フォーマットを検証
		const bearerScheme = "Bearer "
		if !strings.HasPrefix(authHeader, bearerScheme) {
			// フォーマットが不正な場合は続行（トークンなしとして扱う）
			c.Next()
			return
		}

		tokenString := authHeader[len(bearerScheme):]
		if tokenString == "" {
			c.Next()
			return
		}

		// トークンを検証してクレームを取得
		claims, err := tokenManager.VerifyToken(tokenString)
		if err != nil {
			// トークンが不正な場合は続行（トークンなしとして扱う）
			c.Next()
			return
		}

		// ブラックリスト確認
		if tokenManager.IsTokenRevoked(tokenString) {
			c.Next()
			return
		}

		// ContextにUserID, Gmail, Roleを設定
		newCtx := c.Request.Context()
		newCtx = contextkeys.WithUserID(newCtx, claims.UserID)
		newCtx = contextkeys.WithGmail(newCtx, claims.Gmail)
		newCtx = contextkeys.WithRole(newCtx, claims.Role)

		c.Request = c.Request.WithContext(newCtx)
		c.Next()
	}
}
