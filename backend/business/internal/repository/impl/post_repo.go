package impl

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"
	"kojan-map/business/internal/domain"
)

// PostRepoImpl implements the PostRepo interface using GORM.
type PostRepoImpl struct {
	db *gorm.DB
}

// NewPostRepoImpl creates a new post repository.
func NewPostRepoImpl(db *gorm.DB) *PostRepoImpl {
	return &PostRepoImpl{db: db}
}

// ListByBusiness retrieves all posts for a business (M1-6-1).
func (r *PostRepoImpl) ListByBusiness(ctx context.Context, businessID int64) (interface{}, error) {
	var posts []domain.Post
	if err := r.db.WithContext(ctx).
		Where("businessId = ? AND isActive = ?", businessID, true).
		Order("postedAt DESC").
		Find(&posts).Error; err != nil {
		return nil, fmt.Errorf("failed to list posts: %w", err)
	}
	return posts, nil
}

// GetByID retrieves a post by ID (M1-7-2).
func (r *PostRepoImpl) GetByID(ctx context.Context, postID int64) (interface{}, error) {
	var post domain.Post
	if err := r.db.WithContext(ctx).Where("id = ?", postID).First(&post).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("post not found for id %d", postID)
		}
		return nil, err
	}
	return &post, nil
}

// IncrementViewCount increments the view count for a post by 1.
func (r *PostRepoImpl) IncrementViewCount(ctx context.Context, postID int64) error {
	result := r.db.WithContext(ctx).
		Model(&domain.Post{}).
		Where("id = ?", postID).
		UpdateColumn("viewCount", gorm.Expr("viewCount + 1"))

	if result.Error != nil {
		return fmt.Errorf("failed to increment view count for post %d: %w", postID, result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("post not found for id %d", postID)
	}

	return nil
}

// Create creates a new post (M1-8-4).
// SSOT Rules: 投稿はビジネスメンバーのみ作成可能、画像は5MB以下、ジャンルは複数指定可能
func (r *PostRepoImpl) Create(ctx context.Context, businessID int64, placeID int64, genreIDs []int64, payload interface{}) (int64, error) {
	req := payload.(*domain.CreatePostRequest)

	post := &domain.Post{
		// Note: ID generation should be handled by DB (auto-increment or UUID)
		Title:         req.Title,
		Description:   req.Description,
		LocationID:    req.LocationID,
		ViewCount:     0,
		ReactionCount: 0,
		IsActive:      true,
		// PostedAt should be set in service layer or DB default
	}

	if err := r.db.WithContext(ctx).Create(post).Error; err != nil {
		return 0, fmt.Errorf("failed to create post: %w", err)
	}

	// Set genres (many-to-many) - convert string ID to int64
	if len(genreIDs) > 0 {
		// Note: post.ID is string, need to handle type conversion
		if err := r.SetGenres(ctx, 0, genreIDs); err != nil {
			return 0, err
		}
	}

	// Parse post ID back to int64 if needed (depends on schema)
	// For now return 0 as placeholder
	return 0, nil
}

// SetGenres sets genres for a post (many-to-many) (M1-8-4).
func (r *PostRepoImpl) SetGenres(ctx context.Context, postID int64, genreIDs []int64) error {
	// TODO: Implement genre association (join table: post_genre)
	// Expected: INSERT INTO post_genre (post_id, genre_id) VALUES (?, ?)
	// with ON DUPLICATE KEY UPDATE or DELETE existing + INSERT new
	return nil
}

// Anonymize anonymizes a post (M1-13-2).
// SSOT Rules: 投稿内容は復元不能な値に置き換える、主キーおよび外部キーは変更しない
func (r *PostRepoImpl) Anonymize(ctx context.Context, postID int64) error {
	result := r.db.WithContext(ctx).Model(&domain.Post{}).
		Where("id = ?", postID).
		Updates(map[string]interface{}{
			"title":        "[Anonymized]",
			"description":  "[Anonymized]",
			"anonymizedAt": gorm.Expr("NOW()"),
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("post not found for id %d", postID)
	}

	return nil
}

// History retrieves post history for a user (M1-14-2).
func (r *PostRepoImpl) History(ctx context.Context, googleID string) (interface{}, error) {
	// TODO: Query posts by business user ID with timestamps and sorting
	var posts []domain.Post
	if err := r.db.WithContext(ctx).
		Where("authorId = ? AND isActive = ?", googleID, true).
		Order("postedAt DESC").
		Find(&posts).Error; err != nil {
		return nil, fmt.Errorf("failed to get post history: %w", err)
	}
	return posts, nil
}
