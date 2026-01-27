package models

import "time"

// BusinessRequest 事業者申請モデル
type BusinessRequest struct {
	ID      int32  `gorm:"column:requestId;primaryKey;autoIncrement" json:"requestId"`
	Name    string `gorm:"column:name;type:varchar(50);not null" json:"name"`
	Address string `gorm:"column:address;type:varchar(100);not null" json:"address"`
	Phone   string `gorm:"column:phone;type:varchar(15)" json:"phone"`
	UserID  string `gorm:"column:userId;type:varchar(50);not null;index" json:"userId"`
}

func (BusinessRequest) TableName() string {
	return "businessReq"
}

// Business 事業者モデル (承認済み)
type Business struct {
	BusinessID       int32     `gorm:"column:businessId;primaryKey;autoIncrement" json:"businessId"`
	BusinessName     string    `gorm:"column:businessName;type:varchar(50);not null" json:"businessName"`
	KanaBusinessName string    `gorm:"column:kanaBusinessName;type:varchar(50);not null" json:"kanaBusinessName"`
	ZipCode          string    `gorm:"column:zipCode;type:varchar(7)" json:"zipCode"`
	Address          string    `gorm:"column:address;type:varchar(100);not null" json:"address"`
	Phone            string    `gorm:"column:phone;type:varchar(15)" json:"phone"`
	RegistDate       time.Time `gorm:"column:registDate;not null" json:"registDate"`
	ProfileImage     string    `gorm:"column:profileImage;type:blob" json:"profileImage"`
	UserID           string    `gorm:"column:userId;type:varchar(50);not null;index" json:"userId"`
	PlaceID          int32     `gorm:"column:placeId;not null" json:"placeId"`
}

func (Business) TableName() string {
	return "business"
}
