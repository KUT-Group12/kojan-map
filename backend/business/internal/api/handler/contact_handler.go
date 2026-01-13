package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/contextkeys"
	"kojan-map/business/pkg/response"
)

// ContactHandler handles contact-related endpoints.
type ContactHandler struct {
	contactService service.ContactService
}

// NewContactHandler creates a new contact handler.
func NewContactHandler(contactService service.ContactService) *ContactHandler {
	return &ContactHandler{contactService: contactService}
}

// CreateContact handles POST /api/contact (M1-11-2).
// SSOT Endpoint: POST /api/contact
func (h *ContactHandler) CreateContact(c *gin.Context) {
	var req domain.CreateContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendBadRequest(c, err.Error())
		return
	}

	// Extract googleID from authenticated context
	googleID, ok := contextkeys.GetUserID(c.Request.Context())
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := h.contactService.CreateContact(c.Request.Context(), googleID, req.Subject, req.Message); err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusCreated, gin.H{"message": "contact submitted successfully"})
}
