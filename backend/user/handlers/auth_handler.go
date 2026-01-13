package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/user/services"
)

// AuthHandler 認証関連のハンドラー
type AuthHandler struct {
	userService *services.UserService
}

// NewAuthHandler 認証ハンドラーを初期化
func NewAuthHandler(userService *services.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

// Register ユーザー登録・ログイン
// POST /api/users/register
func (ah *AuthHandler) Register(c *gin.Context) {
	var req struct {
		GoogleID string `json:"googleId" binding:"required"`
		Email    string `json:"gmail" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	session, err := ah.userService.RegisterOrLogin(req.GoogleID, req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"sessionId": session.SessionID})
}

// Logout ログアウト
// PUT /api/auth/logout
func (ah *AuthHandler) Logout(c *gin.Context) {
	sessionID := c.GetString("sessionId")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "session id required"})
		return
	}

	if err := ah.userService.Logout(sessionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"sessionId": sessionID})
}

// Withdrawal 退会処理
// PUT /api/auth/withdrawal
func (ah *AuthHandler) Withdrawal(c *gin.Context) {
	var req struct {
		GoogleID string `json:"googleId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ah.userService.DeleteUser(req.GoogleID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "user deleted"})
}
