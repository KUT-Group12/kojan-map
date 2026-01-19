package domain

import "time"

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
