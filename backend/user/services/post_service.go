package services

import (
	"errors"
	"fmt"
	"time"

	"kojan-map/user/config"
	"kojan-map/user/models"

	"gorm.io/gorm"
)

// PostService 投稿関連のビジネスロジック
type PostService struct{}

// GetAllPosts 投稿一覧を取得
func (ps *PostService) GetAllPosts() ([]map[string]interface{}, error) {
	var posts []struct {
		models.Post
		GenreName string  `gorm:"column:genre_name"`
		Latitude  float64 `gorm:"column:latitude"`
		Longitude float64 `gorm:"column:longitude"`
	}

	// JOINクエリで関連データを一度に取得（N+1問題を解決）
	err := config.DB.
		Table("post").
		Select("post.*, genre.genreName as genre_name, place.latitude, place.longitude").
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
		}
	}
	return result, nil
}

// GetPostDetail 投稿詳細を取得
func (ps *PostService) GetPostDetail(postID int32) (map[string]interface{}, error) {
	post := models.Post{}
	if err := config.DB.Where("postId = ?", postID).First(&post).Error; err != nil {
		return nil, errors.New("post not found")
	}

	// 閲覧数をインクリメント（アトミックに実行）
	if err := config.DB.Model(&post).UpdateColumn("numView", gorm.Expr("numView + ?", 1)).Error; err != nil {
		return nil, err
	}
	post.NumView++

	// ユーザー情報を取得
	user := models.User{}
	if err := config.DB.Where("id = ?", post.UserID).First(&user).Error; err != nil {
		return nil, err
	}

	// ジャンルを取得
	genre := models.Genre{}
	if err := config.DB.Where("genreId = ?", post.GenreID).First(&genre).Error; err != nil {
		return nil, err
	}

	// 場所情報を取得
	place := models.Place{}
	if err := config.DB.Where("placeId = ?", post.PlaceID).First(&place).Error; err != nil {
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
	}

	return result, nil
}

// CreatePost 投稿を作成
func (ps *PostService) CreatePost(post *models.Post) error {
	fmt.Println("--- CreatePost 関数が呼び出されました！ ---")
	fmt.Printf("受信データ: %+v\n", post)
	if post.Title == "" || post.Text == "" {
		fmt.Printf("DB保存エラー\n")
		return errors.New("title and text are required")
	}
	return config.DB.Create(post).Error
}

// GetUserPostHistory ユーザーの投稿履歴を取得
func (ps *PostService) GetUserPostHistory(userID string) ([]models.Post, error) {
	var posts []models.Post
	if err := config.DB.Where("userId = ? AND deletedAt IS NULL", userID).
		Order("postDate DESC").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

// GetPinSize ピンサイズを判定（場所の投稿数が50以上で1.3倍）
func (ps *PostService) GetPinSize(placeID int32) (float64, error) {
	var count int64
	if err := config.DB.Model(&models.Post{}).
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
	result := config.DB.Where("userId = ? AND postId = ?", userID, postID).
		First(&existingReaction)

	if result.Error == nil {
		// 既にリアクション済みの場合は削除（トグル）
		if err := config.DB.Delete(&existingReaction).Error; err != nil {
			return err
		}
		// リアクション数をデクリメント
		return config.DB.Model(&models.Post{}).
			Where("postId = ?", postID).
			Update("numReaction", gorm.Expr("numReaction - 1")).Error
	}

	// リアクションを追加
	reaction := models.UserReaction{
		UserID: userID,
		PostID: postID,
	}
	if err := config.DB.Create(&reaction).Error; err != nil {
		return err
	}

	// リアクション数をインクリメント
	return config.DB.Model(&models.Post{}).
		Where("postId = ?", postID).
		Update("numReaction", gorm.Expr("numReaction + 1")).Error
}

// SearchPostsByKeyword キーワード検索
func (ps *PostService) SearchPostsByKeyword(keyword string) ([]models.Post, error) {
	var posts []models.Post
	if err := config.DB.Where("title LIKE ? OR text LIKE ?",
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
	if err := config.DB.Where("genreId = ?", genreID).
		Order("postDate DESC").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

// SearchPostsByPeriod 期間で検索
func (ps *PostService) SearchPostsByPeriod(startDate, endDate time.Time) ([]models.Post, error) {
	var posts []models.Post
	if err := config.DB.Where("postDate BETWEEN ? AND ?",
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
	if err := config.DB.Where("postId = ?", postID).First(&post).Error; err != nil {
		return errors.New("post not found")
	}

	// 投稿者本人かチェック
	if post.UserID != userID {
		return errors.New("unauthorized: you can only delete your own posts")
	}

	// ソフトデリート
	if err := config.DB.Delete(&post).Error; err != nil {
		return errors.New("failed to delete post")
	}

	return nil
}

// IsUserReacted ユーザーがリアクション済みかチェック
func (ps *PostService) IsUserReacted(userID string, postID int32) (bool, error) {
	var count int64
	if err := config.DB.Model(&models.UserReaction{}).
		Where("userId = ? AND postId = ?", userID, postID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
