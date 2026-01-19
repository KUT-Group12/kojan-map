package handler

import (
	"errors"
	"net/http"
	"strconv"

	"kojan-map/admin/service"

	"github.com/gin-gonic/gin"
)

// AdminPostHandler handles admin post management HTTP requests
type AdminPostHandler struct {
	postService *service.AdminPostService
}

// NewAdminPostHandler creates a new AdminPostHandler
func NewAdminPostHandler(postService *service.AdminPostService) *AdminPostHandler {
	return &AdminPostHandler{postService: postService}
}

// GetPostByID retrieves a post by ID
// GET /api/admin/posts/:postId
func (h *AdminPostHandler) GetPostByID(c *gin.Context) {
	postIDStr := c.Param("postId")
	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post ID"})
		return
	}

	post, err := h.postService.GetPostByID(postID)
	if err != nil {
		// エラー種別を判別してステータスコードを変更
		if errors.Is(err, service.ErrPostNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
			return
		}
		// DB接続エラー等の内部エラー
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, post)
}

// DeletePost deletes a post by ID
// DELETE /api/admin/posts/:postId
func (h *AdminPostHandler) DeletePost(c *gin.Context) {
	postIDStr := c.Param("postId")
	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post ID"})
		return
	}

	err = h.postService.DeletePost(postID)
	if err != nil {
		// エラー種別を判別してステータスコードを変更
		if errors.Is(err, service.ErrPostNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
			return
		}
		// DB接続エラー等の内部エラー
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "post deleted successfully"})
}
