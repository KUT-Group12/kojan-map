package handlers

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"kojan-map/user/services"
)

// AuthHandler 認証関連のハンドラー
type AuthHandler struct {
	userService *services.UserService
	authService *services.AuthService
}

// NewAuthHandler 認証ハンドラーを初期化
func NewAuthHandler(userService *services.UserService, authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		userService: userService,
		authService: authService,
	}
}

// Register ユーザー登録・ログイン
// POST /api/users/register
func (ah *AuthHandler) Register(c *gin.Context) {
	var req struct {
		GoogleToken string `json:"google_token" binding:"required"`
		Role        string `json:"role" binding:"omitempty,oneof=user business"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Google トークンを検証
	googleResp, err := ah.authService.VerifyGoogleToken(req.GoogleToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid google token"})
		return
	}

	session, err := ah.userService.RegisterOrLogin(googleResp.Sub, googleResp.Email, req.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"sessionId": session.SessionID})
}

// Logout ログアウト
// PUT /api/auth/logout
func (ah *AuthHandler) Logout(c *gin.Context) {
		var req struct {
			SessionID string `json:"sessionId"`
		}
		_ = c.ShouldBindJSON(&req)
		sessionID := req.SessionID
		if sessionID == "" {
			sessionID = c.GetString("sessionId")
		}
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
	// 退会API呼び出し時に必ずログ出力
	googleID := c.GetString("googleId")
	log.Printf("[Withdrawal] called. googleId: %s, Authorization: %s", googleID, c.GetHeader("Authorization"))
	if googleID == "" {
		log.Printf("[Withdrawal] googleIdが空です。認証失敗。Authorizationヘッダー: %s", c.GetHeader("Authorization"))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := ah.userService.DeleteUser(googleID); err != nil {
		log.Printf("[Withdrawal] DeleteUserエラー: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Printf("[Withdrawal] ユーザー削除成功: %s", googleID)
	c.JSON(http.StatusOK, gin.H{"message": "user deleted"})
}

// ExchangeToken - Exchange Google token for JWT token
// POST /api/auth/exchange-token
// Body: {"google_token": "...", "role": "user"}
// Response: {"jwt_token": "...", "user": {...}}
func (ah *AuthHandler) ExchangeToken(c *gin.Context) {
	var req struct {
		GoogleToken string `json:"google_token" binding:"required"`
		Role        string `json:"role" binding:"required,oneof=user business"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	// 1. Googleトークン検証
	googleResp, err := ah.authService.VerifyGoogleToken(req.GoogleToken)
	if err != nil {
		c.Error(err)
		log.Printf("[ExchangeToken] error: %v, google_token: %s, role: %s", err, req.GoogleToken, req.Role)
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// 2. ユーザー登録またはログイン（セッション発行）
	session, err := ah.userService.RegisterOrLogin(googleResp.Sub, googleResp.Email, req.Role)
	if err != nil {
		c.Error(err)
		log.Printf("[ExchangeToken] RegisterOrLogin error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 3. ユーザー情報取得
	user, err := ah.authService.GetUserByID(googleResp.Sub)
	if err != nil {
		c.Error(err)
		log.Printf("[ExchangeToken] GetUserByID error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 4. JWT発行
	jwttoken, err := ah.authService.GenerateJWT(user)
	if err != nil {
		c.Error(err)
		log.Printf("[ExchangeToken] GenerateJWT error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 5. レスポンス
	c.JSON(http.StatusOK, gin.H{
		"jwt_token": jwttoken,
		"user": user,
		"sessionId": session.SessionID,
	})
}

// VerifyToken - Verify JWT token
// POST /api/auth/verify-token
// Body: {"token": "..."}
// Response: {"user_id": "...", "email": "..."}
func (ah *AuthHandler) VerifyToken(c *gin.Context) {
	var req struct {
		Token string `json:"token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	claims, err := ah.authService.VerifyJWT(req.Token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id": claims.UserID,
		"email":   claims.Email,
		"role":    claims.Role,
	})
}

// GetCurrentUser - Get current user info from JWT token in Authorization header
// GET /api/auth/me
// Header: Authorization: Bearer <jwt_token>
// Response: {"id": "...", "email": "...", ...}
func (ah *AuthHandler) GetCurrentUser(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "no authorization header"})
		return
	}

	// Extract token from "Bearer <token>"
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header"})
		return
	}

	token := parts[1]
	claims, err := ah.authService.VerifyJWT(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	user, err := ah.authService.GetUserByID(claims.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// Refresh - Refresh JWT token (optional)
// POST /api/auth/refresh
// Header: Authorization: Bearer <jwt_token>
// Response: {"jwt_token": "..."}
func (ah *AuthHandler) Refresh(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "no authorization header"})
		return
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header"})
		return
	}

	token := parts[1]
	claims, err := ah.authService.VerifyJWT(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	user, err := ah.authService.GetUserByID(claims.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	newToken, err := ah.authService.GenerateJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"jwt_token": newToken})
}
