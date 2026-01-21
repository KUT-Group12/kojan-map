package impl

import (
	"context"
	"errors"
	"fmt"
	"time"

	"kojan-map/business/internal/domain"

	"gorm.io/gorm"
)

// ReportRepoImpl は GORM を使用して ReportRepo インターフェースを実装します。
type ReportRepoImpl struct {
	db *gorm.DB
}

// NewReportRepoImpl は新しい通報リポジトリを作成します。
func NewReportRepoImpl(db *gorm.DB) *ReportRepoImpl {
	return &ReportRepoImpl{db: db}
}

// Create は新しい通報レコードを作成します（M1-12-2）。
// 通報者 ID と通報対象 ID・投稿 ID の組み合わせは一意
func (r *ReportRepoImpl) Create(ctx context.Context, reporterID string, payload interface{}) error {
	req, ok := payload.(*domain.CreateReportRequest)
	if !ok {
		return fmt.Errorf("invalid payload type: expected *domain.CreateReportRequest")
	}

	if reporterID == "" || req.ReportedGoogleID == "" {
		return fmt.Errorf("reporterID and reportedGoogleID are required")
	}

	// reportedAt タイムスタンプを解析します
	reportedAt, err := time.Parse(time.RFC3339, req.ReportedAt)
	if err != nil {
		return fmt.Errorf("invalid reportedAt format: %w", err)
	}

	// 重複する通報が存在するかを確認します（同じ通報者、通報対象ユーザー、投稿）
	var existingReport domain.Report
	err = r.db.WithContext(ctx).
		Where("userId = ? AND postId = ?", reporterID, req.TargetPostID).
		First(&existingReport).Error
	if err == nil {
		return fmt.Errorf("duplicate report already exists")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return fmt.Errorf("failed to check existing report: %w", err)
	}

	report := &domain.Report{
		UserID:     reporterID,
		PostID:     int32(req.TargetPostID),
		Reason:     req.ReportReason,
		Date:       reportedAt,
		ReportFlag: 0,
		RemoveFlag: 0,
	}

	if err := r.db.WithContext(ctx).Create(report).Error; err != nil {
		return fmt.Errorf("failed to create report: %w", err)
	}

	return nil
}
