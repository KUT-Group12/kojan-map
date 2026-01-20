package models

import (
	"time"

	"gorm.io/gorm"
)

// Report 通報情報モデル
type Report struct {
	ID         int32          `gorm:"column:reportId;primaryKey" json:"reportId"`
	UserID     string         `gorm:"column:userId;index" json:"userId"`
	PostID     int32          `gorm:"column:postId;index" json:"postId"`
	Reason     string         `gorm:"column:reason;type:text" json:"reason"`
	Date       time.Time      `gorm:"column:date" json:"date"`
	ReportFlag bool           `gorm:"column:reportFlag;default:false" json:"reportFlag"`
	RemoveFlag bool           `gorm:"column:removeFlag;default:false" json:"removeFlag"`
	DeletedAt  gorm.DeletedAt `gorm:"column:deletedAt;index" json:"-"`
}

// TableName テーブル名を指定
func (Report) TableName() string {
	return "reports"
}
