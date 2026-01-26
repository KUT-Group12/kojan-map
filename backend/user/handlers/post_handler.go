package handlers

import (
	"encoding/base64"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

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

	post, err := ph.postService.GetPostDetail(int32(postID))
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
		PlaceID     int      `json:"placeId"` // Optional
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request format", "details": err.Error()})
		return
	}

	// タイトルと説明文の長さを検証
	if utf8.RuneCountInString(req.Title) > 50 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title too long (max 50 characters)"})
		return
	}
	if utf8.RuneCountInString(req.Description) > 2000 {
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
	var postImage []byte
	if len(req.Images) > 0 {
		imgStr := req.Images[0]
		// Base64文字列からプレフィックス（data:image/jpeg;base64,など）を除去
		if idx := strings.Index(imgStr, ","); idx != -1 {
			if idx+1 < len(imgStr) {
				imgStr = imgStr[idx+1:]
			} else {
				// カンマが末尾にある場合、本体は空
				imgStr = ""
			}
		}

		if imgStr != "" {
			decoded, err := base64.StdEncoding.DecodeString(imgStr)
			if err == nil {
				postImage = decoded
			}
		}
	}

	// 認証ミドルウェアで設定されたユーザーIDをコンテキストから取得（googleId を統一利用）
	userID := c.GetString("googleId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var placeID int32
	if req.PlaceID != 0 {
		// 指定されたPlaceIDを使用
		placeID = int32(req.PlaceID)
		// 存在確認などは簡略化（存在しない場合はFKエラーになるか、下記ロジックで安全に）
		// ここでは実在確認まではしないが、必要なら placeService.GetPlaceByID を呼ぶ
	} else {
		// 場所を登録または取得
		id, err := ph.placeService.FindOrCreatePlace(req.Latitude, req.Longitude)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to register place", "details": err.Error()})
			return
		}
		placeID = id
	}

	post := models.Post{
		PlaceID:     placeID,
		GenreID:     int32(genreID),
		UserID:      userID,
		Title:       req.Title,
		Text:        req.Description,
		PostImage:   postImage,
		PostDate:    time.Now(),
		NumReaction: 0, // 初期値
		NumView:     0, // 初期値
	}

	if err := ph.postService.CreatePost(&post); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post", "details": err.Error()})
		return
	}

	// 場所情報も返す
	place, err := ph.placeService.GetPlaceByID(post.PlaceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch place info", "details": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"postId":    post.ID,
		"placeId":   post.PlaceID,
		"latitude":  place.Latitude,
		"longitude": place.Longitude,
		"message":   "post created successfully",
	})
}

// AnonymizePost 投稿を匿名化

// GetPostHistory ユーザーの投稿履歴を取得
// GET /api/posts/history
func (ph *PostHandler) GetPostHistory(c *gin.Context) {
	userID := c.GetString("googleId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	posts, err := ph.postService.GetUserPostHistory(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// GetReactionHistory ユーザーがリアクションした投稿履歴を取得
// GET /api/posts/history/reactions
func (ph *PostHandler) GetReactionHistory(c *gin.Context) {
	userID := c.GetString("googleId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	posts, err := ph.postService.GetUserReactionHistory(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// GetPinSize ピンサイズを判定
// GET /api/posts/pin/scale
func (ph *PostHandler) GetPinSize(c *gin.Context) {
	placeIDStr := c.Query("placeId")
	placeID, err := strconv.Atoi(placeIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid placeId"})
		return
	}

	pinSize, err := ph.postService.GetPinSize(int32(placeID))
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
		PostID int `json:"postId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("googleId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := ph.postService.AddReaction(userID, int32(req.PostID)); err != nil {
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

	posts, err := ph.postService.SearchPostsByGenre(int32(genreID))
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

	if err := ph.postService.DeletePost(int32(req.PostID), userID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "post deleted successfully"})
}

// CheckReactionStatus リアクション状態を確認
// GET /api/posts/reaction/status
func (ph *PostHandler) CheckReactionStatus(c *gin.Context) {
	postIDStr := c.Query("postId")
	if postIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "postId required"})
		return
	}

	userID := c.GetString("googleId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid postId"})
		return
	}

	isReacted, err := ph.postService.IsUserReacted(userID, int32(postID))
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

// GetPinSizes バッチでピンサイズを判定
// POST /api/posts/pin/scales
func (ph *PostHandler) GetPinSizes(c *gin.Context) {
	var req struct {
		PlaceIDs []int32 `json:"placeIds" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request", "details": err.Error()})
		return
	}
	pinSizes, err := ph.postService.GetPinSizes(req.PlaceIDs)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"pinSizes": pinSizes})
}
