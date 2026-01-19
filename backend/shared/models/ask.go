package models

import (
	"time"
)

// Ask represents the 問い合わせ情報 table
type Ask struct {
	AskID   int       `gorm:"column:askId;primaryKey;autoIncrement" json:"askId"`
	Date    time.Time `gorm:"column:date;not null" json:"date"`
	Subject string    `gorm:"column:subject;not null;size:100" json:"subject"`
	Text    string    `gorm:"column:text;not null;type:text" json:"text"`
	UserID  string    `gorm:"column:userId;not null;size:50" json:"userId"`
	AskFlag bool      `gorm:"column:askFlag;not null;default:false" json:"askFlag"`
}

// TableName specifies the table name for Ask
func (Ask) TableName() string {
	return "asks"
}
