package impl

import (
	"context"
	"fmt"

	"kojan-map/business/internal/domain"

	"gorm.io/gorm"
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
func (r *StatsRepoImpl) TotalPosts(ctx context.Context, businessID int32) (int32, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&domain.Post{}).
		Where("userId = (SELECT userId FROM business WHERE businessId = ?)", businessID).
		Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count total posts: %w", err)
	}
	return int32(count), nil
}

// TotalReactions は事業者の投稿に対するリアクション総数を取得します（M3-7-2）。
func (r *StatsRepoImpl) TotalReactions(ctx context.Context, businessID int32) (int32, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Table("reaction").
		Joins("JOIN post ON post.postId = reaction.postId").
		Where("post.userId = (SELECT userId FROM business WHERE businessId = ?)", businessID).
		Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count total reactions: %w", err)
	}
	return int32(count), nil
}

// TotalViews は事業者の投稿に対する閲覧総数を取得します（M3-7-3）。
// numView フィールドの合計を計算して返します。
func (r *StatsRepoImpl) TotalViews(ctx context.Context, businessID int32) (int32, error) {
	var totalViews int64

	if err := r.db.WithContext(ctx).
		Model(&domain.Post{}).
		Where("userId = (SELECT userId FROM business WHERE businessId = ?)", businessID).
		Select("COALESCE(SUM(numView), 0)").
		Scan(&totalViews).Error; err != nil {
		return 0, fmt.Errorf("failed to sum total views: %w", err)
	}

	return int32(totalViews), nil
}

// EngagementStats は計算に必要なエンゲージメント統計を取得します。
// (投稿数、リアクション数、閲覧数) を返します。
func (r *StatsRepoImpl) EngagementStats(ctx context.Context, businessID int32) (int32, int32, int32, error) {
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
