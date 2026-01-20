package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"kojan-map/business/internal/domain"
	svcimpl "kojan-map/business/internal/service/impl"
	"kojan-map/business/pkg/contextkeys"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// TestBlockHandler_CreateBlock tests CreateBlock endpoint (M1-9-2).
func TestBlockHandler_CreateBlock(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	blockHandler := NewBlockHandler(fixtures.BlockService)

	// Create request
	req := domain.CreateBlockRequest{
		BlockedUserID: "blocked-user-id",
	}

	reqBody, _ := json.Marshal(req)

	// Create test context with auth context
	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/block", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithUserID(c.Request.Context(), "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	blockHandler.CreateBlock(c)

	// Assert response
	assert.Equal(t, http.StatusCreated, w.Code)
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	assert.NotNil(t, result["message"])
}

// TestBlockHandler_CreateBlock_MissingAuth tests CreateBlock without auth.
func TestBlockHandler_CreateBlock_MissingAuth(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	blockHandler := NewBlockHandler(fixtures.BlockService)

	req := domain.CreateBlockRequest{
		BlockedUserID: "blocked-user-id",
	}

	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/block", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// NO auth context

	blockHandler.CreateBlock(c)

	// Should return 401 Unauthorized
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// TestBlockHandler_CreateBlock_InvalidRequest tests with invalid JSON.
func TestBlockHandler_CreateBlock_InvalidRequest(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	blockHandler := NewBlockHandler(fixtures.BlockService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/block", bytes.NewBuffer([]byte("invalid json")))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithUserID(c.Request.Context(), "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	blockHandler.CreateBlock(c)

	// Should return error response
	assert.NotEqual(t, http.StatusCreated, w.Code)
}

// TestBlockHandler_DeleteBlock tests DeleteBlock endpoint (M1-10-2).
func TestBlockHandler_DeleteBlock(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	blockHandler := NewBlockHandler(fixtures.BlockService)

	// Create request
	req := domain.DeleteBlockRequest{
		BlockedUserID: "blocked-user-id",
	}

	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("DELETE", "/api/block", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithUserID(c.Request.Context(), "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	blockHandler.DeleteBlock(c)

	// Assert response
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestBlockHandler_DeleteBlock_MissingAuth tests DeleteBlock without auth.
func TestBlockHandler_DeleteBlock_MissingAuth(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	blockHandler := NewBlockHandler(fixtures.BlockService)

	req := domain.DeleteBlockRequest{
		BlockedUserID: "blocked-user-id",
	}

	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("DELETE", "/api/block", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	blockHandler.DeleteBlock(c)

	// Should return 401 Unauthorized
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// TestReportHandler_CreateReport tests CreateReport endpoint (M1-12-2).
func TestReportHandler_CreateReport(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	reportHandler := NewReportHandler(fixtures.ReportService)

	// Create request
	req := domain.CreateReportRequest{
		ReportedGoogleID: "reported-user-id",
		TargetPostID:     123,
		ReportReason:     "inappropriate content",
		ReportedAt:       "2026-01-12T10:00:00Z",
	}

	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/report", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithUserID(c.Request.Context(), "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	reportHandler.CreateReport(c)

	// Assert response
	assert.Equal(t, http.StatusCreated, w.Code)
	var result map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &result)
	assert.NotNil(t, result["message"])
}

// TestReportHandler_CreateReport_MissingAuth tests CreateReport without auth.
func TestReportHandler_CreateReport_MissingAuth(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	reportHandler := NewReportHandler(fixtures.ReportService)

	req := domain.CreateReportRequest{
		ReportedGoogleID: "reported-user-id",
		TargetPostID:     123,
		ReportReason:     "inappropriate",
		ReportedAt:       "2026-01-12T10:00:00Z",
	}

	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/report", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	reportHandler.CreateReport(c)

	// Handler checks for auth context - should return 401 when missing
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// TestReportHandler_CreateReport_InvalidRequest tests with invalid JSON.
func TestReportHandler_CreateReport_InvalidRequest(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	reportHandler := NewReportHandler(fixtures.ReportService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/report", bytes.NewBuffer([]byte("invalid json")))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithUserID(c.Request.Context(), "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	reportHandler.CreateReport(c)

	// Should return error response
	assert.NotEqual(t, http.StatusCreated, w.Code)
}
