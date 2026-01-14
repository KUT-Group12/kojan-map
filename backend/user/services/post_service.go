package services

import (
	"errors"
	"time"

	"kojan-map/user/config"
	"kojan-map/user/models"
)

// PostService 投稿関連のビジネスロジック
type PostService struct{}

// GetAllPosts 投稿一覧を取得
func (ps *PostService) GetAllPosts() ([]map[string]interface{}, error) {
	var posts []models.Post

	// JOINクエリで関連データを一度に取得（N+1問題を解決）
	err := config.DB.
		Select("posts.*, users.email as user_email, genre.genre_name, place.latitude, place.longitude").
		Joins("LEFT JOIN users ON users.id = posts.user_id").
		Joins("LEFT JOIN genre ON genre.genre_id = posts.genre_id").
		Joins("LEFT JOIN place ON place.place_id = posts.place_id").
		Order("posts.post_date DESC").
		Find(&posts).Error

	if err != nil {
		return nil, err
	}

	// フロントエンド用にデータを変換
	result := make([]map[string]interface{}, len(posts))
	for i, post := range posts {
		// 個別にデータを取得（JOINで取得できなかった場合のフォールバック）
		var genre models.Genre
		var place models.Place
		config.DB.Where("genre_id = ?", post.GenreID).First(&genre)
		config.DB.Where("place_id = ?", post.PlaceID).First(&place)

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
			"latitude":    place.Latitude,
			"longitude":   place.Longitude,
			"genreName":   genre.GenreName,
		}
	}
	return result, nil
}

// GetPostDetail 投稿詳細を取得
func (ps *PostService) GetPostDetail(postID int) (map[string]interface{}, error) {
	post := models.Post{}
	if err := config.DB.Where("id = ?", postID).First(&post).Error; err != nil {
		return nil, errors.New("post not found")
	}

	// 閲覧数をインクリメント
	config.DB.Model(&post).Update("num_view", post.NumView+1)

	// ユーザー情報を取得
	user := models.User{}
	config.DB.Where("id = ?", post.UserID).First(&user)

	// ジャンルを取得
	genre := models.Genre{}
	config.DB.Where("genre_id = ?", post.GenreID).First(&genre)

	// 場所情報を取得
	place := models.Place{}
	config.DB.Where("place_id = ?", post.PlaceID).First(&place)

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
		"postData":    post.PostDate,
		"latitude":    place.Latitude,
		"longitude":   place.Longitude,
		"genreName":   genre.GenreName,
	}

	return result, nil
}

// CreatePost 投稿を作成
func (ps *PostService) CreatePost(post *models.Post) error {
	if post.Title == "" || post.Text == "" {
		return errors.New("title and text are required")
	}
	return config.DB.Create(post).Error
}

// GetUserPostHistory ユーザーの投稿履歴を取得
func (ps *PostService) GetUserPostHistory(userID string) ([]models.Post, error) {
	var posts []models.Post
	if err := config.DB.Where("user_id = ? AND deleted_at IS NULL", userID).
		Order("post_date DESC").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

// GetPinSize ピンサイズを判定（投稿数が50以上で1.3倍）
func (ps *PostService) GetPinSize(postID int) (float64, error) {
	var count int64
	if err := config.DB.Model(&models.Post{}).
		Where("id = ?", postID).
		Count(&count).Error; err != nil {
		return 1.0, err
	}

	if count >= 50 {
		return 1.3, nil
	}
	return 1.0, nil
}

// AddReaction リアクションを追加
func (ps *PostService) AddReaction(userID string, postID int) error {
	if userID == "" {
		return errors.New("userID is required")
	}

	// 既にリアクション済みか確認
	var existingReaction models.UserReaction
	result := config.DB.Where("user_id = ? AND post_id = ?", userID, postID).
		First(&existingReaction)

	if result.Error == nil {
		// 既にリアクション済みの場合は削除（トグル）
		if err := config.DB.Delete(&existingReaction).Error; err != nil {
			return err
		}
		// リアクション数をデクリメント
		return config.DB.Model(&models.Post{}).
			Where("id = ?", postID).
			Update("num_reaction", config.DB.Raw("num_reaction - 1")).Error
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
		Where("id = ?", postID).
		Update("num_reaction", config.DB.Raw("num_reaction + 1")).Error
}

// SearchPostsByKeyword キーワード検索
func (ps *PostService) SearchPostsByKeyword(keyword string) ([]models.Post, error) {
	var posts []models.Post
	if err := config.DB.Where("title LIKE ? OR text LIKE ?",
		"%"+keyword+"%", "%"+keyword+"%").
		Order("post_date DESC").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

// SearchPostsByGenre ジャンルで検索
func (ps *PostService) SearchPostsByGenre(genreID int) ([]models.Post, error) {
	var posts []models.Post
	if err := config.DB.Where("genre_id = ?", genreID).
		Order("post_date DESC").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

// SearchPostsByPeriod 期間で検索
func (ps *PostService) SearchPostsByPeriod(startDate, endDate time.Time) ([]models.Post, error) {
	var posts []models.Post
	if err := config.DB.Where("post_date BETWEEN ? AND ?",
		startDate, endDate).
		Order("post_date DESC").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

// DeletePost 投稿を削除（ソフトデリート）
func (ps *PostService) DeletePost(postID int, userID string) error {
	if userID == "" {
		return errors.New("userID is required")
	}

	var post models.Post
	if err := config.DB.Where("id = ?", postID).First(&post).Error; err != nil {
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
func (ps *PostService) IsUserReacted(userID string, postID int) (bool, error) {
	var count int64
	if err := config.DB.Model(&models.UserReaction{}).
		Where("user_id = ? AND post_id = ?", userID, postID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
