package models

import (
	"time"

	"gorm.io/gorm"
)

// BusinessApplication 事業者申請モデル
type BusinessApplication struct {
	ID               int            `gorm:"primaryKey" json:"businessId"`
	BusinessName     string         `gorm:"type:varchar(50)" json:"businessName"`
	KanaBusinessName string         `gorm:"type:varchar(50)" json:"kanaBusinessName"`
	ZipCode          int            `json:"zipCode"`
	Address          string         `gorm:"type:varchar(100)" json:"address"`
	Phone            int            `json:"phone"`
	RegistDate       time.Time      `json:"registDate"`
	ProfileImage     []byte         `gorm:"type:blob" json:"profileImage"`
	UserID           string         `gorm:"index" json:"userId"`
	PlaceID          int            `gorm:"index" json:"placeId"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName テーブル名を指定
func (BusinessApplication) TableName() string {
	return "business_applications"
}
