package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/response"
)

// StatsHandler handles statistics-related endpoints.
type StatsHandler struct {
	statsService service.StatsService
}

// NewStatsHandler creates a new stats handler.
func NewStatsHandler(statsService service.StatsService) *StatsHandler {
	return &StatsHandler{
		statsService: statsService,
	}
}

// GetTotalPosts handles GET /api/business/post/total (M3-7-1).
// SSOT Endpoint: GET /api/business/post/total
func (h *StatsHandler) GetTotalPosts(c *gin.Context) {
	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		response.SendBadRequest(c, "businessId query parameter is required")
		return
	}

	businessID, err := strconv.ParseInt(businessIDStr, 10, 64)
	if err != nil {
		response.SendBadRequest(c, "businessId must be a valid integer")
		return
	}

	result, err := h.statsService.GetTotalPosts(c.Request.Context(), businessID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// GetTotalReactions handles GET /api/business/reaction/total (M3-7-2).
// SSOT Endpoint: GET /api/business/reaction/total
func (h *StatsHandler) GetTotalReactions(c *gin.Context) {
	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		response.SendBadRequest(c, "businessId query parameter is required")
		return
	}

	businessID, err := strconv.ParseInt(businessIDStr, 10, 64)
	if err != nil {
		response.SendBadRequest(c, "businessId must be a valid integer")
		return
	}

	result, err := h.statsService.GetTotalReactions(c.Request.Context(), businessID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// GetTotalViews handles GET /api/business/view/total (M3-7-3).
// SSOT Endpoint: GET /api/business/view/total
func (h *StatsHandler) GetTotalViews(c *gin.Context) {
	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		response.SendBadRequest(c, "businessId query parameter is required")
		return
	}

	businessID, err := strconv.ParseInt(businessIDStr, 10, 64)
	if err != nil {
		response.SendBadRequest(c, "businessId must be a valid integer")
		return
	}

	result, err := h.statsService.GetTotalViews(c.Request.Context(), businessID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// GetEngagementRate handles GET /api/business/engagement (M3-7-4).
// SSOT Endpoint: GET /api/business/engagement
// SSOT Formula: エンゲージメント率 = (リアクション数 + ビュー数) / (投稿数 * 100)
func (h *StatsHandler) GetEngagementRate(c *gin.Context) {
	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		response.SendBadRequest(c, "businessId query parameter is required")
		return
	}

	businessID, err := strconv.ParseInt(businessIDStr, 10, 64)
	if err != nil {
		response.SendBadRequest(c, "businessId must be a valid integer")
		return
	}

	result, err := h.statsService.GetEngagementRate(c.Request.Context(), businessID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusOK, result)
}
