package handler

import (
	"fmt"
	"net/http"
	"strings"

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

// extractTokenFromHeader extracts the JWT token from Authorization header.
// Expected format: "Authorization: Bearer <token>"
func (h *AuthHandler) extractTokenFromHeader(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return "", fmt.Errorf("authorization header is required")
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", fmt.Errorf("invalid authorization header format (expected: Bearer <token>)")
	}

	token := parts[1]
	if token == "" {
		return "", fmt.Errorf("token is empty")
	}

	return token, nil
}

// Logout handles POST /api/auth/logout (M1-3-3).
// SSOT Endpoint: POST /api/auth/logout
// Expects Authorization header with Bearer token
func (h *AuthHandler) Logout(c *gin.Context) {
	// Extract token from Authorization header
	token, err := h.extractTokenFromHeader(c)
	if err != nil {
		response.SendProblem(c, http.StatusUnauthorized, "unauthorized", fmt.Sprintf("invalid authorization: %v", err), c.Request.URL.Path)
		return
	}

	// Call logout service with token
	err = h.authService.Logout(c.Request.Context(), token)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, gin.H{"message": "logged out successfully"})
}

// Refresh handles POST /api/auth/refresh to refresh access token.
// SSOT Endpoint: POST /api/auth/refresh
func (h *AuthHandler) Refresh(c *gin.Context) {
	var req domain.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", err.Error(), c.Request.URL.Path)
		return
	}

	result, err := h.authService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}
