package domain

import "time"

// Report は通報を表すドメインモデル
// ID: 主キー
// ReporterGoogleID: 通報した事業者のGoogleID
// ReportedGoogleID: 通報対象のGoogleID
// TargetPostID: 対象投稿ID
// ReportReason: 通報理由
// ReportedAt: 通報日時
// CreatedAt: 作成日時
// Status: ステータス（pending: 未処理、reviewed: 確認済み、dismissed: 却下）
type Report struct {
	ID               string `gorm:"primaryKey"`
	ReporterGoogleID string // 通報した事業者のGoogleID
	ReportedGoogleID string // 通報対象のGoogleID
	TargetPostID     int64
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
// reportedGoogleId: 必須。通報対象のGoogleID
// targetPostId: 必須。対象投稿ID
// reportReason: 必須。通報理由
// reportedAt: 必須。通報日時（ISO 8601形式）
type CreateReportRequest struct {
	ReportedGoogleID string `json:"reportedGoogleId" binding:"required"`
	TargetPostID     int64  `json:"targetPostId" binding:"required"`
	ReportReason     string `json:"reportReason" binding:"required"`
	ReportedAt       string `json:"reportedAt" binding:"required"` // ISO 8601形式
}
