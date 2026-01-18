package domain

import "time"

// BusinessMember は事業者会員を表すドメインモデル
// ID: 主キー、自動インクリメント
// BusinessName: 事業者名（最大50文字、必須）
// KanaBusinessName: 事業者名カナ（最大50文字、必須）
// ZipCode: 郵便番号（必須）
// Address: 住所（最大100文字、必須）
// Phone: 電話番号（必須）
// RegistDate: 登録日（必須）
// ProfileImage: プロフィール画像（BLOB型）
// UserID: ユーザーID（インデックス付き、必須）
// PlaceID: 場所ID（必須）
// AnonymizedAt: 匿名化日時（NULL可）
// IsActive: アクティブ状態フラグ
// CreatedAt: 作成日時
// UpdatedAt: 更新日時
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
// businessName: 必須。事業者名（最大50文字）
// kanaBusinessName: 必須。事業者名カナ（最大50文字）
// zipCode: 必須。郵便番号
// address: 必須。住所（最大100文字）
// phone: 必須。電話番号
// userId: 必須。ユーザーID
// placeId: 必須。場所ID
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
// id: 事業者ID
// businessName: 事業者名
// gmail: メールアドレス
// registeredAt: 登録日時（ISO 8601形式）
// iconImageUrl: アイコン画像のURL
type BusinessMemberResponse struct {
	ID           int64  `json:"id"`
	BusinessName string `json:"businessName"`
	Gmail        string `json:"gmail"`
	RegistDate   string `json:"registeredAt"` // ISO 8601形式
	IconImageURL string `json:"iconImageUrl"`
}

// UpdateBusinessNameRequest は事業者名更新のリクエスト
// newBusinessName: 必須。新しい事業者名（1〜50文字）
type UpdateBusinessNameRequest struct {
	NewBusinessName string `json:"newBusinessName" binding:"required,min=1,max=50"`
}

// UpdateBusinessIconRequest はアイコン更新のリクエスト
// newBusinessIcon: 必須。新しいアイコン画像データ
type UpdateBusinessIconRequest struct {
	NewBusinessIcon []byte `json:"newBusinessIcon" binding:"required"`
}

// AnonymizeBusinessMemberRequest は匿名化のリクエスト
// 認証コンテキストから businessID を取得するため、リクエストボディは空
type AnonymizeBusinessMemberRequest struct {
}
