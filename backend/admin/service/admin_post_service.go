package service

import (
	"errors"
	"fmt"

	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// カスタムエラー定義
var (
	ErrPostNotFound = errors.New("post not found")
)

// PostDetailResponse represents detailed post information for admin
type PostDetailResponse struct {
	PostID      int    `json:"postId"`
	PlaceID     int    `json:"placeId"`
	UserID      string `json:"userId"`
	PostDate    string `json:"postDate"`
	Title       string `json:"title"`
	Text        string `json:"text"`
	NumReaction int    `json:"numReaction"`
	NumView     int    `json:"numView"`
	GenreID     int    `json:"genreId"`
}

// AdminPostService handles admin post management business logic
type AdminPostService struct {
	db *gorm.DB
}

// NewAdminPostService creates a new AdminPostService
func NewAdminPostService(db *gorm.DB) *AdminPostService {
	return &AdminPostService{db: db}
}

// GetPostByID retrieves a post by ID
func (s *AdminPostService) GetPostByID(postID int) (*PostDetailResponse, error) {
	var post models.Post
	result := s.db.Where("postId = ?", postID).First(&post)
	if result.Error != nil {
		// レコードが見つからない場合と他のエラーを区別
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrPostNotFound
		}
		// DB接続エラー等はそのまま返す
		return nil, fmt.Errorf("failed to get post: %w", result.Error)
	}

	return &PostDetailResponse{
		PostID:      post.PostID,
		PlaceID:     post.PlaceID,
		UserID:      post.UserID,
		PostDate:    post.PostDate.Format("2006-01-02T15:04:05Z07:00"),
		Title:       post.Title,
		Text:        post.Text,
		NumReaction: post.NumReaction,
		NumView:     post.NumView,
		GenreID:     post.GenreID,
	}, nil
}

// DeletePost deletes a post by ID (hard delete) with transaction
func (s *AdminPostService) DeletePost(postID int) error {
	// トランザクションを使用して原子性を保証
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Check if post exists
		var post models.Post
		result := tx.Where("postId = ?", postID).First(&post)
		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				return ErrPostNotFound
			}
			return fmt.Errorf("failed to find post: %w", result.Error)
		}

		// Delete associated reports first
		if err := tx.Where("postId = ?", postID).Delete(&models.Report{}).Error; err != nil {
			return fmt.Errorf("failed to delete reports: %w", err)
		}

		// Delete the post
		if err := tx.Where("postId = ?", postID).Delete(&models.Post{}).Error; err != nil {
			return fmt.Errorf("failed to delete post: %w", err)
		}

		return nil
	})
}
