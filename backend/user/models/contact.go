package models

import (
	"time"

	"gorm.io/gorm"
)

// Contact 問い合わせモデル
type Contact struct {
	ID        int            `gorm:"primaryKey" json:"askId"`
	Date      time.Time      `json:"date"`
	Subject   string         `gorm:"type:varchar(100)" json:"subject"`
	Text      string         `gorm:"type:text" json:"text"`
	AskUserID string         `gorm:"index" json:"askUserId"`
	AskFlag   bool           `gorm:"default:false" json:"askFlag"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName テーブル名を指定
func (Contact) TableName() string {
	return "contacts"
}
