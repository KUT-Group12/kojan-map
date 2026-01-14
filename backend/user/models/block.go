package models

import (
	"time"

	"gorm.io/gorm"
)

// UserBlock ユーザーブロック情報
type UserBlock struct {
	ID        int            `gorm:"primaryKey" json:"id"`
	UserID    string         `gorm:"index" json:"userId"`
	BlockerID string         `gorm:"index" json:"blockerId"`
	CreatedAt time.Time      `json:"createdAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName テーブル名を指定
func (UserBlock) TableName() string {
	return "user_blocks"
}
