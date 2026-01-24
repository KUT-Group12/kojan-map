package handler

import (
	"net/http"
	"strconv"

	"kojan-map/admin/service"

	"github.com/gin-gonic/gin"
)

// AdminReportHandler handles admin report management requests.
type AdminReportHandler struct {
	service *service.AdminReportService
}

// NewAdminReportHandler creates a new AdminReportHandler.
//
// Parameters:
//   - s: 通報管理サービスのインスタンス
//
// Returns:
//   - *AdminReportHandler: 新しいハンドラーインスタンス
func NewAdminReportHandler(s *service.AdminReportService) *AdminReportHandler {
	return &AdminReportHandler{service: s}
}

// GetReports はページネーション付きで通報一覧を取得します。
//
// @Summary 通報一覧を取得
// @Description ページネーション付きで通報一覧を取得します
// @Tags Admin Reports
// @Accept json
// @Produce json
// @Param page query int false "ページ番号" default(1)
// @Param pageSize query int false "1ページあたりの件数" default(20)
// @Param handled query bool false "処理済みフィルター"
// @Success 200 {object} service.ReportListResponse "通報一覧"
// @Failure 500 {object} map[string]string "サーバーエラー"
// @Router /api/admin/reports [get]
// @Security BearerAuth
func (h *AdminReportHandler) GetReports(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	var handled *bool
	if handledStr := c.Query("handled"); handledStr != "" {
		handledVal := handledStr == "true"
		handled = &handledVal
	}

	result, err := h.service.GetReports(page, pageSize, handled)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetReportDetail は指定したIDの通報詳細と対象投稿情報を取得します。
//
// @Summary 通報詳細を取得
// @Description 指定したIDの通報詳細と対象投稿情報を取得します
// @Tags Admin Reports
// @Accept json
// @Produce json
// @Param id path int true "通報ID"
// @Success 200 {object} service.ReportDetailResponse "通報詳細"
// @Failure 400 {object} map[string]string "不正なリクエスト"
// @Failure 404 {object} map[string]string "通報が見つからない"
// @Router /api/admin/reports/{id} [get]
// @Security BearerAuth
func (h *AdminReportHandler) GetReportDetail(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report ID"})
		return
	}

	result, err := h.service.GetReportDetail(int32(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// HandleReport は指定したIDの通報を処理済み状態に更新します。
//
// @Summary 通報を処理済みにする
// @Description 指定したIDの通報を処理済み状態に更新します
// @Tags Admin Reports
// @Accept json
// @Produce json
// @Param id path int true "通報ID"
// @Success 200 {object} map[string]bool "処理成功"
// @Failure 400 {object} map[string]string "不正なリクエスト"
// @Router /api/admin/reports/{id}/handle [put]
// @Security BearerAuth

func (h *AdminReportHandler) HandleReport(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report ID"})
		return
	}

	err = h.service.MarkAsHandled(int32(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
