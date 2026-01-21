package models

import (
	"time"
)

// BusinessMember represents the 事業者会員情報 table
type BusinessMember struct {
	BusinessID       int32     `gorm:"column:businessId;primaryKey;autoIncrement" json:"businessId"`
	BusinessName     string    `gorm:"column:businessName;not null;size:50" json:"businessName"`
	KanaBusinessName string    `gorm:"column:kanaBusinessName;not null;size:50" json:"kanaBusinessName"`
	ZipCode          string    `gorm:"column:zipCode;not null;size:8" json:"zipCode"`
	Address          string    `gorm:"column:address;not null;size:100" json:"address"`
	Phone            string    `gorm:"column:phone;not null;size:20" json:"phone"`
	RegistDate       time.Time `gorm:"column:registDate;not null" json:"registDate"`
	ProfileImage     []byte    `gorm:"column:profileImage;type:blob" json:"-"`
	UserID           string    `gorm:"column:userId;not null;size:50" json:"userId"`
	PlaceID          *int32    `gorm:"column:placeId" json:"placeId,omitempty"`
}

// TableName specifies the table name for BusinessMember
func (BusinessMember) TableName() string {
	return "business_members"
}
