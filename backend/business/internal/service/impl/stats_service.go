package impl

import (
	"context"
	"fmt"

	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/errors"
)

// StatsServiceImpl はStatsServiceインターフェースを実装します。
type StatsServiceImpl struct {
	statsRepo repository.StatsRepo
}

// NewStatsServiceImpl は新しい統計サービスを作成します。
func NewStatsServiceImpl(statsRepo repository.StatsRepo) *StatsServiceImpl {
	return &StatsServiceImpl{
		statsRepo: statsRepo,
	}
}

// GetTotalPosts は投稿の総数を取得します（M3-7-1）。
// 掲載投稿数は投稿テーブルのレコード数
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

// GetTotalReactions はリアクションの総数を取得します（M3-7-2）。
// リアクション数は同一ユーザーが同一投稿に複数回リアクションできないため COUNT(DISTINCT reaction)
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

// GetTotalViews は閲覧数の総数を取得します（M3-7-3）。
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

// GetEngagementRate はエンゲージメント率を計算します（M3-7-4）。
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
