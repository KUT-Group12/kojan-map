package models

import (
	"time"

	"gorm.io/gorm"
)

// Contact 問い合わせモデル
type Contact struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	UserID    string    `json:"userId"`
	Subject   string    `json:"subject"`
	Text      string    `gorm:"type:longtext" json:"text"`
	Status    string    `gorm:"default:pending" json:"status"` // pending, replied
	CreatedAt time.Time `json:"createdAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName テーブル名を指定
func (Contact) TableName() string {
	return "contacts"
}
