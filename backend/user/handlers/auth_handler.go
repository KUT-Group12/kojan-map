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

// Register はGoogleトークンを使用してユーザー登録またはログインを行います。
// 新規ユーザーの場合は登録し、既存ユーザーの場合はログインします。
//
// @Summary ユーザー登録・ログイン
// @Description Googleトークンを使用してユーザー登録またはログインを行います
// @Tags 認証
// @Accept json
// @Produce json
// @Param request body object{google_token=string} true "Google認証トークン"
// @Success 200 {object} object{sessionId=string} "セッションID"
// @Failure 400 {object} object{error=string} "不正なリクエスト"
// @Failure 401 {object} object{error=string} "無効なGoogleトークン"
// @Failure 500 {object} object{error=string} "サーバーエラー"
// @Router /api/users/register [post]
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

// Logout は現在のセッションを無効化してログアウトします。
//
// @Summary ログアウト
// @Description 現在のセッションを無効化します
// @Tags 認証
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} object{sessionId=string} "セッションID"
// @Failure 400 {object} object{error=string} "セッションIDが必要"
// @Failure 500 {object} object{error=string} "サーバーエラー"
// @Router /api/auth/logout [put]
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

// Withdrawal はユーザーアカウントを完全に削除します。
//
// @Summary 退会処理
// @Description ユーザーアカウントを削除します
// @Tags 認証
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} object{message=string} "削除完了メッセージ"
// @Failure 401 {object} object{error=string} "認証されていません"
// @Failure 500 {object} object{error=string} "サーバーエラー"
// @Router /api/auth/withdrawal [put]
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

// ExchangeToken はGoogleトークンを検証し、JWT トークンとユーザー情報を返します。
//
// @Summary GoogleトークンをJWTトークンに交換
// @Description GoogleトークンをJWTトークンに交換し、ユーザー情報を返します
// @Tags 認証
// @Accept json
// @Produce json
// @Param request body object{google_token=string,role=string} true "Googleトークンとロール(general/business)"
// @Success 200 {object} object{jwt_token=string,user=object} "JWTトークンとユーザー情報"
// @Failure 400 {object} object{error=string} "不正なリクエスト"
// @Failure 401 {object} object{error=string} "認証失敗"
// @Router /api/auth/exchange-token [post]
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

// VerifyToken はJWTトークンを検証し、ユーザー情報を返します。
//
// @Summary JWTトークンの検証
// @Description JWTトークンを検証し、ユーザー情報を返します
// @Tags 認証
// @Accept json
// @Produce json
// @Param request body object{token=string} true "JWTトークン"
// @Success 200 {object} object{user_id=string,email=string,role=string} "ユーザー情報"
// @Failure 400 {object} object{error=string} "不正なリクエスト"
// @Failure 401 {object} object{error=string} "無効なトークン"
// @Router /api/auth/verify-token [post]
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

// GetCurrentUser はAuthorizationヘッダーのJWTトークンから現在のユーザー情報を取得します。
//
// @Summary 現在のユーザー情報を取得
// @Description AuthorizationヘッダーのJWTトークンから現在のユーザー情報を取得します
// @Tags 認証
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} object{id=string,email=string} "ユーザー情報"
// @Failure 401 {object} object{error=string} "認証エラー"
// @Failure 404 {object} object{error=string} "ユーザーが見つかりません"
// @Router /api/auth/me [get]
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

// Refresh は既存のJWTトークンから新しいトークンを生成します。
//
// @Summary JWTトークンのリフレッシュ
// @Description 既存のJWTトークンから新しいトークンを生成します
// @Tags 認証
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} object{jwt_token=string} "新しいJWTトークン"
// @Failure 401 {object} object{error=string} "認証エラー"
// @Failure 404 {object} object{error=string} "ユーザーが見つかりません"
// @Failure 500 {object} object{error=string} "サーバーエラー"
// @Router /api/auth/refresh [post]
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
