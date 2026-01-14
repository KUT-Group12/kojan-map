package models

import (
	"gorm.io/gorm"
)

// UserBlock ユーザーブロック情報
type UserBlock struct {
	ID        int            `gorm:"primaryKey" json:"blockId"`
	BlockerID string         `gorm:"index" json:"blockerId"`
	BlockedID string         `gorm:"index" json:"blockedId"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName テーブル名を指定
func (UserBlock) TableName() string {
	return "user_blocks"
}
