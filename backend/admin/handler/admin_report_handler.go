package handler

import (
	"net/http"
	"strconv"

	"kojan-map/admin/service"

	"github.com/gin-gonic/gin"
)

// AdminReportHandler handles admin report management requests
type AdminReportHandler struct {
	service *service.AdminReportService
}

// NewAdminReportHandler creates a new AdminReportHandler
func NewAdminReportHandler(s *service.AdminReportService) *AdminReportHandler {
	return &AdminReportHandler{service: s}
}

// GetReports handles GET /api/admin/reports
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

// HandleReport handles PUT /api/admin/reports/:id/handle
func (h *AdminReportHandler) HandleReport(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report ID"})
		return
	}

	err = h.service.MarkAsHandled(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
