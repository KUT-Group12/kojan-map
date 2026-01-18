package impl

import (
	"context"
	"fmt"

	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/errors"
)

// BlockServiceImpl はBlockServiceインターフェースを実装します。
type BlockServiceImpl struct {
	blockRepo repository.BlockRepo
}

// NewBlockServiceImpl は新しいブロックサービスを作成します。
func NewBlockServiceImpl(blockRepo repository.BlockRepo) *BlockServiceImpl {
	return &BlockServiceImpl{
		blockRepo: blockRepo,
	}
}

// Block はユーザーをブロックします（M1-9-2）。
// ブロック者とブロック対象は異なるユーザー、重複ブロック防止
func (s *BlockServiceImpl) Block(ctx context.Context, blockerID, blockedID string) error {
	if blockerID == "" || blockedID == "" {
		return errors.NewAPIError(errors.ErrInvalidInput, "blockerID and blockedID are required")
	}

	if blockerID == blockedID {
		return errors.NewAPIError(errors.ErrValidationFailed, "cannot block yourself")
	}

	err := s.blockRepo.Create(ctx, blockerID, blockedID)
	if err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to block user: %v", err))
	}

	return nil
}

// Unblock はブロックを解除します（M1-10-2）。
func (s *BlockServiceImpl) Unblock(ctx context.Context, blockerID, blockedID string) error {
	if blockerID == "" || blockedID == "" {
		return errors.NewAPIError(errors.ErrInvalidInput, "blockerID and blockedID are required")
	}

	err := s.blockRepo.Delete(ctx, blockerID, blockedID)
	if err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to unblock user: %v", err))
	}

	return nil
}

// ReportServiceImpl はReportServiceインターフェースを実装します。
type ReportServiceImpl struct {
	reportRepo repository.ReportRepo
}

// NewReportServiceImpl は新しい通報サービスを作成します。
func NewReportServiceImpl(reportRepo repository.ReportRepo) *ReportServiceImpl {
	return &ReportServiceImpl{
		reportRepo: reportRepo,
	}
}

// CreateReport は新しい通報を作成します（M1-12-2）。
// 通報内容は必須フィールド全て埋める必要がある
func (s *ReportServiceImpl) CreateReport(ctx context.Context, reporterID string, payload interface{}) error {
	if reporterID == "" {
		return errors.NewAPIError(errors.ErrInvalidInput, "reporterID is required")
	}

	err := s.reportRepo.Create(ctx, reporterID, payload)
	if err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to create report: %v", err))
	}

	return nil
}
