package models

import (
	"time"

	shared "kojan-map/shared/models"
)

// User 一般会員モデル
type User struct {
	GoogleID         string      `gorm:"primaryKey;column:googleId;type:varchar(50)" json:"googleId"`
	Gmail            string      `gorm:"column:gmail;type:varchar(100);not null;unique" json:"gmail"`
	Role             shared.Role `gorm:"column:role;type:enum('user','business','admin');not null" json:"role"`
	RegistrationDate time.Time   `gorm:"column:registrationDate;type:datetime;not null" json:"registrationDate"`
}

// TableName テーブル名を指定
func (User) TableName() string {
	return "user"
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
