package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/response"
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
		response.SendBadRequest(c, "googleId query parameter is required")
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
		response.SendBadRequest(c, err.Error())
		return
	}

	// TODO: Extract business ID from authenticated session
	businessID := int64(1) // Placeholder

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
		response.SendBadRequest(c, "icon file is required")
		return
	}

	// Check file size (5MB limit)
	const maxSize = 5 * 1024 * 1024 // 5MB
	if file.Size > maxSize {
		response.SendBadRequest(c, fmt.Sprintf("icon file size must not exceed %dMB", maxSize/1024/1024))
		return
	}

	// TODO: Validate MIME type (PNG or JPEG only)

	// Read file content
	f, err := file.Open()
	if err != nil {
		response.SendInternalServerError(c, fmt.Sprintf("failed to open file: %v", err))
		return
	}
	defer f.Close()

	iconData := make([]byte, file.Size)
	if _, err := f.Read(iconData); err != nil {
		response.SendInternalServerError(c, fmt.Sprintf("failed to read file: %v", err))
		return
	}

	// TODO: Extract business ID from authenticated session
	businessID := int64(1) // Placeholder

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
		response.SendBadRequest(c, err.Error())
		return
	}

	// TODO: Parse business ID from googleID or extract from authenticated session
	businessID := int64(1) // Placeholder

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
		response.SendBadRequest(c, "googleId query parameter is required")
		return
	}

	// TODO: Fetch from memberRepo and return MemberInfoResponse
	response.SendSuccess(c, http.StatusOK, gin.H{
		"gmail": "placeholder@example.com",
		"role":  "business",
	})
}
