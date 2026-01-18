package domain

import "time"

// Block はブロック情報を表すドメインモデル
type Block struct {
	ID              string `gorm:"primaryKey"`
	BlockingUserID  string // ブロックを実行した事業者のGoogleID
	BlockedGoogleID string // ブロック対象のGoogleID
	CreatedAt       time.Time
}

// TableName は対応するテーブル名を指定
func (Block) TableName() string {
	return "blocks"
}

// CreateBlockRequest はブロック登録のリクエスト
type CreateBlockRequest struct {
	BlockedGoogleID string `json:"blockedGoogleId" binding:"required"`
}

// DeleteBlockRequest はブロック解除のリクエスト
type DeleteBlockRequest struct {
	BlockedGoogleID string `json:"blockedGoogleId" binding:"required"`
}
