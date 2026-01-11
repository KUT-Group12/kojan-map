package domain

import "time"

// BusinessMember は事業者会員を表すドメインモデル
type BusinessMember struct {
	ID               int64     `gorm:"primaryKey;autoIncrement;column:id"`
	BusinessName     string    `gorm:"column:businessName;type:varchar(50);not null"`
	KanaBusinessName string    `gorm:"column:kanaBusinessName;type:varchar(50);not null"`
	ZipCode          int       `gorm:"column:zipCode;not null"`
	Address          string    `gorm:"column:address;type:varchar(100);not null"`
	Phone            int       `gorm:"column:phone;not null"`
	RegistDate       time.Time `gorm:"column:registDate;not null"`
	ProfileImage     []byte    `gorm:"column:profileImage;type:blob"`
	UserID           string    `gorm:"column:userId;type:varchar(50);index;not null"`
	PlaceID          int64     `gorm:"column:placeId;not null"`
	AnonymizedAt     *time.Time
	IsActive         bool
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// TableName は対応するテーブル名を指定
func (BusinessMember) TableName() string {
	return "business"
}

// CreateBusinessMemberRequest は事業者会員作成時のリクエスト
type CreateBusinessMemberRequest struct {
	BusinessName     string `json:"businessName" binding:"required,max=50"`
	KanaBusinessName string `json:"kanaBusinessName" binding:"required,max=50"`
	ZipCode          int    `json:"zipCode" binding:"required"`
	Address          string `json:"address" binding:"required,max=100"`
	Phone            int    `json:"phone" binding:"required"`
	UserID           string `json:"userId" binding:"required"`
	PlaceID          int64  `json:"placeId" binding:"required"`
}

// BusinessMemberResponse は事業者会員情報のレスポンス
type BusinessMemberResponse struct {
	ID           int64  `json:"id"`
	BusinessName string `json:"businessName"`
	Gmail        string `json:"gmail"`
	RegistDate   string `json:"registeredAt"` // ISO 8601形式
	IconImageURL string `json:"iconImageUrl"`
}

// UpdateBusinessNameRequest は事業者名更新のリクエスト
type UpdateBusinessNameRequest struct {
	NewBusinessName string `json:"newBusinessName" binding:"required,min=1,max=50"`
}

// UpdateBusinessIconRequest はアイコン更新のリクエスト
type UpdateBusinessIconRequest struct {
	NewBusinessIcon []byte `json:"newBusinessIcon" binding:"required"`
}

// AnonymizeBusinessMemberRequest は匿名化のリクエスト
type AnonymizeBusinessMemberRequest struct {
	GoogleID string `json:"googleId" binding:"required"`
}
