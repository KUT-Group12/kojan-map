package handler

import (
	"net/http"

	"kojan-map/admin/service"

	"github.com/gin-gonic/gin"
)

// AdminDashboardHandler handles admin dashboard requests
type AdminDashboardHandler struct {
	service *service.AdminDashboardService
}

// NewAdminDashboardHandler creates a new AdminDashboardHandler
func NewAdminDashboardHandler(s *service.AdminDashboardService) *AdminDashboardHandler {
	return &AdminDashboardHandler{service: s}
}

// GetSummary handles GET /api/admin/summary
func (h *AdminDashboardHandler) GetSummary(c *gin.Context) {
	summary, err := h.service.GetSummary()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, summary)
}
