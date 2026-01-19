package models

import (
	"time"

	"gorm.io/gorm"
)

// User 一般会員モデル
type User struct {
	ID               string         `gorm:"column:id;primaryKey" json:"id"`
	GoogleID         string         `gorm:"column:googleId;uniqueIndex" json:"googleId"`
	Gmail            string         `gorm:"column:gmail;uniqueIndex" json:"gmail"`
	Role             string         `gorm:"column:role" json:"role"` // "general", "business", "admin"
	RegistrationDate time.Time      `gorm:"column:registrationDate" json:"registrationDate"`
	CreatedAt        time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt        time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `gorm:"column:deletedAt;index" json:"-"`
}

// TableName テーブル名を指定
func (User) TableName() string {
	return "users"
}

// Session セッション情報モデル
type Session struct {
	SessionID string    `gorm:"column:sessionId;primaryKey" json:"sessionId"`
	GoogleID  string    `gorm:"column:googleId;size:50" json:"googleId"`
	Expiry    time.Time `gorm:"column:expiry" json:"expiry"`
}

// TableName テーブル名を指定
func (Session) TableName() string {
	return "sessions"
}

// UserInfo ユーザー情報レスポンス
type UserInfo struct {
	UserID           string    `json:"id"`
	Gmail            string    `json:"gmail"`
	Role             string    `json:"role"`
	RegistrationDate time.Time `json:"registrationDate"`
}
