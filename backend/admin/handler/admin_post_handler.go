package handler

import (
	"errors"
	"net/http"
	"strconv"

	"kojan-map/admin/service"

	"github.com/gin-gonic/gin"
)

// AdminPostHandler handles admin post management HTTP requests.
type AdminPostHandler struct {
	postService *service.AdminPostService
}

// NewAdminPostHandler creates a new AdminPostHandler.
//
// Parameters:
//   - postService: 投稿管理サービスのインスタンス
//
// Returns:
//   - *AdminPostHandler: 新しいハンドラーインスタンス
func NewAdminPostHandler(postService *service.AdminPostService) *AdminPostHandler {
	return &AdminPostHandler{postService: postService}
}

// GetPostByID godoc
// @Summary 投稿詳細を取得
// @Description 指定したIDの投稿詳細情報を取得します
// @Tags Admin Posts
// @Accept json
// @Produce json
// @Param postId path int true "投稿ID"
// @Success 200 {object} service.PostDetailResponse "投稿詳細"
// @Failure 400 {object} map[string]string "不正なリクエスト"
// @Failure 404 {object} map[string]string "投稿が見つからない"
// @Failure 500 {object} map[string]string "サーバーエラー"
// @Router /api/admin/posts/{postId} [get]
// @Security BearerAuth
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

// DeletePost godoc
// @Summary 投稿を削除
// @Description 指定したIDの投稿を削除します。関連する通報も同時に削除されます。
// @Tags Admin Posts
// @Accept json
// @Produce json
// @Param postId path int true "投稿ID"
// @Success 200 {object} map[string]string "削除成功メッセージ"
// @Failure 400 {object} map[string]string "不正なリクエスト"
// @Failure 404 {object} map[string]string "投稿が見つからない"
// @Failure 500 {object} map[string]string "サーバーエラー"
// @Router /api/admin/posts/{postId} [delete]
// @Security BearerAuth
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
