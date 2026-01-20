package domain

import (
	"time"
)

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
	ID         int       `gorm:"primaryKey;autoIncrement;column:reportId"`
	UserID     string    `gorm:"column:userId;type:varchar(50);not null"`
	PostID     int       `gorm:"column:postId;not null"`
	Reason     string    `gorm:"column:reason;type:text;not null"`
	Date       time.Time `gorm:"column:date;not null"`
	ReportFlag int       `gorm:"column:reportFlag;not null"`
	RemoveFlag int       `gorm:"column:removeFlag;not null"`
}

// TableName は対応するテーブル名を指定
func (Report) TableName() string {
	return "report"
}

// CreateReportRequest は通報登録のリクエスト
// reportedGoogleId: 必須。通報対象のGoogleID
// targetPostId: 必須。対象投稿ID
// reportReason: 必須。通報理由
// reportedAt: 必須。通報日時（ISO 8601形式）
type CreateReportRequest struct {
	ReportedGoogleID string `json:"reportedGoogleId" binding:"required"`
	TargetPostID     int    `json:"targetPostId" binding:"required"`
	ReportReason     string `json:"reportReason" binding:"required"`
	ReportedAt       string `json:"reportedAt" binding:"required"` // ISO 8601形式
}
