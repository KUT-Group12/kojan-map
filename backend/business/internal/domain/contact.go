package domain

import "time"

// Contact は問い合わせを表すドメインモデル
type Contact struct {
	ID        string `gorm:"primaryKey"`
	GoogleID  string
	Subject   string
	Message   string
	CreatedAt time.Time
	Status    string // new, in_progress, resolved
}

// TableName は対応するテーブル名を指定
func (Contact) TableName() string {
	return "contacts"
}

// CreateContactRequest は問い合わせ送信のリクエスト
type CreateContactRequest struct {
	Subject string `json:"subject" binding:"required"`
	Message string `json:"message" binding:"required"`
}
