package handler

import (
	"kojan-map/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AdminUserHandler handles admin user management requests
type AdminUserHandler struct {
	service *service.AdminUserService
}

// NewAdminUserHandler creates a new AdminUserHandler
func NewAdminUserHandler(s *service.AdminUserService) *AdminUserHandler {
	return &AdminUserHandler{service: s}
}

// GetUsers handles GET /api/users
func (h *AdminUserHandler) GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	result, err := h.service.GetUsers(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// DeleteUser handles POST /internal/users/:userId
func (h *AdminUserHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	err := h.service.DeleteUser(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
