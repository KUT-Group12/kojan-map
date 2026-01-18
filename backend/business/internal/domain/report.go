package domain

import "time"

// Report は通報を表すドメインモデル
type Report struct {
	ID               string `gorm:"primaryKey"`
	ReporterGoogleID string // 通報した事業者のGoogleID
	ReportedGoogleID string // 通報対象のGoogleID
	TargetPostID     string
	ReportReason     string
	ReportedAt       time.Time
	CreatedAt        time.Time
	Status           string // pending, reviewed, dismissed
}

// TableName は対応するテーブル名を指定
func (Report) TableName() string {
	return "reports"
}

// CreateReportRequest は通報登録のリクエスト
type CreateReportRequest struct {
	ReportedGoogleID string `json:"reportedGoogleId" binding:"required"`
	TargetPostID     string `json:"targetPostId" binding:"required"`
	ReportReason     string `json:"reportReason" binding:"required"`
	ReportedAt       string `json:"reportedAt" binding:"required"` // ISO 8601形式
}
