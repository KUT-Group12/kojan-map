package models

import (
	"time"

	"gorm.io/gorm"
)

// Report 通報情報モデル
type Report struct {
	ID         int            `gorm:"primaryKey" json:"id"`
	UserID     string         `json:"userId"`
	PostID     int            `json:"postId"`
	Reason     string         `json:"reason"`
	ReportDate time.Time      `json:"data"`
	Status     string         `gorm:"default:pending" json:"status"` // pending, reviewed, resolved
	CreatedAt  time.Time      `json:"createdAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName テーブル名を指定
func (Report) TableName() string {
	return "reports"
}
