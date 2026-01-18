package handler

import (
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/contextkeys"
	"kojan-map/business/pkg/response"
	"kojan-map/business/pkg/validate"
)

// MemberHandler はメンバー関連のエンドポイントを処理するハンドラーです。
type MemberHandler struct {
	memberService service.MemberService
}

// NewMemberHandler は新しいメンバーハンドラーを作成します。
func NewMemberHandler(memberService service.MemberService) *MemberHandler {
	return &MemberHandler{
		memberService: memberService,
	}
}

// GetBusinessDetails は GET /api/business/mypage/details (M3-2-2) を処理します。
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

// UpdateBusinessName は PUT /api/business/member/name (M3-4-2) を処理します。
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

// UpdateBusinessIcon は PUT /api/business/member/icon (M3-5-2) を処理します。
// 画像は PNG または JPEG のみ、5MB以下
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

	iconData, err := io.ReadAll(f)
	if err != nil {
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

// AnonymizeMember は PUT /api/business/member/anonymize (M3-3) を処理します。
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

// GetMemberInfo は GET /api/business/member (M1-2) を処理します。
func (h *MemberHandler) GetMemberInfo(c *gin.Context) {
	googleID := c.Query("googleId")
	if googleID == "" {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "googleId query parameter is required", c.Request.URL.Path)
		return
	}

	details, err := h.memberService.GetBusinessDetails(c.Request.Context(), googleID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusOK, details)
}
