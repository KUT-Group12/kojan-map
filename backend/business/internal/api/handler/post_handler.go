package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/response"
)

// PostHandler handles post-related endpoints.
type PostHandler struct {
	postService service.PostService
}

// NewPostHandler creates a new post handler.
func NewPostHandler(postService service.PostService) *PostHandler {
	return &PostHandler{
		postService: postService,
	}
}

// ListPosts handles GET /api/business/posts (M1-6-1).
// SSOT Endpoint: GET /api/business/posts
func (h *PostHandler) ListPosts(c *gin.Context) {
	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		response.SendBadRequest(c, "businessId query parameter is required")
		return
	}

	businessID, err := strconv.ParseInt(businessIDStr, 10, 64)
	if err != nil {
		response.SendBadRequest(c, "businessId must be a valid integer")
		return
	}

	result, err := h.postService.List(c.Request.Context(), businessID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// GetPost handles GET /api/posts/:postId (M1-7-2).
// SSOT Endpoint: GET /api/posts/:postId
func (h *PostHandler) GetPost(c *gin.Context) {
	postIDStr := c.Param("postId")
	if postIDStr == "" {
		response.SendBadRequest(c, "postId path parameter is required")
		return
	}

	postID, err := strconv.ParseInt(postIDStr, 10, 64)
	if err != nil {
		response.SendBadRequest(c, "postId must be a valid integer")
		return
	}

	result, err := h.postService.Get(c.Request.Context(), postID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// CreatePost handles POST /api/posts (M1-8-4).
// SSOT Endpoint: POST /api/posts
// SSOT Rules: 画像は PNG または JPEG のみ、5MB以下
func (h *PostHandler) CreatePost(c *gin.Context) {
	var req domain.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendBadRequest(c, err.Error())
		return
	}

	// TODO: Extract businessID from authenticated session
	businessID := int64(1) // Placeholder
	placeID := int64(0)    // Placeholder

	// TODO: Parse genreIDs from request (array)
	var genreIDs []int64

	// Note: Image MIME type validation is handled by client or separate image upload endpoint

	postID, err := h.postService.Create(c.Request.Context(), businessID, placeID, genreIDs, &req)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusCreated, gin.H{
		"postId":  postID,
		"message": "post created successfully",
	})
}

// AnonymizePost handles PUT /api/posts/anonymize (M1-13-2).
// SSOT Endpoint: PUT /api/posts/anonymize
func (h *PostHandler) AnonymizePost(c *gin.Context) {
	var req domain.AnonymizePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendBadRequest(c, err.Error())
		return
	}

	// Convert string postID to int64
	postID, err := strconv.ParseInt(req.PostID, 10, 64)
	if err != nil {
		response.SendBadRequest(c, "postId must be a valid integer")
		return
	}

	err = h.postService.Anonymize(c.Request.Context(), postID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusOK, gin.H{
		"message": "post anonymized successfully",
	})
}

// GetPostHistory handles GET /api/posts/history (M1-14-2).
// SSOT Endpoint: GET /api/posts/history
func (h *PostHandler) GetPostHistory(c *gin.Context) {
	googleID := c.Query("googleId")
	if googleID == "" {
		response.SendBadRequest(c, "googleId query parameter is required")
		return
	}

	result, err := h.postService.History(c.Request.Context(), googleID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}
