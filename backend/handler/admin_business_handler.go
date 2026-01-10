package handler

import (
	"kojan-map/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AdminBusinessHandler handles admin business application requests
type AdminBusinessHandler struct {
	service *service.AdminBusinessService
}

// NewAdminBusinessHandler creates a new AdminBusinessHandler
func NewAdminBusinessHandler(s *service.AdminBusinessService) *AdminBusinessHandler {
	return &AdminBusinessHandler{service: s}
}

// GetApplications handles GET /api/admin/request
func (h *AdminBusinessHandler) GetApplications(c *gin.Context) {
	applications, err := h.service.GetApplications()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"applications": applications})
}

// ApproveApplication handles PUT /api/applications/:id/approve
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

// RejectApplication handles PUT /api/applications/:id/reject
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
