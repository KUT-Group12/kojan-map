package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/user/services"
)

// テスト用ユーザー登録リクエスト
type TestRegisterRequest struct {
	GoogleID string `json:"googleId" binding:"required"`
	Gmail    string `json:"gmail" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

// TestUserHandler テスト用ユーザー登録ハンドラー
func TestRegisterUserHandler(userService *services.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req TestRegisterRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 既存ユーザーがいればスキップ
		_, err := userService.GetUserInfo(req.GoogleID)
		if err == nil {
			c.JSON(http.StatusOK, gin.H{"message": "user already exists"})
			return
		}

		// 新規ユーザー登録
		if err := userService.CreateTestUser(req.GoogleID, req.Gmail, req.Role); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "test user registered"})
	}
}
