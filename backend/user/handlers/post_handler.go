package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"kojan-map/user/models"
	"kojan-map/user/services"
)

// PostHandler 投稿関連のハンドラー
type PostHandler struct {
	postService *services.PostService
}

// NewPostHandler 投稿ハンドラーを初期化
func NewPostHandler(postService *services.PostService) *PostHandler {
	return &PostHandler{postService: postService}
}

// GetPosts 投稿一覧を取得
// GET /api/posts
func (ph *PostHandler) GetPosts(c *gin.Context) {
	posts, err := ph.postService.GetAllPosts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// GetPostDetail 投稿詳細を取得
// GET /api/posts/detail
func (ph *PostHandler) GetPostDetail(c *gin.Context) {
	postIDStr := c.Query("postId")
	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid postId"})
		return
	}

	post, err := ph.postService.GetPostDetail(postID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, post)
}

// CreatePost 投稿を作成
// POST /api/posts
func (ph *PostHandler) CreatePost(c *gin.Context) {
	var req struct {
		PlaceID   int    `json:"placeId" binding:"required"`
		GenreID   int    `json:"genreId" binding:"required"`
		UserID    string `json:"userId" binding:"required"`
		Title     string `json:"title" binding:"required"`
		Text      string `json:"text" binding:"required"`
		PostImage string `json:"postImage"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post := models.Post{
		PlaceID:   req.PlaceID,
		GenreID:   req.GenreID,
		UserID:    req.UserID,
		Title:     req.Title,
		Text:      req.Text,
		PostImage: req.PostImage,
		PostDate:  time.Now(),
	}

	if err := ph.postService.CreatePost(&post); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"postId": post.ID})
}

// AnonymizePost 投稿を匿名化
// PUT /api/posts/anonymize
func (ph *PostHandler) AnonymizePost(c *gin.Context) {
	var req struct {
		PostID int `json:"postId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ph.postService.AnonymizePost(req.PostID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "post anonymized"})
}

// GetPostHistory ユーザーの投稿履歴を取得
// GET /api/posts/history
func (ph *PostHandler) GetPostHistory(c *gin.Context) {
	userID := c.Query("googleId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "googleId required"})
		return
	}

	posts, err := ph.postService.GetUserPostHistory(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// GetPinSize ピンサイズを判定
// GET /api/posts/pin/scale
func (ph *PostHandler) GetPinSize(c *gin.Context) {
	postIDStr := c.Query("postId")
	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid postId"})
		return
	}

	pinSize, err := ph.postService.GetPinSize(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"pinSize": pinSize})
}

// AddReaction リアクションを追加
// POST /api/posts/reaction
func (ph *PostHandler) AddReaction(c *gin.Context) {
	var req struct {
		PostID int    `json:"postId" binding:"required"`
		UserID string `json:"userId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ph.postService.AddReaction(req.UserID, req.PostID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "reaction added"})
}

// SearchByKeyword キーワード検索
// GET /api/posts/search
func (ph *PostHandler) SearchByKeyword(c *gin.Context) {
	keyword := c.Query("keyword")
	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "keyword required"})
		return
	}

	posts, err := ph.postService.SearchPostsByKeyword(keyword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// SearchByGenre ジャンル検索
// GET /api/posts/search/genre
func (ph *PostHandler) SearchByGenre(c *gin.Context) {
	genreIDStr := c.Query("genreId")
	genreID, err := strconv.Atoi(genreIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid genreId"})
		return
	}

	posts, err := ph.postService.SearchPostsByGenre(genreID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// SearchByPeriod 期間検索
// GET /api/posts/search/period
func (ph *PostHandler) SearchByPeriod(c *gin.Context) {
	startDateStr := c.Query("startDate")
	endDateStr := c.Query("endDate")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid startDate format (use YYYY-MM-DD)"})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid endDate format (use YYYY-MM-DD)"})
		return
	}

	posts, err := ph.postService.SearchPostsByPeriod(startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}
