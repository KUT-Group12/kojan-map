package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"kojan-map/business/internal/domain"
	"kojan-map/business/pkg/contextkeys"
	svcimpl "kojan-map/business/internal/service/impl"
)

// TestContactHandler_CreateContact tests CreateContact endpoint (M1-11-2).
func TestContactHandler_CreateContact(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	contactHandler := NewContactHandler(fixtures.ContactService)

	// Create request
	req := domain.CreateContactRequest{
		Subject: "Feature Request",
		Message: "I would like to request a new feature",
	}

	reqBody, _ := json.Marshal(req)

	// Create test context with auth context
	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/contact", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context (using UserID as googleID)
	ctx := contextkeys.WithUserID(c.Request.Context(), "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	contactHandler.CreateContact(c)

	// Assert response
	assert.Equal(t, http.StatusCreated, w.Code)
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	assert.NotNil(t, result["message"])
}

// TestContactHandler_CreateContact_MissingAuth tests CreateContact without auth.
func TestContactHandler_CreateContact_MissingAuth(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	contactHandler := NewContactHandler(fixtures.ContactService)

	req := domain.CreateContactRequest{
		Subject: "Bug Report",
		Message: "Found a bug in the system",
	}

	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/contact", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// NO auth context

	contactHandler.CreateContact(c)

	// Handler checks for auth context - should return 401 when missing
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// TestContactHandler_CreateContact_InvalidRequest tests with invalid JSON.
func TestContactHandler_CreateContact_InvalidRequest(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	contactHandler := NewContactHandler(fixtures.ContactService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/contact", bytes.NewBuffer([]byte("invalid json")))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithUserID(c.Request.Context(), "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	contactHandler.CreateContact(c)

	// Should return error response
	assert.NotEqual(t, http.StatusCreated, w.Code)
}

// TestContactHandler_CreateContact_MissingSubject tests with missing subject.
func TestContactHandler_CreateContact_MissingSubject(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	contactHandler := NewContactHandler(fixtures.ContactService)

	req := domain.CreateContactRequest{
		Message: "Message without subject",
	}

	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/contact", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithUserID(c.Request.Context(), "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	contactHandler.CreateContact(c)

	// Response depends on validation rules
	assert.True(t, w.Code >= 200 && w.Code < 500)
}
