package handler

import (
	"fmt"
	"net/http"
	"strings"

	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/response"

	"github.com/gin-gonic/gin"
)

// AuthHandler は認証関連のエンドポイントを処理します
type AuthHandler struct {
	authService service.AuthService
}

// NewAuthHandler は認証ハンドラーを生成します
func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// GoogleAuth はPOST /api/auth/google (M3-1)を処理します
func (h *AuthHandler) GoogleAuth(c *gin.Context) {
	var req domain.GoogleAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendBadRequest(c, err.Error())
		return
	}

	result, err := h.authService.GoogleAuth(c.Request.Context(), &req)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// BusinessLogin はPOST /api/auth/business/login (M1-1)を処理します
func (h *AuthHandler) BusinessLogin(c *gin.Context) {
	var req domain.BusinessLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendBadRequest(c, err.Error())
		return
	}

	result, err := h.authService.BusinessLogin(c.Request.Context(), req.SessionID, req.Gmail, req.MFACode)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// extractTokenFromHeader はAuthorizationヘッダーからJWTトークンを抽出します
// 期待される形式: "Authorization: Bearer <token>"
func (h *AuthHandler) extractTokenFromHeader(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return "", fmt.Errorf("authorization header is required")
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", fmt.Errorf("invalid authorization header format (expected: Bearer <token>)")
	}

	token := parts[1]
	if token == "" {
		return "", fmt.Errorf("token is empty")
	}

	return token, nil
}

// Logout はPOST /api/auth/logout (M1-3-3)を処理します
// Bearerトークンを含むAuthorizationヘッダーが必要です
func (h *AuthHandler) Logout(c *gin.Context) {
	// Authorizationヘッダーからトークンを抽出
	token, err := h.extractTokenFromHeader(c)
	if err != nil {
		response.SendProblem(c, http.StatusUnauthorized, "unauthorized", fmt.Sprintf("invalid authorization: %v", err), c.Request.URL.Path)
		return
	}

	// トークンを使ってログアウトサービスを呼び出す
	err = h.authService.Logout(c.Request.Context(), token)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, gin.H{"message": "logged out successfully"})
}

// Refresh はPOST /api/auth/refreshを処理し、アクセストークンを更新します
func (h *AuthHandler) Refresh(c *gin.Context) {
	var req domain.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", err.Error(), c.Request.URL.Path)
		return
	}

	result, err := h.authService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}
