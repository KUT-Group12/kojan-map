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
	postService  *services.PostService
	placeService *services.PlaceService
	genreService *services.GenreService
}

// NewPostHandler 投稿ハンドラーを初期化
func NewPostHandler(postService *services.PostService, placeService *services.PlaceService, genreService *services.GenreService) *PostHandler {
	return &PostHandler{
		postService:  postService,
		placeService: placeService,
		genreService: genreService,
	}
}

// GetPosts 投稿一覧を取得
// GET /api/posts
func (ph *PostHandler) GetPosts(c *gin.Context) {
	posts, err := ph.postService.GetAllPosts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
		return
	}

	c.JSON(http.StatusOK, posts)
}

// GetPostDetail 投稿詳細を取得
// GET /api/posts/detail
func (ph *PostHandler) GetPostDetail(c *gin.Context) {
	postIDStr := c.Query("postId")
	if postIDStr == "" {
		postIDStr = c.Query("id")
	}
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
		Latitude    float64  `json:"latitude" binding:"required"`
		Longitude   float64  `json:"longitude" binding:"required"`
		Title       string   `json:"title" binding:"required"`
		Description string   `json:"description" binding:"required"`
		Genre       string   `json:"genre" binding:"required"`
		Images      []string `json:"images"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request format", "details": err.Error()})
		return
	}

	// タイトルと説明文の長さを検証
	if len(req.Title) > 50 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title too long (max 50 characters)"})
		return
	}
	if len(req.Description) > 2000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "description too long (max 2000 characters)"})
		return
	}

	// ジャンルIDをデータベースから取得
	genreID, err := ph.genreService.GetGenreByName(req.Genre)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "無効なジャンルです", "details": err.Error()})
		return
	}

	// 画像がある場合は最初の画像を使用
	// TODO: base64文字列のデコード処理と画像保存の実装
	var postImage []byte
	_ = req.Images // 将来使用予定

	// 認証ミドルウェアで設定されたユーザーIDをコンテキストから取得
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: userID not found in context"})
		return
	}

	userID, ok := userIDValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid userID type in context"})
		return
	}

	// 場所を登録または取得
	placeID, err := ph.placeService.FindOrCreatePlace(req.Latitude, req.Longitude)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to register place"})
		return
	}

	post := models.Post{
		PlaceID:     placeID,
		GenreID:     genreID,
		UserID:      userID,
		Title:       req.Title,
		Text:        req.Description,
		PostImage:   postImage,
		PostDate:    time.Now(),
		NumReaction: 0, // 初期値
		NumView:     0, // 初期値
	}

	if err := ph.postService.CreatePost(&post); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"postId":  post.ID,
		"message": "post created successfully",
	})
}

// AnonymizePost 投稿を匿名化

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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to search posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"posts":   posts,
		"total":   len(posts),
		"keyword": keyword,
	})
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

// DeletePost 投稿を削除
// DELETE /api/posts
func (ph *PostHandler) DeletePost(c *gin.Context) {
	var req struct {
		PostID int `json:"postId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request format"})
		return
	}

	// 認証済みコンテキストから userID を取得
	userID := c.GetString("googleId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := ph.postService.DeletePost(req.PostID, userID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "post deleted successfully"})
}

// CheckReactionStatus リアクション状態を確認
// GET /api/posts/reaction/status
func (ph *PostHandler) CheckReactionStatus(c *gin.Context) {
	postIDStr := c.Query("postId")
	userID := c.Query("userId")

	if postIDStr == "" || userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "postId and userId required"})
		return
	}

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid postId"})
		return
	}

	isReacted, err := ph.postService.IsUserReacted(userID, postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check reaction status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"isReacted": isReacted,
		"postId":    postID,
		"userId":    userID,
	})
}
