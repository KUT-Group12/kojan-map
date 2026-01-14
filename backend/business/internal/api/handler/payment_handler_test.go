package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	svcimpl "kojan-map/business/internal/service/impl"
	"kojan-map/business/pkg/contextkeys"
)

// TestPaymentHandler_CreateRedirect tests CreateRedirect endpoint (M1-15-3).
func TestPaymentHandler_CreateRedirect(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	paymentHandler := NewPaymentHandler(fixtures.PaymentService)

	// Create test context with auth context
	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/business/stripe/redirect?businessId=1", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	paymentHandler.CreateRedirect(c)

	// Assert response
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestPaymentHandler_CreateRedirect_MissingBusinessID tests without businessId param.
func TestPaymentHandler_CreateRedirect_MissingBusinessID(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	paymentHandler := NewPaymentHandler(fixtures.PaymentService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/business/stripe/redirect", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	c.Request = c.Request.WithContext(ctx)

	paymentHandler.CreateRedirect(c)

	// Should return bad request
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// TestPaymentHandler_CreateRedirect_InvalidBusinessID tests with invalid businessId.
func TestPaymentHandler_CreateRedirect_InvalidBusinessID(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	paymentHandler := NewPaymentHandler(fixtures.PaymentService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/business/stripe/redirect?businessId=invalid", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	c.Request = c.Request.WithContext(ctx)

	paymentHandler.CreateRedirect(c)

	// Should return bad request
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// TestPaymentHandler_CreateRedirect_MissingAuth tests without auth context.
func TestPaymentHandler_CreateRedirect_MissingAuth(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	paymentHandler := NewPaymentHandler(fixtures.PaymentService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/business/stripe/redirect?businessId=1", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// NO auth context

	paymentHandler.CreateRedirect(c)

	// Handler itself doesn't check auth context at this level
	// Middleware check should happen at router level, so we expect 200 OK
	assert.Equal(t, http.StatusOK, w.Code)
}
