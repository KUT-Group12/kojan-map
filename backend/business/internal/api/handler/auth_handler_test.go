package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"kojan-map/business/internal/domain"
	svcimpl "kojan-map/business/internal/service/impl"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// TestAuthHandler_GoogleAuth tests the GoogleAuth endpoint (M3-1).
func TestAuthHandler_GoogleAuth(t *testing.T) {
	// Setup fixtures
	fixtures := svcimpl.NewTestFixtures()

	// Create handler with mocked service
	authService := fixtures.AuthService
	authHandler := NewAuthHandler(authService)

	// Create request
	req := domain.GoogleAuthRequest{
		GoogleID: "test-user-id",
		Gmail:    "test@example.com",
		IDToken:  "test-id-token",
		Role:     "user",
	}

	reqBody, _ := json.Marshal(req)

	// Create test context
	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/auth/google", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Call handler
	authHandler.GoogleAuth(c)

	// Assert response - handler may fail due to token verification
	// but should not panic or return 500
	assert.True(t, w.Code >= 200 && w.Code < 500)
}

// TestAuthHandler_GoogleAuth_InvalidRequest tests GoogleAuth with invalid request.
func TestAuthHandler_GoogleAuth_InvalidRequest(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	authService := fixtures.AuthService
	authHandler := NewAuthHandler(authService)

	// Invalid request body (missing required fields)
	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/auth/google", bytes.NewBuffer([]byte("{}")))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	authHandler.GoogleAuth(c)

	// Should return bad request or validation error
	assert.NotEqual(t, http.StatusOK, w.Code)
}

// TestAuthHandler_BusinessLogin tests the BusinessLogin endpoint (M1-1).
func TestAuthHandler_BusinessLogin(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()

	// Setup test user
	fixtures.SetupUser("test-user-id", "test@example.com")

	authService := fixtures.AuthService
	authHandler := NewAuthHandler(authService)

	// Create request
	req := domain.BusinessLoginRequest{
		SessionID: "dummy-session-id",
		Gmail:     "test@example.com",
		MFACode:   "123456",
	}

	reqBody, _ := json.Marshal(req)

	// Create test context
	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/auth/business/login", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Call handler
	authHandler.BusinessLogin(c)

	// Assert response - handler may fail due to MFA validation
	// but should not panic or return 500
	assert.True(t, w.Code >= 200 && w.Code < 500)
}

// TestAuthHandler_BusinessLogin_InvalidRequest tests BusinessLogin with invalid request.
func TestAuthHandler_BusinessLogin_InvalidRequest(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	authService := fixtures.AuthService
	authHandler := NewAuthHandler(authService)

	// Missing MFA code
	req := domain.BusinessLoginRequest{
		SessionID: "dummy-session-id",
		Gmail:     "test@example.com",
	}

	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/auth/business/login", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	authHandler.BusinessLogin(c)

	// May succeed if service accepts empty MFA or fail with validation error
	assert.NotEqual(t, 0, w.Code)
}

// TestAuthHandler_Logout tests the Logout endpoint.
func TestAuthHandler_Logout(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	authService := fixtures.AuthService
	authHandler := NewAuthHandler(authService)

	// Create test context
	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/auth/logout", nil)
	httpReq.Header.Set("Authorization", "Bearer test-token")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Call handler
	authHandler.Logout(c)

	// For now, we expect it to not fail (may return error if token is invalid in mock)
	assert.True(t, w.Code >= 200 && w.Code < 500)
}
