package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/contextkeys"
	"kojan-map/business/pkg/response"
)

// ContactHandler はお問い合わせ関連のエンドポイントを処理するハンドラーです。
type ContactHandler struct {
	contactService service.ContactService
}

// NewContactHandler は新しいお問い合わせハンドラーを作成します。
func NewContactHandler(contactService service.ContactService) *ContactHandler {
	return &ContactHandler{contactService: contactService}
}

// CreateContact は POST /api/contact (M1-11-2) を処理します。
func (h *ContactHandler) CreateContact(c *gin.Context) {
	var req domain.CreateContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", err.Error(), c.Request.URL.Path)
		return
	}

	// Extract googleID from authenticated context
	googleID, ok := contextkeys.GetUserID(c.Request.Context())
	if !ok {
		response.SendProblem(c, http.StatusUnauthorized, "unauthorized", "user ID not found in context", c.Request.URL.Path)
		return
	}

	if err := h.contactService.CreateContact(c.Request.Context(), googleID, req.Subject, req.Message); err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusCreated, gin.H{"message": "contact submitted successfully"})
}
