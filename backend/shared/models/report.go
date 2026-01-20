package models

import (
	"time"
)

// Report represents the 通報情報 table
type Report struct {
	ReportID   int32     `gorm:"column:reportId;primaryKey;autoIncrement" json:"reportId"`
	UserID     string    `gorm:"column:userId;not null;size:50" json:"reporterGoogleId"`
	PostID     int32     `gorm:"column:postId;not null" json:"targetPostId"`
	Reason     string    `gorm:"column:reason;not null;type:text" json:"reason"`
	Date       time.Time `gorm:"column:date;not null" json:"reportedAt"`
	ReportFlag bool      `gorm:"column:reportFlag;not null;default:false" json:"handled"`
	RemoveFlag bool      `gorm:"column:removeFlag;not null;default:false" json:"deleted"`
}

// TableName specifies the table name for Report
func (Report) TableName() string {
	return "reports"
}
