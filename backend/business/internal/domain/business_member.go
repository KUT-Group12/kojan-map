package domain

import "time"

// BusinessMember は事業者会員を表すドメインモデル
type BusinessMember struct {
	ID            string    `gorm:"primaryKey"`
	GoogleID      string    `gorm:"uniqueIndex"`
	Email         string
	BusinessName  string
	IconImageURL  string
	RegisteredAt  time.Time
	UpdatedAt     time.Time
	AnonymizedAt  *time.Time // 匿名化日時
	IsActive      bool
	StripeCustomerID *string // Stripe顧客ID
}

// TableName は対応するテーブル名を指定
func (BusinessMember) TableName() string {
	return "business_members"
}

// CreateBusinessMemberRequest は事業者会員作成時のリクエスト
type CreateBusinessMemberRequest struct {
	GoogleID     string
	Email        string
	BusinessName string
	IconImageURL string
}

// BusinessMemberResponse は事業者会員情報のレスポンス
type BusinessMemberResponse struct {
	ID           string `json:"id"`
	GoogleID     string `json:"googleId"`
	Email        string `json:"gmail"`
	BusinessName string `json:"businessName"`
	IconImageURL string `json:"iconImageUrl"`
	RegisteredAt string `json:"registeredAt"` // ISO 8601形式
}

// UpdateBusinessNameRequest は事業者名更新のリクエスト
type UpdateBusinessNameRequest struct {
	NewBusinessName string `json:"newBusinessName" binding:"required,min=1,max=50"`
}

// UpdateBusinessIconRequest はアイコン更新のリクエスト
type UpdateBusinessIconRequest struct {
	NewBusinessIcon string `json:"newBusinessIcon" binding:"required"`
}

// AnonymizeBusinessMemberRequest は匿名化のリクエスト
type AnonymizeBusinessMemberRequest struct {
	GoogleID string `json:"googleId" binding:"required"`
}
