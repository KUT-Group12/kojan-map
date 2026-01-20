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

// TestStatsHandler_GetTotalPosts tests GetTotalPosts endpoint (M3-7-1).
func TestStatsHandler_GetTotalPosts(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	statsHandler := NewStatsHandler(fixtures.StatsService)

	// Create test context with auth context
	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/post/total?businessId=1", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	statsHandler.GetTotalPosts(c)

	// Assert response
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestStatsHandler_GetTotalPosts_MissingBusinessID tests without businessId param.
func TestStatsHandler_GetTotalPosts_MissingBusinessID(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	statsHandler := NewStatsHandler(fixtures.StatsService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/post/total", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	c.Request = c.Request.WithContext(ctx)

	statsHandler.GetTotalPosts(c)

	// Should return bad request
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// TestStatsHandler_GetTotalPosts_InvalidBusinessID tests with invalid businessId.
func TestStatsHandler_GetTotalPosts_InvalidBusinessID(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	statsHandler := NewStatsHandler(fixtures.StatsService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/post/total?businessId=invalid", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	c.Request = c.Request.WithContext(ctx)

	statsHandler.GetTotalPosts(c)

	// Should return bad request
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// TestStatsHandler_GetTotalReactions tests GetTotalReactions endpoint (M3-7-2).
func TestStatsHandler_GetTotalReactions(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	statsHandler := NewStatsHandler(fixtures.StatsService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/reaction/total?businessId=1", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	statsHandler.GetTotalReactions(c)

	// Assert response
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestStatsHandler_GetTotalReactions_MissingBusinessID tests without businessId param.
func TestStatsHandler_GetTotalReactions_MissingBusinessID(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	statsHandler := NewStatsHandler(fixtures.StatsService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/reaction/total", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	statsHandler.GetTotalReactions(c)

	// Should return bad request
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// TestStatsHandler_GetTotalViews tests GetTotalViews endpoint (M3-7-3).
func TestStatsHandler_GetTotalViews(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	statsHandler := NewStatsHandler(fixtures.StatsService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/view/total?businessId=1", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	statsHandler.GetTotalViews(c)

	// Assert response
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestStatsHandler_GetTotalViews_MissingBusinessID tests without businessId param.
func TestStatsHandler_GetTotalViews_MissingBusinessID(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	statsHandler := NewStatsHandler(fixtures.StatsService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/view/total", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	statsHandler.GetTotalViews(c)

	// Should return bad request
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// TestStatsHandler_GetEngagementRate tests GetEngagementRate endpoint (M3-7-4).
func TestStatsHandler_GetEngagementRate(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	statsHandler := NewStatsHandler(fixtures.StatsService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/engagement?businessId=1", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	statsHandler.GetEngagementRate(c)

	// Assert response
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestStatsHandler_GetEngagementRate_MissingBusinessID tests without businessId param.
func TestStatsHandler_GetEngagementRate_MissingBusinessID(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	statsHandler := NewStatsHandler(fixtures.StatsService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/engagement", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	statsHandler.GetEngagementRate(c)

	// Should return bad request
	assert.Equal(t, http.StatusBadRequest, w.Code)
}
