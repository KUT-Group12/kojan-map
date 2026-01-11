package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/service"
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

	// TODO: Extract googleID from authenticated session
	googleID := c.GetHeader("X-Google-Id")
	if googleID == "" {
		googleID = "placeholder-google-id"
	}

	if err := h.contactService.CreateContact(c.Request.Context(), googleID, req.Subject, req.Message); err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusCreated, gin.H{"message": "contact submitted successfully"})
}
