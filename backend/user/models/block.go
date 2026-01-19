package models

import (
	"gorm.io/gorm"
)

// UserBlock ユーザーブロック情報
type UserBlock struct {
	BlockId   int            `gorm:"column:blockId;primaryKey" json:"blockId"`
	BlockerId string         `gorm:"column:blockerId;index" json:"blockerId"`
	BlockedId string         `gorm:"column:blockedId;index" json:"blockedId"`
	DeletedAt gorm.DeletedAt `gorm:"column:deletedAt;index" json:"-"`
}

// TableName テーブル名を指定
func (UserBlock) TableName() string {
	return "user_blocks"
}
