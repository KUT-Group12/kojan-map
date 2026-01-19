package models

import (
	"time"
)

// BusinessMember represents the 事業者会員情報 table
type BusinessMember struct {
	BusinessID       int       `gorm:"column:businessId;primaryKey;autoIncrement" json:"businessId"`
	BusinessName     string    `gorm:"column:businessName;not null;size:50" json:"businessName"`
	KanaBusinessName string    `gorm:"column:kanaBusinessName;not null;size:50" json:"kanaBusinessName"`
	ZipCode          int       `gorm:"column:zipCode;not null" json:"zipCode"`
	Address          string    `gorm:"column:address;not null;size:100" json:"address"`
	Phone            int       `gorm:"column:phone;not null" json:"phone"`
	RegistDate       time.Time `gorm:"column:registDate;not null" json:"registDate"`
	ProfileImage     []byte    `gorm:"column:profileImage;type:blob" json:"-"`
	UserID           string    `gorm:"column:userId;not null;size:50" json:"userId"`
	PlaceID          int       `gorm:"column:placeId;not null" json:"placeId"`
}

// TableName specifies the table name for BusinessMember
func (BusinessMember) TableName() string {
	return "business_members"
}
