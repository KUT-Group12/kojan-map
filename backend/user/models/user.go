package models

import (
	"time"

	"gorm.io/gorm"
)

// User 一般会員モデル
type User struct {
	ID               string         `gorm:"primaryKey" json:"id"`
	GoogleID         string         `gorm:"uniqueIndex" json:"googleId"`
	Email            string         `gorm:"uniqueIndex" json:"gmail"`
	Role             string         `json:"role"` // "user", "business", "admin"
	RegistrationDate time.Time      `json:"registrationDate"`
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName テーブル名を指定
func (User) TableName() string {
	return "users"
}

// Session セッション情報モデル
type Session struct {
	ID        string    `gorm:"column:id;primaryKey" json:"sessionId"`
	GoogleID  string    `gorm:"column:google_id;index" json:"googleId"`
	Expiry    time.Time `gorm:"column:expiry" json:"expiry"`
	CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
}

// TableName テーブル名を指定
func (Session) TableName() string {
	return "sessions"
}

// UserInfo ユーザー情報レスポンス
type UserInfo struct {
	UserID           string    `json:"userId"`
	Email            string    `json:"gmail"`
	Role             string    `json:"role"`
	RegistrationDate time.Time `json:"registrationDate"`
}
