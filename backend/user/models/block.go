package models

import (
	"gorm.io/gorm"
)

// UserBlock ユーザーブロック情報
type UserBlock struct {
	ID        int            `gorm:"column:blockId;primaryKey" json:"blockId"`
	BlockerID string         `gorm:"column:blockerId;index" json:"blockerId"`
	BlockedID string         `gorm:"column:blockedId;index" json:"blockedId"`
	DeletedAt gorm.DeletedAt `gorm:"column:deletedAt;index" json:"-"`
}

// TableName テーブル名を指定
func (UserBlock) TableName() string {
	return "blocks"
}
