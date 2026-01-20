package handler

import (
	"net/http"
	"strconv"

	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/contextkeys"
	"kojan-map/business/pkg/response"

	"github.com/gin-gonic/gin"
)

// PostHandler は投稿関連のエンドポイントを処理するハンドラーです。
type PostHandler struct {
	postService service.PostService
}

// NewPostHandler は新しい投稿ハンドラーを作成します。
func NewPostHandler(postService service.PostService) *PostHandler {
	return &PostHandler{
		postService: postService,
	}
}

// ListPosts は GET /api/business/posts (M1-6-1) を処理します。
func (h *PostHandler) ListPosts(c *gin.Context) {
	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "businessId query parameter is required", c.Request.URL.Path)
		return
	}

	businessID, err := strconv.Atoi(businessIDStr)
	if err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "businessId must be a valid integer", c.Request.URL.Path)
		return
	}

	result, err := h.postService.List(c.Request.Context(), int32(businessID))
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// GetPost は GET /api/posts/:postId (M1-7-2) を処理します。
func (h *PostHandler) GetPost(c *gin.Context) {
	postIDStr := c.Param("postId")
	if postIDStr == "" {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "postId path parameter is required", c.Request.URL.Path)
		return
	}

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", "postId must be a valid integer", c.Request.URL.Path)
		return
	}

	result, err := h.postService.Get(c.Request.Context(), int32(postID))
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}

// CreatePost は POST /api/posts (M1-8-4) を処理します。
// 画像は PNG または JPEG のみ、5MB以下
func (h *PostHandler) CreatePost(c *gin.Context) {
	var req domain.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", err.Error(), c.Request.URL.Path)
		return
	}

	// Extract businessID from authenticated context
	businessID, ok := contextkeys.GetBusinessID(c.Request.Context())
	if !ok {
		response.SendProblem(c, http.StatusUnauthorized, "unauthorized", "business ID not found in context", c.Request.URL.Path)
		return
	}
	placeID := int32(0) // Placeholder

	// GenreIDsはリクエストから取得
	genreIDs := req.GenreIDs

	// 画像のMIMEタイプとサイズの検証はサービス層で実施

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

// AnonymizePost は PUT /api/posts/anonymize (M1-13-2) を処理します。
func (h *PostHandler) AnonymizePost(c *gin.Context) {
	var req domain.AnonymizePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", err.Error(), c.Request.URL.Path)
		return
	}

	// PostID is already int64 in request struct
	postID := req.PostID

	err := h.postService.Anonymize(c.Request.Context(), postID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusOK, gin.H{
		"message": "post anonymized successfully",
	})
}

// GetPostHistory は GET /api/posts/history (M1-14-2) を処理します。
func (h *PostHandler) GetPostHistory(c *gin.Context) {
	googleID, ok := contextkeys.GetUserID(c.Request.Context())
	if !ok {
		response.SendProblem(c, http.StatusUnauthorized, "unauthorized", "user ID not found in context", c.Request.URL.Path)
		return
	}

	result, err := h.postService.History(c.Request.Context(), googleID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendOK(c, result)
}
