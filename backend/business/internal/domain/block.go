package domain

import (
	"time"
)

// Block はブロック情報を表すドメインモデル
// ID: 主キー
// BlockingUserID: ブロックを実行した事業者のGoogleID
// BlockedUserID: ブロック対象のGoogleID
// CreatedAt: 作成日時
type Block struct {
	ID        int64     `gorm:"primaryKey;autoIncrement;column:blockId"`
	BlockerID string    `gorm:"column:blockerId;type:varchar(50);not null"`
	BlockedID string    `gorm:"column:blockedId;type:varchar(50);not null"`
	CreatedAt time.Time `gorm:"column:createdAt"` // SQLダンプにないが一旦残す
}

// TableName は対応するテーブル名を指定
func (Block) TableName() string {
	return "block"
}

// CreateBlockRequest はブロック登録のリクエスト
// BlockedUserID: 必須。ブロック対象のGoogleID
type CreateBlockRequest struct {
	BlockedUserID string `json:"blockedUserID" binding:"required"`
}

// DeleteBlockRequest はブロック解除のリクエスト
// BlockedUserID: 必須。ブロック解除対象のGoogleID
type DeleteBlockRequest struct {
	BlockedUserID string `json:"blockedUserID" binding:"required"`
}
