package handler

import (
	"kojan-map/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AdminContactHandler handles admin contact/inquiry requests
type AdminContactHandler struct {
	service *service.AdminContactService
}

// NewAdminContactHandler creates a new AdminContactHandler
func NewAdminContactHandler(s *service.AdminContactService) *AdminContactHandler {
	return &AdminContactHandler{service: s}
}

// GetInquiries handles GET /internal/asks
func (h *AdminContactHandler) GetInquiries(c *gin.Context) {
	asks, err := h.service.GetInquiries()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"asks": asks})
}

// ApproveInquiry handles POST /internal/requests/:requestId/approve
func (h *AdminContactHandler) ApproveInquiry(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("requestId"))
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

// RejectInquiry handles POST /internal/requests/:requestId/reject
func (h *AdminContactHandler) RejectInquiry(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("requestId"))
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
