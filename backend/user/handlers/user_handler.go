package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/user/config"
	"kojan-map/user/models"
	"kojan-map/user/services"
)

// UserHandler ユーザー情報関連のハンドラー
type UserHandler struct {
	userService *services.UserService
}

// NewUserHandler ユーザーハンドラーを初期化
func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetMemberInfo 会員情報を取得
// GET /api/member/info
func (uh *UserHandler) GetMemberInfo(c *gin.Context) {
	googleID := c.Query("googleId")
	if googleID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "googleId required"})
		return
	}

	userInfo, err := uh.userService.GetUserInfo(googleID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, userInfo)
}

// GetMypageDetails マイページ情報を取得
// GET /api/mypage/details
func (uh *UserHandler) GetMypageDetails(c *gin.Context) {
	googleID := c.Query("googleId")
	if googleID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "googleId required"})
		return
	}

	userInfo, err := uh.userService.GetUserInfo(googleID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, userInfo)
}

// GetReactionHistory リアクション履歴を取得
// GET /api/posts/history/reactions
func (uh *UserHandler) GetReactionHistory(c *gin.Context) {
	googleID := c.Query("googleId")
	if googleID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "googleId required"})
		return
	}

	// ユーザーIDを取得
	var user models.User
	if err := config.DB.Where("google_id = ?", googleID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// リアクション履歴に基づいて投稿を取得
	var reactions []models.UserReaction
	if err := config.DB.Where("user_id = ?", user.ID).Find(&reactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// リアクション済みの投稿IDを取得
	var reactionedPosts []models.Post
	for _, reaction := range reactions {
		var post models.Post
		if err := config.DB.Where("id = ?", reaction.PostID).First(&post).Error; err == nil {
			reactionedPosts = append(reactionedPosts, post)
		}
	}

	c.JSON(http.StatusOK, gin.H{"posts": reactionedPosts})
}
