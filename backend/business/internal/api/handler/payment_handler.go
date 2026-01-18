package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/response"
)

// PaymentHandler handles Stripe/payment-related endpoints.
type PaymentHandler struct {
	paymentService service.PaymentService
}

// NewPaymentHandler creates a new payment handler.
func NewPaymentHandler(paymentService service.PaymentService) *PaymentHandler {
	return &PaymentHandler{paymentService: paymentService}
}

// CreateRedirect handles POST /api/business/stripe/redirect (M1-15-3).
// Returns a mock redirect URL without calling Stripe.
func (h *PaymentHandler) CreateRedirect(c *gin.Context) {
	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "businessId query parameter is required", c.Request.URL.Path)
		return
	}

	businessID, err := strconv.ParseInt(businessIDStr, 10, 64)
	if err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "businessId must be a valid integer", c.Request.URL.Path)
		return
	}

	url, err := h.paymentService.CreateRedirect(c.Request.Context(), businessID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusOK, gin.H{
		"redirectUrl": url,
	})
}
