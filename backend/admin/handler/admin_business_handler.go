package handler

import (
	"net/http"
	"strconv"

	"kojan-map/admin/service"

	"github.com/gin-gonic/gin"
)

// AdminBusinessHandler は事業者申請に関するリクエストを処理するハンドラです.
type AdminBusinessHandler struct {
	service *service.AdminBusinessService
}

// NewAdminBusinessHandler creates a new AdminBusinessHandler.
//
// Parameters:
//   - s: 事業者申請管理サービスのインスタンス
//
// Returns:
//   - *AdminBusinessHandler: 新しいハンドラーインスタンス
func NewAdminBusinessHandler(s *service.AdminBusinessService) *AdminBusinessHandler {
	return &AdminBusinessHandler{service: s}
}

// GetApplications は未処理の事業者申請一覧を取得します。
//
// @Summary 事業者申請一覧を取得
// @Description 未処理の事業者申請一覧を取得します
// @Tags Admin Business
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "申請一覧"
// @Failure 500 {object} map[string]string "サーバーエラー"
// @Router /api/admin/applications [get]
// @Security BearerAuth
func (h *AdminBusinessHandler) GetApplications(c *gin.Context) {
	applications, err := h.service.GetApplications()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"applications": applications})
}

// ApproveApplication は指定したIDの事業者申請を承認し、事業者会員を作成します。
//
// @Summary 事業者申請を承認
// @Description 指定したIDの事業者申請を承認し、事業者会員を作成します
// @Tags Admin Business
// @Accept json
// @Produce json
// @Param id path int true "申請ID"
// @Success 200 {object} map[string]bool "承認成功"
// @Failure 400 {object} map[string]string "不正なリクエスト"
// @Router /api/admin/applications/{id}/approve [put]
// @Security BearerAuth
func (h *AdminBusinessHandler) ApproveApplication(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid application ID"})
		return
	}

	err = h.service.ApproveApplication(int32(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// RejectApplication は指定したIDの事業者申請を却下します。
//
// @Summary 事業者申請を却下
// @Description 指定したIDの事業者申請を却下します
// @Tags Admin Business
// @Accept json
// @Produce json
// @Param id path int true "申請ID"
// @Success 200 {object} map[string]bool "却下成功"
// @Failure 400 {object} map[string]string "不正なリクエスト"
// @Router /api/admin/applications/{id}/reject [put]
// @Security BearerAuth
func (h *AdminBusinessHandler) RejectApplication(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid application ID"})
		return
	}

	err = h.service.RejectApplication(int32(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
