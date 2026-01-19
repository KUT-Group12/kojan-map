package handler

import (
	"net/http"
	"strconv"

	"kojan-map/admin/service"

	"github.com/gin-gonic/gin"
)

// AdminContactHandler はお問い合わせに関する機能を処理するハンドラです.
type AdminContactHandler struct {
	service *service.AdminContactService
}

// NewAdminContactHandler creates a new AdminContactHandler.
//
// Parameters:
//   - s: 問い合わせ管理サービスのインスタンス
//
// Returns:
//   - *AdminContactHandler: 新しいハンドラーインスタンス
func NewAdminContactHandler(s *service.AdminContactService) *AdminContactHandler {
	return &AdminContactHandler{service: s}
}

// GetInquiries godoc
// @Summary 問い合わせ一覧を取得
// @Description 全ての問い合わせ情報を取得します
// @Tags Admin Inquiries
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "問い合わせ一覧"
// @Failure 500 {object} map[string]string "サーバーエラー"
// @Router /api/admin/inquiries [get]
// @Security BearerAuth
func (h *AdminContactHandler) GetInquiries(c *gin.Context) {
	asks, err := h.service.GetInquiries()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"asks": asks})
}

// ApproveInquiry godoc
// @Summary 問い合わせを処理済みにする
// @Description 指定したIDの問い合わせを処理済み状態に更新します
// @Tags Admin Inquiries
// @Accept json
// @Produce json
// @Param id path int true "問い合わせID"
// @Success 200 {object} map[string]bool "処理成功"
// @Failure 400 {object} map[string]string "不正なリクエスト"
// @Router /api/admin/inquiries/{id}/approve [put]
// @Security BearerAuth
func (h *AdminContactHandler) ApproveInquiry(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request ID"})
		return
	}

	err = h.service.ApproveInquiry(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// RejectInquiry godoc
// @Summary 問い合わせを却下する
// @Description 指定したIDの問い合わせを却下状態に更新します
// @Tags Admin Inquiries
// @Accept json
// @Produce json
// @Param id path int true "問い合わせID"
// @Success 200 {object} map[string]bool "却下成功"
// @Failure 400 {object} map[string]string "不正なリクエスト"
// @Router /api/admin/inquiries/{id}/reject [put]
// @Security BearerAuth
func (h *AdminContactHandler) RejectInquiry(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request ID"})
		return
	}

	err = h.service.RejectInquiry(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
