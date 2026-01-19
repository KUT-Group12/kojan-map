package models

import (
	"time"

	"gorm.io/gorm"
)

// BusinessApplication 事業者申請モデル
type BusinessApplication struct {
	ID               int            `gorm:"column:businessId;primaryKey;autoIncrement" json:"businessId"`
	BusinessName     string         `gorm:"column:businessName;type:varchar(50)" json:"businessName"`
	KanaBusinessName string         `gorm:"column:kanaBusinessName;type:varchar(50)" json:"kanaBusinessName"`
	ZipCode          int            `gorm:"column:zipCode" json:"zipCode"`
	Address          string         `gorm:"column:address;type:varchar(100)" json:"address"`
	Phone            string         `gorm:"column:phone;type:varchar(20)" json:"phone"`
	RegistDate       time.Time      `gorm:"column:registDate" json:"registDate"`
	ProfileImage     []byte         `gorm:"column:profileImage;type:blob" json:"profileImage"`
	UserID           string         `gorm:"column:userId;index" json:"userId"`
	PlaceID          int            `gorm:"column:placeId;index" json:"placeId"`
	DeletedAt        gorm.DeletedAt `gorm:"column:deletedAt;index" json:"-"`
}

// TableName テーブル名を指定
func (BusinessApplication) TableName() string {
	return "business_applications"
}
