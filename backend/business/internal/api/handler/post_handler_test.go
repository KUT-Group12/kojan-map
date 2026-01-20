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

// TestPostHandler_CreatePost tests CreatePost endpoint (M3-6-2).
func TestPostHandler_CreatePost(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	postHandler := NewPostHandler(fixtures.PostService)

	// Create request
	req := domain.CreatePostRequest{
		LocationID:  "loc-123",
		GenreIDs:    []int32{1, 2},
		Title:       "Test Post Title",
		Description: "Test post description",
		Images:      []string{"image1.jpg", "image2.jpg"},
	}

	reqBody, _ := json.Marshal(req)

	// Create test context with auth context
	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	postHandler.CreatePost(c)

	// Assert response
	assert.Equal(t, http.StatusCreated, w.Code)
}

// TestPostHandler_CreatePost_MissingAuth tests CreatePost without auth context.
func TestPostHandler_CreatePost_MissingAuth(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	postHandler := NewPostHandler(fixtures.PostService)

	req := domain.CreatePostRequest{
		LocationID:  "loc-123",
		GenreIDs:    []int32{1, 2},
		Title:       "Test Post Title",
		Description: "Test post description",
	}

	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// NO auth context

	postHandler.CreatePost(c)

	// Should return 401 Unauthorized
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// TestPostHandler_CreatePost_InvalidRequest tests with invalid JSON.
func TestPostHandler_CreatePost_InvalidRequest(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	postHandler := NewPostHandler(fixtures.PostService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer([]byte("invalid json")))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	c.Request = c.Request.WithContext(ctx)

	postHandler.CreatePost(c)

	// Should return 400 Bad Request for invalid JSON
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// TestPostHandler_ListPosts tests ListPosts endpoint (M3-6-1).
func TestPostHandler_ListPosts(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	postHandler := NewPostHandler(fixtures.PostService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/posts?businessId=1", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	postHandler.ListPosts(c)

	// Assert response
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestPostHandler_ListPosts_MissingAuth tests ListPosts without auth.
func TestPostHandler_ListPosts_MissingAuth(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	postHandler := NewPostHandler(fixtures.PostService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/business/posts?businessId=1", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	postHandler.ListPosts(c)

	// Handler itself doesn't check auth context at this level
	// Middleware check should happen at router level, so we expect handler to work
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestPostHandler_GetPost tests GetPost endpoint (M3-6-3).
func TestPostHandler_GetPost(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	postHandler := NewPostHandler(fixtures.PostService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/posts/123", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq
	c.Params = append(c.Params, gin.Param{Key: "postId", Value: "123"})

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	postHandler.GetPost(c)

	// Assert response - mock returns success with empty/default post
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestPostHandler_AnonymizePost tests AnonymizePost endpoint (M3-6-4).
func TestPostHandler_AnonymizePost(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	postHandler := NewPostHandler(fixtures.PostService)

	req := map[string]interface{}{
		"postId": 123,
	}

	reqBody, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("PUT", "/api/posts/anonymize", bytes.NewBuffer(reqBody))
	httpReq.Header.Set("Content-Type", "application/json")

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	postHandler.AnonymizePost(c)

	// Assert response - mock returns success
	assert.Equal(t, http.StatusOK, w.Code)
}

// TestPostHandler_GetPostHistory tests GetPostHistory endpoint.
func TestPostHandler_GetPostHistory(t *testing.T) {
	fixtures := svcimpl.NewTestFixtures()
	postHandler := NewPostHandler(fixtures.PostService)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("GET", "/api/posts/history", nil)

	c, _ := gin.CreateTestContext(w)
	c.Request = httpReq

	// Inject auth context
	ctx := contextkeys.WithBusinessID(c.Request.Context(), 1)
	ctx = contextkeys.WithUserID(ctx, "test-user-id")
	c.Request = c.Request.WithContext(ctx)

	// Call handler
	postHandler.GetPostHistory(c)

	// Assert response - mock returns empty list successfully
	assert.Equal(t, http.StatusOK, w.Code)
}
