package models

import (
	"time"
)

// Contact 問い合わせモデル
type Contact struct {
	ID        int32     `gorm:"column:askId;primaryKey" json:"askId"`
	Date      time.Time `gorm:"column:date;not null" json:"date"`
	Subject   string    `gorm:"column:subject;type:varchar(100);not null" json:"subject"`
	Text      string    `gorm:"column:text;type:text;not null" json:"text"`
	AskUserID string    `gorm:"column:userId;type:varchar(50);not null;index" json:"userId"`
	AskFlag   bool      `gorm:"column:askFlag;not null;default:false" json:"askFlag"`
}

// TableName テーブル名を指定
func (Contact) TableName() string {
	return "ask"
}
