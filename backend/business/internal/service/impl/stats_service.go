package impl

import (
	"context"
	"fmt"

	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/errors"
)

// StatsServiceImpl implements the StatsService interface.
type StatsServiceImpl struct {
	statsRepo repository.StatsRepo
}

// NewStatsServiceImpl creates a new stats service.
func NewStatsServiceImpl(statsRepo repository.StatsRepo) *StatsServiceImpl {
	return &StatsServiceImpl{
		statsRepo: statsRepo,
	}
}

// GetTotalPosts retrieves the total number of posts (M3-7-1).
// SSOT Rules: 掲載投稿数は投稿テーブルのレコード数
func (s *StatsServiceImpl) GetTotalPosts(ctx context.Context, businessID int64) (interface{}, error) {
	if businessID <= 0 {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "businessId must be greater than 0")
	}

	count, err := s.statsRepo.TotalPosts(ctx, businessID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to get total posts: %v", err))
	}

	return &domain.StatsResponse{
		Total: count,
		Label: "Total Posts",
	}, nil
}

// GetTotalReactions retrieves the total number of reactions (M3-7-2).
// SSOT Rules: リアクション数は同一ユーザーが同一投稿に複数回リアクションできないため COUNT(DISTINCT reaction)
func (s *StatsServiceImpl) GetTotalReactions(ctx context.Context, businessID int64) (interface{}, error) {
	if businessID <= 0 {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "businessId must be greater than 0")
	}

	count, err := s.statsRepo.TotalReactions(ctx, businessID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to get total reactions: %v", err))
	}

	return &domain.StatsResponse{
		Total: count,
		Label: "Total Reactions",
	}, nil
}

// GetTotalViews retrieves the total number of views (M3-7-3).
// SSOT Rules: 表示回数は各投稿のビューカウントの合計
func (s *StatsServiceImpl) GetTotalViews(ctx context.Context, businessID int64) (interface{}, error) {
	if businessID <= 0 {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "businessId must be greater than 0")
	}

	count, err := s.statsRepo.TotalViews(ctx, businessID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to get total views: %v", err))
	}

	return &domain.StatsResponse{
		Total: count,
		Label: "Total Views",
	}, nil
}

// GetEngagementRate calculates the engagement rate (M3-7-4).
// SSOT Rules: エンゲージメント率 = (リアクション数 + ビュー数) / (投稿数 * 100)
func (s *StatsServiceImpl) GetEngagementRate(ctx context.Context, businessID int64) (interface{}, error) {
	if businessID <= 0 {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "businessId must be greater than 0")
	}

	postCount, reactionCount, viewCount, err := s.statsRepo.EngagementStats(ctx, businessID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to calculate engagement rate: %v", err))
	}

	var engagementRate float64
	if postCount == 0 {
		engagementRate = 0.0
	} else {
		engagementRate = float64(reactionCount+viewCount) / float64(postCount*100)
	}

	return &domain.EngagementResponse{
		PostCount:      postCount,
		ReactionCount:  reactionCount,
		ViewCount:      viewCount,
		EngagementRate: engagementRate,
	}, nil
}
