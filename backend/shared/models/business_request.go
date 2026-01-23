package models

import (
	"time"
)

// BusinessRequest represents the 事業者申請情報 table
type BusinessRequest struct {
	RequestID int32  `gorm:"column:requestId;primaryKey;autoIncrement" json:"requestId"`
	Name      string `gorm:"column:name;not null;size:50" json:"businessName"`
	Address   string `gorm:"column:address;not null;size:100" json:"address"`
	Phone     string `gorm:"column:phone;not null;size:20" json:"phone"`
	UserID    string `gorm:"column:userId;not null;size:50" json:"userId"`
	Status    string `gorm:"column:status;not null;default:'pending'" json:"status"`
	// CreatedAtはDBにありませんでした
	CreatedAt time.Time `gorm:"column:createdAt;autoCreateTime" json:"createdAt"`
}

// TableName specifies the table name for BusinessRequest
func (BusinessRequest) TableName() string {
	return "businessReq"
}
