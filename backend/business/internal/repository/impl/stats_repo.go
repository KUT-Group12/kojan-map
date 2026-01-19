package impl

import (
	"context"
	"fmt"

	"gorm.io/gorm"
	"kojan-map/business/internal/domain"
)

// StatsRepoImpl は GORM を使用して StatsRepo インターフェースを実装します。
type StatsRepoImpl struct {
	db *gorm.DB
}

// NewStatsRepoImpl は新しい統計リポジトリを作成します。
func NewStatsRepoImpl(db *gorm.DB) *StatsRepoImpl {
	return &StatsRepoImpl{db: db}
}

// TotalPosts は事業者の投稿総数を取得します（M3-7-1）。
func (r *StatsRepoImpl) TotalPosts(ctx context.Context, businessID int64) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&domain.Post{}).
		Where("author_id = ?", businessID).
		Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count total posts: %w", err)
	}
	return count, nil
}

// TotalReactions は事業者の投稿に対するリアクション総数を取得します（M3-7-2）。
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

// TotalViews は事業者の投稿に対する閲覧総数を取得します（M3-7-3）。
// view_count フィールドの合計を計算して返します。
func (r *StatsRepoImpl) TotalViews(ctx context.Context, businessID int64) (int64, error) {
	var totalViews int64

	if err := r.db.WithContext(ctx).
		Model(&domain.Post{}).
		Where("author_id = ?", businessID).
		Select("COALESCE(SUM(view_count), 0)").
		Scan(&totalViews).Error; err != nil {
		return 0, fmt.Errorf("failed to sum total views: %w", err)
	}

	return totalViews, nil
}

// EngagementStats は計算に必要なエンゲージメント統計を取得します。
// (投稿数、リアクション数、閲覧数) を返します。
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
