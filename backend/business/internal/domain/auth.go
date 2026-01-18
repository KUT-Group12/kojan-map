package domain

import "time"

// User はユーザー基本情報（全ロール共通）
type User struct {
	ID        string `gorm:"primaryKey;column:id;type:varchar(50)"`
	Gmail     string `gorm:"index;column:gmail;type:varchar(100)"`
	Role      string `gorm:"column:role;type:enum('user','business','admin')"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// TableName はテーブル名を指定
func (User) TableName() string {
	return "users"
}

// GoogleAuthRequest はGoogle認証のリクエスト
type GoogleAuthRequest struct {
	GoogleID string `json:"googleId" binding:"required"`
	Gmail    string `json:"gmail" binding:"required,email"`
	IDToken  string `json:"idToken" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=user business admin"`
}

// GoogleAuthResponse はGoogle認証のレスポンス
type GoogleAuthResponse struct {
	SessionID string `json:"sessionId"`
	UserID    string `json:"userId"`
	Role      string `json:"role"`
}

// BusinessLoginRequest は事業者ログインのリクエスト
type BusinessLoginRequest struct {
	Gmail   string `json:"gmail" binding:"required,email"`
	MFACode string `json:"mfaCode" binding:"required"`
}

// BusinessLoginResponse は事業者ログインのレスポンス
type BusinessLoginResponse struct {
	Token    string `json:"token"`
	Business struct {
		ID   int64  `json:"id"`
		Role string `json:"role"`
	} `json:"business"`
}

// LogoutResponse はログアウトのレスポンス
type LogoutResponse struct {
	ExpiredSessionID string `json:"expiredSessionId"`
}

// LogoutRequest はログアウトのリクエスト
type LogoutRequest struct {
	// セッション情報はミドルウェアで抽出
}

// MemberInfoResponse は会員情報のレスポンス
type MemberInfoResponse struct {
	Gmail string `json:"gmail"`
	Role  string `json:"role"`
}

// RefreshTokenRequest はトークン更新のリクエスト
type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

// RefreshTokenResponse はトークン更新のレスポンス
type RefreshTokenResponse struct {
	AccessToken string `json:"accessToken"`
}
