package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/contextkeys"
	"kojan-map/business/pkg/response"
	"kojan-map/business/pkg/validate"
)

// MemberHandler handles member-related endpoints.
type MemberHandler struct {
	memberService service.MemberService
}

// NewMemberHandler creates a new member handler.
func NewMemberHandler(memberService service.MemberService) *MemberHandler {
	return &MemberHandler{
		memberService: memberService,
	}
}

// GetBusinessDetails handles GET /api/business/mypage/details (M3-2-2).
// SSOT Endpoint: GET /api/business/mypage/details
func (h *MemberHandler) GetBusinessDetails(c *gin.Context) {
	googleID := c.Query("googleId")
	if googleID == "" {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "googleId query parameter is required", c.Request.URL.Path)
		return
	}

	result, err := h.memberService.GetBusinessDetails(c.Request.Context(), googleID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// UpdateBusinessName handles PUT /api/business/member/name (M3-4-2).
// SSOT Endpoint: PUT /api/business/member/name
// SSOT Rules: 事業者名は1文字以上50文字以下
func (h *MemberHandler) UpdateBusinessName(c *gin.Context) {
	var req domain.UpdateBusinessNameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", err.Error(), c.Request.URL.Path)
		return
	}

	// Extract business ID from authenticated context
	businessID, ok := contextkeys.GetBusinessID(c.Request.Context())
	if !ok {
		response.SendProblem(c, http.StatusUnauthorized, "unauthorized", "business ID not found in context", c.Request.URL.Path)
		return
	}

	err := h.memberService.UpdateBusinessName(c.Request.Context(), businessID, req.NewBusinessName)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusOK, gin.H{
		"message":      "business name updated successfully",
		"businessName": req.NewBusinessName,
	})
}

// UpdateBusinessIcon handles PUT /api/business/member/icon (M3-5-2).
// SSOT Endpoint: PUT /api/business/member/icon
// SSOT Rules: 画像は PNG または JPEG のみ、5MB以下
func (h *MemberHandler) UpdateBusinessIcon(c *gin.Context) {
	file, err := c.FormFile("icon")
	if err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "icon file is required", c.Request.URL.Path)
		return
	}

	// Check file size (5MB limit)
	const maxSize = 5 * 1024 * 1024 // 5MB
	if file.Size > maxSize {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", fmt.Sprintf("icon file size must not exceed %dMB", maxSize/1024/1024), c.Request.URL.Path)
		return
	}

	// Read file content
	f, err := file.Open()
	if err != nil {
		response.SendProblem(c, http.StatusInternalServerError, "internal-error", fmt.Sprintf("failed to open file: %v", err), c.Request.URL.Path)
		return
	}
	defer f.Close()

	iconData := make([]byte, file.Size)
	if _, err := f.Read(iconData); err != nil {
		response.SendProblem(c, http.StatusInternalServerError, "internal-error", fmt.Sprintf("failed to read file: %v", err), c.Request.URL.Path)
		return
	}

	// Validate MIME type (PNG or JPEG only) using file header magic numbers
	imageValidator := validate.NewImageValidator()
	if err := imageValidator.ValidateImage(iconData, file.Size, maxSize); err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", fmt.Sprintf("invalid image format: %v", err), c.Request.URL.Path)
		return
	}

	// Extract business ID from authenticated context
	businessID, ok := contextkeys.GetBusinessID(c.Request.Context())
	if !ok {
		response.SendProblem(c, http.StatusUnauthorized, "unauthorized", "business ID not found in context", c.Request.URL.Path)
		return
	}

	err = h.memberService.UpdateBusinessIcon(c.Request.Context(), businessID, iconData)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusOK, gin.H{
		"message": "business icon updated successfully",
	})
}

// AnonymizeMember handles PUT /api/business/member/anonymize (M3-3).
// SSOT Endpoint: PUT /api/business/member/anonymize
func (h *MemberHandler) AnonymizeMember(c *gin.Context) {
	var req domain.AnonymizeBusinessMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", err.Error(), c.Request.URL.Path)
		return
	}

	// Extract business ID from authenticated context
	businessID, ok := contextkeys.GetBusinessID(c.Request.Context())
	if !ok {
		response.SendProblem(c, http.StatusUnauthorized, "unauthorized", "business ID not found in context", c.Request.URL.Path)
		return
	}

	err := h.memberService.AnonymizeMember(c.Request.Context(), businessID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusOK, gin.H{
		"message": "member anonymized successfully",
	})
}

// GetMemberInfo handles GET /api/business/member (M1-2).
// SSOT Endpoint: GET /api/business/member
func (h *MemberHandler) GetMemberInfo(c *gin.Context) {
	googleID := c.Query("googleId")
	if googleID == "" {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "googleId query parameter is required", c.Request.URL.Path)
		return
	}

	// TODO: Fetch from memberRepo and return MemberInfoResponse
	response.SendSuccess(c, http.StatusOK, gin.H{
		"gmail": "placeholder@example.com",
		"role":  "business",
	})
}
