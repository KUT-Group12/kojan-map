package models

import (
	"time"

	"gorm.io/gorm"
)

// Report 通報情報モデル
type Report struct {
	ID         int            `gorm:"primaryKey" json:"reportId"`
	UserID     string         `json:"userId"`
	PostID     int            `json:"postId"`
	Reason     string         `gorm:"type:text" json:"reason"`
	Date       time.Time      `json:"date"`
	ReportFlag bool           `gorm:"default:false" json:"reportFlag"`
	RemoveFlag bool           `gorm:"default:false" json:"removeFlag"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName テーブル名を指定
func (Report) TableName() string {
	return "reports"
}
