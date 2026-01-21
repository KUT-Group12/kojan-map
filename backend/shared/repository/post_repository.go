package repository

import (
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// PostRepository handles database operations for posts
type PostRepository struct {
	db *gorm.DB
}

// NewPostRepository creates a new PostRepository
func NewPostRepository(db *gorm.DB) *PostRepository {
	return &PostRepository{db: db}
}

// CountAll counts all posts
func (r *PostRepository) CountAll() (int, error) {
	var count int64
	result := r.db.Model(&models.Post{}).Count(&count)
	return int(count), result.Error
}

// SumReactions sums all reactions across all posts
func (r *PostRepository) SumReactions() (int, error) {
	var sum int64
	result := r.db.Model(&models.Post{}).Select("COALESCE(SUM(numReaction), 0)").Scan(&sum)
	return int(sum), result.Error
}
