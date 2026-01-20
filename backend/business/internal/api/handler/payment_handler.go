package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/response"
)

// PaymentHandler はStripe/決済関連のエンドポイントを処理するハンドラーです。
type PaymentHandler struct {
	paymentService service.PaymentService
}

// NewPaymentHandler は新しい決済ハンドラーを作成します。
func NewPaymentHandler(paymentService service.PaymentService) *PaymentHandler {
	return &PaymentHandler{paymentService: paymentService}
}

// CreateRedirect は POST /api/business/stripe/redirect (M1-15-3) を処理します。
// Stripeを呼び出さずにモックのリダイレクトURLを返します。
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
