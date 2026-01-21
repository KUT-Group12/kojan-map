package handler

import (
	"net/http"
	"strconv"

	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/response"

	"github.com/gin-gonic/gin"
)

// StatsHandler は統計関連のエンドポイントを処理するハンドラーです。
type StatsHandler struct {
	statsService service.StatsService
}

// NewStatsHandler は新しい統計ハンドラーを作成します。
func NewStatsHandler(statsService service.StatsService) *StatsHandler {
	return &StatsHandler{
		statsService: statsService,
	}
}

// GetTotalPosts は GET /api/business/post/total (M3-7-1) を処理します。
func (h *StatsHandler) GetTotalPosts(c *gin.Context) {
	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "businessId query parameter is required", c.Request.URL.Path)
		return
	}

	businessID, err := strconv.Atoi(businessIDStr)
	if err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "businessId must be a valid integer", c.Request.URL.Path)
		return
	}

	result, err := h.statsService.GetTotalPosts(c.Request.Context(), int32(businessID))
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// GetTotalReactions は GET /api/business/reaction/total (M3-7-2) を処理します。
func (h *StatsHandler) GetTotalReactions(c *gin.Context) {
	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "businessId query parameter is required", c.Request.URL.Path)
		return
	}

	businessID, err := strconv.Atoi(businessIDStr)
	if err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "businessId must be a valid integer", c.Request.URL.Path)
		return
	}

	result, err := h.statsService.GetTotalReactions(c.Request.Context(), int32(businessID))
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// GetTotalViews は GET /api/business/view/total (M3-7-3) を処理します。
func (h *StatsHandler) GetTotalViews(c *gin.Context) {
	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "businessId query parameter is required", c.Request.URL.Path)
		return
	}

	businessID, err := strconv.Atoi(businessIDStr)
	if err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "businessId must be a valid integer", c.Request.URL.Path)
		return
	}

	result, err := h.statsService.GetTotalViews(c.Request.Context(), int32(businessID))
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// GetEngagementRate は GET /api/business/engagement (M3-7-4) を処理します。
// エンゲージメント率 = (リアクション数 + ビュー数) / (投稿数 * 100)
func (h *StatsHandler) GetEngagementRate(c *gin.Context) {
	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "businessId query parameter is required", c.Request.URL.Path)
		return
	}

	businessID, err := strconv.Atoi(businessIDStr)
	if err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "businessId must be a valid integer", c.Request.URL.Path)
		return
	}

	result, err := h.statsService.GetEngagementRate(c.Request.Context(), int32(businessID))
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusOK, result)
}
