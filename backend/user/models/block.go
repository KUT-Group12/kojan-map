package models

import (
	"time"

	"gorm.io/gorm"
)

// UserBlock ユーザーブロック情報
type UserBlock struct {
	BlockId   int32          `gorm:"column:blockId;primaryKey" json:"blockId"`
	BlockerId string         `gorm:"column:blockerId;index" json:"blockerId"`
	BlockedId string         `gorm:"column:blockedId;index" json:"blockedId"`
	CreatedAt time.Time      `gorm:"column:createdAt" json:"createdAt"`
	DeletedAt gorm.DeletedAt `gorm:"column:deletedAt;index" json:"-"`
}

// TableName テーブル名を指定
func (UserBlock) TableName() string {
	return "user_blocks"
}
