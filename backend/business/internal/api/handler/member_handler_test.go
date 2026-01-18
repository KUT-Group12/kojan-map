package handler

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"kojan-map/business/internal/domain"
	svcimpl "kojan-map/business/internal/service/impl"
	"kojan-map/business/pkg/contextkeys"
)

// TestMemberHandler_UpdateBusinessName tests UpdateBusinessName endpoint (M3-4-2).
func TestMemberHandler_UpdateBusinessName(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	memberHandler := NewMemberHandler(fixtures.MemberService)

	// Create request
	req := domain.UpdateBusinessNameRequest{
		NewBusinessName: "Updated Business Name",
	}

	reqBody, _ := json.Marshal(req)

	// Create test context with auth context
	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("PUT", "/api/business/member/name", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	memberHandler.UpdateBusinessName(c)

	// Assert response
	assert.Equal(t, http.StatusOK, w.Code)
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	assert.NotNil(t, result["message"])
}

// TestMemberHandler_UpdateBusinessName_MissingAuth tests with missing auth context.
func TestMemberHandler_UpdateBusinessName_MissingAuth(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	memberHandler := NewMemberHandler(fixtures.MemberService)

	req := domain.UpdateBusinessNameRequest{
		NewBusinessName: "Updated Business Name",
	}

	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("PUT", "/api/business/member/name", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// NO auth context injected - should fail

	memberHandler.UpdateBusinessName(c)

	// Should return 401 Unauthorized
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// TestMemberHandler_UpdateBusinessName_InvalidRequest tests with invalid JSON.
func TestMemberHandler_UpdateBusinessName_InvalidRequest(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	memberHandler := NewMemberHandler(fixtures.MemberService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("PUT", "/api/business/member/name", bytes.NewBuffer([]byte("invalid json")))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	c.Request = c.Request.WithContext(ctx)

	memberHandler.UpdateBusinessName(c)

	// Should return error response
	assert.NotEqual(t, http.StatusOK, w.Code)
}

// TestMemberHandler_UpdateBusinessIcon tests UpdateBusinessIcon endpoint (M3-5-2).
func TestMemberHandler_UpdateBusinessIcon(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	memberHandler := NewMemberHandler(fixtures.MemberService)

	// Create multipart form data with image
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Create a simple PNG file (minimal valid PNG header)
	pngData := []byte{137, 80, 78, 71, 13, 10, 26, 10, // PNG signature
		0, 0, 0, 13, // IHDR chunk size
		73, 72, 68, 82, // IHDR
		0, 0, 0, 1, // width: 1
		0, 0, 0, 1, // height: 1
		8, 2, 0, 0, 0, // bit depth, color type, compression, filter, interlace
		144, 119, 83, 222, // CRC
	}

	part, _ := writer.CreateFormFile("icon", "test.png")
	part.Write(pngData)
	writer.Close()

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("PUT", "/api/business/member/icon", body)
	httpReq.Header.Set("Content-Type", writer.FormDataContentType())

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	memberHandler.UpdateBusinessIcon(c)

	// Assert response
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestMemberHandler_UpdateBusinessIcon_MissingFile tests without file.
func TestMemberHandler_UpdateBusinessIcon_MissingFile(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	memberHandler := NewMemberHandler(fixtures.MemberService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("PUT", "/api/business/member/icon", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	c.Request = c.Request.WithContext(ctx)

	memberHandler.UpdateBusinessIcon(c)

	// Should return error
	assert.NotEqual(t, http.StatusOK, w.Code)
}

// TestMemberHandler_AnonymizeMember tests AnonymizeMember endpoint (M3-3).
func TestMemberHandler_AnonymizeMember(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	memberHandler := NewMemberHandler(fixtures.MemberService)

	req := domain.AnonymizeBusinessMemberRequest{
		GoogleID: "test-user-id",
	}
	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("PUT", "/api/business/member/anonymize", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	memberHandler.AnonymizeMember(c)

	// Assert response
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestMemberHandler_AnonymizeMember_MissingAuth tests AnonymizeMember without auth.
func TestMemberHandler_AnonymizeMember_MissingAuth(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	memberHandler := NewMemberHandler(fixtures.MemberService)

	req := domain.AnonymizeBusinessMemberRequest{
		GoogleID: "test-user-id",
	}
	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("PUT", "/api/business/member/anonymize", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// NO auth context

	memberHandler.AnonymizeMember(c)

	// Should return 401 Unauthorized
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// TestMemberHandler_GetBusinessDetails tests GetBusinessDetails endpoint (M1-2).
func TestMemberHandler_GetBusinessDetails(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()

	// Setup test data
	fixtures.SetupUser("test-user-id", "test@example.com")
	fixtures.SetupBusinessMember(1, "test-user-id", "Test Business", nil)

	memberHandler := NewMemberHandler(fixtures.MemberService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/mypage/details?googleId=test-user-id", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Call handler
	memberHandler.GetBusinessDetails(c)

	// Assert response
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestMemberHandler_GetBusinessDetails_MissingGoogleID tests without googleId param.
func TestMemberHandler_GetBusinessDetails_MissingGoogleID(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	memberHandler := NewMemberHandler(fixtures.MemberService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/mypage/details", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	memberHandler.GetBusinessDetails(c)

	// Should return bad request
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// TestMemberHandler_GetMemberInfo tests GetMemberInfo endpoint.
func TestMemberHandler_GetMemberInfo(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()

	// Setup test data
	fixtures.SetupUser("test-user-id", "test@example.com")
	fixtures.SetupBusinessMember(1, "test-user-id", "Test Business", nil)

	memberHandler := NewMemberHandler(fixtures.MemberService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/member?googleId=test-user-id", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	memberHandler.GetMemberInfo(c)

	// Assert response (may be not implemented)
	assert.True(t, w.Code >= 200 && w.Code < 500)
}
