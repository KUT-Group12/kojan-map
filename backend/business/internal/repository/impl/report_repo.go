package impl

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"
	"kojan-map/business/internal/domain"
)

// ReportRepoImpl implements the ReportRepo interface using GORM.
type ReportRepoImpl struct {
	db *gorm.DB
}

// NewReportRepoImpl creates a new report repository.
func NewReportRepoImpl(db *gorm.DB) *ReportRepoImpl {
	return &ReportRepoImpl{db: db}
}

// Create creates a new report record (M1-12-2).
// SSOT Rules: 通報者 IDと通報対象 ID・投稿 IDの組み合わせは一意
func (r *ReportRepoImpl) Create(ctx context.Context, reporterID string, payload interface{}) error {
	req := payload.(*domain.CreateReportRequest)

	if reporterID == "" || req.ReportedGoogleID == "" {
		return fmt.Errorf("reporterID and reportedGoogleID are required")
	}

	// Parse reportedAt timestamp
	reportedAt, err := time.Parse(time.RFC3339, req.ReportedAt)
	if err != nil {
		return fmt.Errorf("invalid reportedAt format: %w", err)
	}

	// Check if duplicate report exists (same reporter, reported user, and post)
	var existingReport domain.Report
	if err := r.db.WithContext(ctx).
		Where("reporter_google_id = ? AND reported_google_id = ? AND target_post_id = ?",
			reporterID, req.ReportedGoogleID, req.TargetPostID).
		First(&existingReport).Error; err == nil {
		return fmt.Errorf("duplicate report already exists")
	}

	report := &domain.Report{
		ReporterGoogleID: reporterID,
		ReportedGoogleID: req.ReportedGoogleID,
		TargetPostID:     req.TargetPostID,
		ReportReason:     req.ReportReason,
		ReportedAt:       reportedAt,
		Status:           "pending",
	}

	if err := r.db.WithContext(ctx).Create(report).Error; err != nil {
		return fmt.Errorf("failed to create report: %w", err)
	}

	return nil
}
