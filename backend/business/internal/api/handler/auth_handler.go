package handler

import (
	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/response"
)

// AuthHandler handles authentication-related endpoints.
type AuthHandler struct {
	authService service.AuthService
}

// NewAuthHandler creates a new auth handler.
func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// GoogleAuth handles POST /api/auth/google (M3-1).
// SSOT Endpoint: POST /api/auth/google
func (h *AuthHandler) GoogleAuth(c *gin.Context) {
	var req domain.GoogleAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendBadRequest(c, err.Error())
		return
	}

	result, err := h.authService.GoogleAuth(c.Request.Context(), &req)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// BusinessLogin handles POST /api/auth/business/login (M1-1).
// SSOT Endpoint: POST /api/auth/business/login
func (h *AuthHandler) BusinessLogin(c *gin.Context) {
	var req domain.BusinessLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendBadRequest(c, err.Error())
		return
	}

	result, err := h.authService.BusinessLogin(c.Request.Context(), req.Gmail, req.MFACode)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// Logout handles POST /api/auth/logout (M1-3-3).
// SSOT Endpoint: POST /api/auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	var req domain.LogoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendBadRequest(c, err.Error())
		return
	}

	// TODO: Extract session info from middleware
	err := h.authService.Logout(c.Request.Context(), nil)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, gin.H{"message": "logged out successfully"})
}
