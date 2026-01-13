package models

import (
	"time"

	"gorm.io/gorm"
)

// BusinessApplication 事業者申請モデル
type BusinessApplication struct {
	ID           int       `gorm:"primaryKey" json:"id"`
	UserID       string    `json:"userId"`
	BusinessName string    `json:"businessName"`
	Address      string    `json:"address"`
	Phone        string    `json:"phone"`
	Status       string    `gorm:"default:pending" json:"status"` // pending, approved, rejected
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName テーブル名を指定
func (BusinessApplication) TableName() string {
	return "business_applications"
}
