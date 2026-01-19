package handler

import (
	"net/http"
	"strconv"

	"kojan-map/admin/service"

	"github.com/gin-gonic/gin"
)

// AdminBusinessHandlerは，事業者に関してのリクエストを処理するハンドラです．
// 依存するサービス層のインスタンスを保持します．
type AdminBusinessHandler struct {
	service *service.AdminBusinessService
}

// AdminBusinessHandlerを新しく作成するためのコンストラクタ関数です．
// 引数 : s ビジネスロジックを担当するAdminBusinessHandlerへのポインタです．
func NewAdminBusinessHandler(s *service.AdminBusinessService) *AdminBusinessHandler {
	return &AdminBusinessHandler{service: s}
}

// GetApplicationsは未処理の事業者申請一覧を取得する機能です
// @Summary 申請一覧の取得
// @Description 未処理の事業者申請一覧を取得します
// @Tags Admin Business
// @Produce json
// @Success 200 {object} SuccessResponse "取得成功"
// @Failure 500 {object} ErrorResponse "サーバーエラー"
// @Router /api/admin/request [get]
func (h *AdminBusinessHandler) GetApplications(c *gin.Context) {
	applications, err := h.service.GetApplications()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"applications": applications})
}

// ApproveApplicationは指定されたIDを持つ申請を承認します．
// @Summary 申請承認
// @Description 指定された申請IDの申請を承認します
// @Tags Admin Business
// @Produce json
// @Param id path int true "申請ID"
// @Success 200 {object} SuccessResponse "承認成功"
// @Failure 400 {object} ErrorResponse "不正リクエスト"
// @Router /api/applications/{id}/approve [put]
func (h *AdminBusinessHandler) ApproveApplication(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid application ID"})
		return
	}

	err = h.service.ApproveApplication(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// RejextApplicationは指定されたIDを持つ申請を却下します．
// @Summary 申請却下
// @Description 指定されたIDを持つ申請を却下します
// @Produce json
// @Param id path int true "申請ID"
// @Success 200 {object} SuccessResponse "承認却下成功"
// @Failure 400 {object} ErrorResponse "不正リクエスト"
// @Router /api/applications/{id}/reject [put]
func (h *AdminBusinessHandler) RejectApplication(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid application ID"})
		return
	}

	err = h.service.RejectApplication(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
