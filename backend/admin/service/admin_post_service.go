package service

import (
	"errors"

	"kojan-map/shared/models"

	"gorm.io/gorm"
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
		return nil, errors.New("post not found")
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

// DeletePost deletes a post by ID (hard delete)
func (s *AdminPostService) DeletePost(postID int) error {
	// Check if post exists
	var post models.Post
	result := s.db.Where("postId = ?", postID).First(&post)
	if result.Error != nil {
		return errors.New("post not found")
	}

	// Delete associated reports first
	if err := s.db.Where("postId = ?", postID).Delete(&models.Report{}).Error; err != nil {
		return err
	}

	// Delete the post
	return s.db.Where("postId = ?", postID).Delete(&models.Post{}).Error
}
