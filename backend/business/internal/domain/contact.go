package domain

import "time"

// Contact は問い合わせを表すドメインモデル
// ID: 主キー
// GoogleID: 問い合わせユーザーのGoogleID
// Subject: 件名
// Message: メッセージ本文
// CreatedAt: 作成日時
// Status: ステータス（new: 新規、resolved: 解決済み）
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
// subject: 必須。問い合わせの件名
// message: 必須。問い合わせのメッセージ本文
type CreateContactRequest struct {
	Subject string `json:"subject" binding:"required"`
	Message string `json:"message" binding:"required"`
}
