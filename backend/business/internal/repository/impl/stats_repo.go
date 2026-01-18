package impl

import (
	"context"
	"fmt"

	"gorm.io/gorm"
	"kojan-map/business/internal/domain"
)

// StatsRepoImpl implements the StatsRepo interface using GORM.
type StatsRepoImpl struct {
	db *gorm.DB
}

// NewStatsRepoImpl creates a new stats repository.
func NewStatsRepoImpl(db *gorm.DB) *StatsRepoImpl {
	return &StatsRepoImpl{db: db}
}

// TotalPosts retrieves the total number of posts for a business (M3-7-1).
func (r *StatsRepoImpl) TotalPosts(ctx context.Context, businessID int64) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&domain.Post{}).
		Where("author_id = ?", businessID).
		Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count total posts: %w", err)
	}
	return count, nil
}

// TotalReactions retrieves the total number of reactions on posts for a business (M3-7-2).
func (r *StatsRepoImpl) TotalReactions(ctx context.Context, businessID int64) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Table("reaction").
		Joins("JOIN posts ON posts.id = reaction.post_id").
		Where("posts.author_id = ?", businessID).
		Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count total reactions: %w", err)
	}
	return count, nil
}

// TotalViews retrieves the total number of views on posts for a business (M3-7-3).
// TODO: Implement view counting mechanism (needs view table or post.viewCount field)
func (r *StatsRepoImpl) TotalViews(ctx context.Context, businessID int64) (int64, error) {
	var totalViews int64

	// Assumes posts table has a view_count field
	if err := r.db.WithContext(ctx).
		Model(&domain.Post{}).
		Where("author_id = ?", businessID).
		Select("COALESCE(SUM(view_count), 0)").
		Row().
		Scan(&totalViews).Error; err != nil {
		return 0, fmt.Errorf("failed to sum total views: %w", err)
	}

	return totalViews, nil
}

// EngagementStats retrieves engagement stats needed for calculation.
// Returns (postCount, reactionCount, viewCount).
func (r *StatsRepoImpl) EngagementStats(ctx context.Context, businessID int64) (int64, int64, int64, error) {
	postCount, err := r.TotalPosts(ctx, businessID)
	if err != nil {
		return 0, 0, 0, err
	}

	reactionCount, err := r.TotalReactions(ctx, businessID)
	if err != nil {
		return 0, 0, 0, err
	}

	viewCount, err := r.TotalViews(ctx, businessID)
	if err != nil {
		return 0, 0, 0, err
	}

	return postCount, reactionCount, viewCount, nil
}
