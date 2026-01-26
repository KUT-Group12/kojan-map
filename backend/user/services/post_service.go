package services

import (
	"errors"
	"time"

	"kojan-map/user/models"

	"gorm.io/gorm"
)

// PostService 投稿関連のビジネスロジック
type PostService struct {
	db *gorm.DB
}

func NewPostService(db *gorm.DB) *PostService {
	return &PostService{db: db}
}

// GetAllPosts 投稿一覧を取得
func (ps *PostService) GetAllPosts() ([]map[string]interface{}, error) {
	var posts []struct {
		models.Post
		GenreName  string  `gorm:"column:genre_name"`
		GenreColor string  `gorm:"column:genre_color"`
		Latitude   float64 `gorm:"column:latitude"`
		Longitude  float64 `gorm:"column:longitude"`
	}

	// JOINクエリで関連データを一度に取得（N+1問題を解決）
	err := ps.db.
		Table("post").
		Select("post.*, genre.genreName as genre_name, genre.color as genre_color, place.latitude, place.longitude").
		Joins("LEFT JOIN genre ON genre.genreId = post.genreId").
		Joins("LEFT JOIN place ON place.placeId = post.placeId").
		Order("post.postDate DESC").
		Find(&posts).Error

	if err != nil {
		return nil, err
	}

	// フロントエンド用にデータを変換
	result := make([]map[string]interface{}, len(posts))
	for i, post := range posts {
		result[i] = map[string]interface{}{
			"postId":      post.ID,
			"placeId":     post.PlaceID,
			"genreId":     post.GenreID,
			"userId":      post.UserID,
			"title":       post.Title,
			"text":        post.Text,
			"postImage":   post.PostImage,
			"numView":     post.NumView,
			"numReaction": post.NumReaction,
			"postDate":    post.PostDate,
			"latitude":    post.Latitude,
			"longitude":   post.Longitude,
			"genreName":   post.GenreName,
			"genreColor":  post.GenreColor,
		}
	}
	return result, nil
}

// GetPostDetail 投稿詳細を取得
func (ps *PostService) GetPostDetail(postID int32) (map[string]interface{}, error) {
	post := models.Post{}
	if err := ps.db.Where("postId = ?", postID).First(&post).Error; err != nil {
		return nil, errors.New("post not found")
	}

	// 閲覧数をインクリメント（アトミックに実行）
	if err := ps.db.Model(&post).UpdateColumn("numView", gorm.Expr("numView + ?", 1)).Error; err != nil {
		return nil, err
	}
	post.NumView++

	// ユーザー情報を取得
	user := models.User{}
	if err := ps.db.Where("googleId = ?", post.UserID).First(&user).Error; err != nil {
		return nil, err
	}

	// ジャンルを取得
	genre := models.Genre{}
	if err := ps.db.Where("genreId = ?", post.GenreID).First(&genre).Error; err != nil {
		return nil, err
	}

	// 場所情報を取得
	place := models.Place{}
	if err := ps.db.Where("placeId = ?", post.PlaceID).First(&place).Error; err != nil {
		return nil, err
	}

	result := map[string]interface{}{
		"postId":      post.ID,
		"placeId":     post.PlaceID,
		"genreId":     post.GenreID,
		"userId":      post.UserID,
		"title":       post.Title,
		"text":        post.Text,
		"postImage":   post.PostImage,
		"numView":     post.NumView,
		"numReaction": post.NumReaction,
		"postDate":    post.PostDate,
		"latitude":    place.Latitude,
		"longitude":   place.Longitude,
		"genreName":   genre.GenreName,
		"genreColor":  genre.Color,
	}

	return result, nil
}

// CreatePost 投稿を作成
func (ps *PostService) CreatePost(post *models.Post) error {
	if post.Title == "" || post.Text == "" {
		return errors.New("title and text are required")
	}
	return ps.db.Create(post).Error
}

// GetUserPostHistory ユーザーの投稿履歴を取得
func (ps *PostService) GetUserPostHistory(userID string) ([]models.Post, error) {
	var posts []models.Post
	if err := ps.db.Where("userId = ?", userID).
		Order("postDate DESC").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

// GetPinSize ピンサイズを判定（場所の投稿数が50以上で1.3倍）
func (ps *PostService) GetPinSize(placeID int32) (float64, error) {
	var count int64
	if err := ps.db.Model(&models.Post{}).
		Where("placeId = ?", placeID).
		Count(&count).Error; err != nil {
		return 1.0, err
	}

	if count >= 50 {
		return 1.3, nil
	}
	return 1.0, nil
}

// AddReaction リアクションを追加
func (ps *PostService) AddReaction(userID string, postID int32) error {
	if userID == "" {
		return errors.New("userID is required")
	}

	// 既にリアクション済みか確認
	var existingReaction models.UserReaction
	result := ps.db.Where("userId = ? AND postId = ?", userID, postID).
		First(&existingReaction)

	if result.Error == nil {
		// 既にリアクション済みの場合は削除（トグル）
		if err := ps.db.Delete(&existingReaction).Error; err != nil {
			return err
		}
		// リアクション数をデクリメント
		return ps.db.Model(&models.Post{}).
			Where("postId = ?", postID).
			Update("numReaction", gorm.Expr("numReaction - 1")).Error
	}

	// リアクションを追加
	reaction := models.UserReaction{
		UserID: userID,
		PostID: postID,
	}
	if err := ps.db.Create(&reaction).Error; err != nil {
		return err
	}

	// リアクション数をインクリメント
	return ps.db.Model(&models.Post{}).
		Where("postId = ?", postID).
		Update("numReaction", gorm.Expr("numReaction + 1")).Error
}

// SearchPostsByKeyword キーワード検索
func (ps *PostService) SearchPostsByKeyword(keyword string) ([]models.Post, error) {
	var posts []models.Post
	if err := ps.db.Where("title LIKE ? OR text LIKE ?",
		"%"+keyword+"%", "%"+keyword+"%").
		Order("postDate DESC").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

// SearchPostsByGenre ジャンルで検索
func (ps *PostService) SearchPostsByGenre(genreID int32) ([]models.Post, error) {
	var posts []models.Post
	if err := ps.db.Where("genreId = ?", genreID).
		Order("postDate DESC").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

// SearchPostsByPeriod 期間で検索
func (ps *PostService) SearchPostsByPeriod(startDate, endDate time.Time) ([]models.Post, error) {
	var posts []models.Post
	if err := ps.db.Where("postDate BETWEEN ? AND ?",
		startDate, endDate).
		Order("postDate DESC").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

// DeletePost 投稿を削除（ソフトデリート）
func (ps *PostService) DeletePost(postID int32, userID string) error {
	if userID == "" {
		return errors.New("userID is required")
	}

	var post models.Post
	if err := ps.db.Where("postId = ?", postID).First(&post).Error; err != nil {
		return errors.New("post not found")
	}

	// 投稿者本人かチェック
	if post.UserID != userID {
		return errors.New("unauthorized: you can only delete your own posts")
	}

	// ソフトデリート
	if err := ps.db.Delete(&post).Error; err != nil {
		return errors.New("failed to delete post")
	}

	return nil
}

// GetUserReactionHistory ユーザーがリアクションした投稿を取得
func (ps *PostService) GetUserReactionHistory(userID string) ([]map[string]interface{}, error) {
	var results []struct {
		models.Post
		GenreName  string  `gorm:"column:genre_name"`
		GenreColor string  `gorm:"column:genre_color"`
		Latitude   float64 `gorm:"column:latitude"`
		Longitude  float64 `gorm:"column:longitude"`
	}

	// reactionテーブルを起点にpost, genre, placeを結合
	err := ps.db.Table("reaction").
		Select("post.*, genre.genreName as genre_name, genre.color as genre_color, place.latitude, place.longitude").
		Joins("INNER JOIN post ON post.postId = reaction.postId").
		Joins("LEFT JOIN genre ON genre.genreId = post.genreId").
		Joins("LEFT JOIN place ON place.placeId = post.placeId").
		Where("reaction.userId = ?", userID).
		Order("reaction.createdAt DESC").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	// フロントエンド用にデータを変換
	response := make([]map[string]interface{}, len(results))
	for i, r := range results {
		response[i] = map[string]interface{}{
			"postId":      r.ID,
			"placeId":     r.PlaceID,
			"genreId":     r.GenreID,
			"userId":      r.UserID,
			"title":       r.Title,
			"text":        r.Text,
			"postImage":   r.PostImage,
			"numView":     r.NumView,
			"numReaction": r.NumReaction,
			"postDate":    r.PostDate,
			"latitude":    r.Latitude,
			"longitude":   r.Longitude,
			"genreName":   r.GenreName,
			"genreColor":  r.GenreColor,
		}
	}
	return response, nil
}

// IsUserReacted ユーザーがリアクション済みかチェック
func (ps *PostService) IsUserReacted(userID string, postID int32) (bool, error) {
	var count int64
	if err := ps.db.Model(&models.UserReaction{}).
		Where("userId = ? AND postId = ?", userID, postID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// GetPinSizes 複数のplaceIdに対してピンサイズを返す
func (ps *PostService) GetPinSizes(placeIDs []int32) (map[int32]float64, error) {
	result := make(map[int32]float64, len(placeIDs))
	if len(placeIDs) == 0 {
		return result, nil
	}
	// placeIdごとに投稿数をまとめて取得
	type CountResult struct {
		PlaceID int32
		Count   int64
	}
	var counts []CountResult
	if err := ps.db.Model(&models.Post{}).
		Select("placeId, COUNT(*) as count").
		Where("placeId IN ?", placeIDs).
		Group("placeId").
		Scan(&counts).Error; err != nil {
		return nil, err
	}
	countMap := make(map[int32]int64, len(counts))
	for _, c := range counts {
		countMap[c.PlaceID] = c.Count
	}
	for _, pid := range placeIDs {
		cnt := countMap[pid]
		if cnt >= 50 {
			result[pid] = 1.3
		} else {
			result[pid] = 1.0
		}
	}
	return result, nil
}
