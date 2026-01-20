package handler

import (
	"net/http"

	"kojan-map/admin/service"

	"github.com/gin-gonic/gin"
)

// AdminDashboardHandler handles admin dashboard requests.
type AdminDashboardHandler struct {
	service *service.AdminDashboardService
}

// NewAdminDashboardHandler creates a new AdminDashboardHandler.
//
// Parameters:
//   - s: ダッシュボードサービスのインスタンス
//
// Returns:
//   - *AdminDashboardHandler: 新しいハンドラーインスタンス
func NewAdminDashboardHandler(s *service.AdminDashboardService) *AdminDashboardHandler {
	return &AdminDashboardHandler{service: s}
}

// GetSummary godoc
// @Summary ダッシュボード統計を取得
// @Description 管理者ダッシュボード用の統計情報（ユーザー数、投稿数、未処理通報数等）を取得します
// @Tags Admin Dashboard
// @Accept json
// @Produce json
// @Success 200 {object} service.DashboardSummary "統計情報"
// @Failure 500 {object} map[string]string "サーバーエラー"
// @Router /api/admin/summary [get]
// @Security BearerAuth
func (h *AdminDashboardHandler) GetSummary(c *gin.Context) {
	summary, err := h.service.GetSummary()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, summary)
}
