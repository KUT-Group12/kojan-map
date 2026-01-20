package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Block はブロック情報を表すドメインモデル
// ID: 主キー
// BlockingUserID: ブロックを実行した事業者のGoogleID
// BlockedGoogleID: ブロック対象のGoogleID
// CreatedAt: 作成日時
type Block struct {
	ID              string `gorm:"primaryKey"`
	BlockingUserID  string `gorm:"uniqueIndex:idx_block_pair"` // ブロックを実行した事業者のGoogleID
	BlockedGoogleID string `gorm:"uniqueIndex:idx_block_pair"` // ブロック対象のGoogleID
	CreatedAt       time.Time
}

// TableName は対応するテーブル名を指定
func (Block) TableName() string {
	return "blocks"
}

// BeforeCreate はレコード作成前にIDを生成します
func (b *Block) BeforeCreate(tx *gorm.DB) error {
	if b.ID == "" {
		b.ID = uuid.New().String()
	}
	return nil
}

// CreateBlockRequest はブロック登録のリクエスト
// blockedGoogleId: 必須。ブロック対象のGoogleID
type CreateBlockRequest struct {
	BlockedGoogleID string `json:"blockedGoogleId" binding:"required"`
}

// DeleteBlockRequest はブロック解除のリクエスト
// blockedGoogleId: 必須。ブロック解除対象のGoogleID
type DeleteBlockRequest struct {
	BlockedGoogleID string `json:"blockedGoogleId" binding:"required"`
}
