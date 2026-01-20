package handler

import (
	"net/http"
	"strconv"

	"kojan-map/admin/service"

	"github.com/gin-gonic/gin"
)

// AdminUserHandlerは管理者がユーザの管理をするための機能を扱うためのハンドラーです．
type AdminUserHandler struct {
	service *service.AdminUserService
}

// NewAdminUserHandlerは新しいAdminUserHandlerを作るためのコンストラクタ関数です．
func NewAdminUserHandler(s *service.AdminUserService) *AdminUserHandler {
	return &AdminUserHandler{service: s}
}

// GetUsers godoc
// @Summary ユーザー一覧を取得
// @Description ページネーション付きで登録ユーザーの一覧を取得します
// @Tags Admin Users
// @Accept json
// @Produce json
// @Param page query int false "ページ番号" default(1)
// @Param pageSize query int false "1ページあたりの件数" default(20)
// @Success 200 {object} map[string]interface{} "ユーザー一覧とページネーション情報"
// @Failure 500 {object} map[string]string "サーバーエラー"
// @Router /api/users [get]
// @Security BearerAuth
func (h *AdminUserHandler) GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	result, err := h.service.GetUsers(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// DeleteUser godoc
// @Summary ユーザーを削除
// @Description 指定したユーザーIDのユーザーを削除します
// @Tags Admin Users
// @Accept json
// @Produce json
// @Param userId path string true "ユーザーID"
// @Success 200 {object} map[string]bool "削除成功"
// @Failure 400 {object} map[string]string "不正なリクエスト"
// @Router /api/admin/users/{userId} [delete]
// @Security BearerAuth
func (h *AdminUserHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	err := h.service.DeleteUser(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
