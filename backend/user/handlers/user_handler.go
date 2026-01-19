package handlers

import (
	"errors"
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

// getUserInfoHandler googleID から共通ロジック
func (uh *UserHandler) getUserInfoHandler(c *gin.Context) (*models.UserInfo, error) {
	// JWT から googleId を取得
	googleID, exists := c.Get("googleId")
	if !exists {
		return nil, errors.New("unauthorized: googleId not found in JWT")
	}

	googleIDStr, ok := googleID.(string)
	if !ok {
		return nil, errors.New("invalid googleId format")
	}

	return uh.userService.GetUserInfo(googleIDStr)
}

// GetMemberInfo 会員情報を取得
// GET /api/member/info
func (uh *UserHandler) GetMemberInfo(c *gin.Context) {
	userInfo, err := uh.getUserInfoHandler(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, userInfo)
}

// GetMypageDetails マイページ情報を取得
// GET /api/mypage/details
func (uh *UserHandler) GetMypageDetails(c *gin.Context) {
	userInfo, err := uh.getUserInfoHandler(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, userInfo)
}

// GetReactionHistory リアクション履歴を取得
// GET /api/posts/history/reactions
func (uh *UserHandler) GetReactionHistory(c *gin.Context) {
	userInfo, err := uh.getUserInfoHandler(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// リアクション履歴に基づいて投稿を取得
	var reactions []models.UserReaction
	if err := config.DB.Where("userId = ?", userInfo.UserID).
		Order("createdAt DESC").
		Find(&reactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch reactions"})
		return
	}

	postIDs := make([]int, 0, len(reactions))
	seen := make(map[int]struct{})
	for _, reaction := range reactions {
		if _, ok := seen[reaction.PostID]; ok {
			continue
		}
		seen[reaction.PostID] = struct{}{}
		postIDs = append(postIDs, reaction.PostID)
	}

	var reactionedPosts []models.Post
	if len(postIDs) > 0 {
		if err := config.DB.Where("postId IN ?", postIDs).Find(&reactionedPosts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch reactioned posts"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"posts": reactionedPosts,
		"total": len(reactionedPosts),
	})
}
