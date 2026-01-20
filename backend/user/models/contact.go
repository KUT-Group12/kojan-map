package models

import (
	"time"

	"gorm.io/gorm"
)

// Contact 問い合わせモデル
type Contact struct {
	ID        int32          `gorm:"column:askId;primaryKey" json:"askId"`
	Date      time.Time      `gorm:"column:date" json:"date"`
	Subject   string         `gorm:"column:subject;type:varchar(100)" json:"subject"`
	Text      string         `gorm:"column:text;type:text" json:"text"`
	AskUserID string         `gorm:"column:userId;index" json:"userId"`
	AskFlag   bool           `gorm:"column:askFlag;default:false" json:"askFlag"`
	DeletedAt gorm.DeletedAt `gorm:"column:deletedAt;index" json:"-"`
}

// TableName テーブル名を指定
func (Contact) TableName() string {
	return "asks"
}
