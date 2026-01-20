package domain

import "time"

// User はユーザー基本情報（全ロール共通）
type User struct {
	ID               string    `gorm:"primaryKey;column:googleId;type:varchar(50)"`
	Gmail            string    `gorm:"column:gmail;type:varchar(100);not null"`
	Role             string    `gorm:"column:role;type:enum('user','business','admin');not null"`
	RegistrationDate time.Time `gorm:"column:registrationDate;not null"`
}

// TableName はテーブル名を指定
func (User) TableName() string {
	return "user"
}

// GoogleAuthRequest はGoogle認証のリクエスト
// googleId: 必須。GoogleユーザーのID
// gmail: 必須。メールアドレス形式で検証される
// idToken: 必須。Google認証のIDトークン
// role: 必須。user, business, adminのいずれか
type GoogleAuthRequest struct {
	GoogleID string `json:"googleId" binding:"required"`
	Gmail    string `json:"gmail" binding:"required,email"`
	IDToken  string `json:"idToken" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=user business admin"`
}

// GoogleAuthResponse はGoogle認証のレスポンス
// sessionId: セッションID
// userId: ユーザーID
// role: ユーザーのロール（user/business/admin）
type GoogleAuthResponse struct {
	SessionID string `json:"sessionId"`
	UserID    string `json:"userId"`
	Role      string `json:"role"`
}

// BusinessLoginRequest は事業者ログインのリクエスト
// sessionId: 必須。GoogleAuthで取得したセッションID
// gmail: 必須。メールアドレス形式で検証される
// mfaCode: 必須。多要素認証コード
type BusinessLoginRequest struct {
	SessionID string `json:"sessionId" binding:"required"`
	Gmail     string `json:"gmail" binding:"required,email"`
	MFACode   string `json:"mfaCode" binding:"required"`
}

// BusinessLoginResponse は事業者ログインのレスポンス
// token: 認証トークン
// business: 事業者情報（ID、ロール）
type BusinessLoginResponse struct {
	Token    string `json:"token"`
	Business struct {
		ID   int    `json:"id"`
		Role string `json:"role"`
	} `json:"business"`
}

// LogoutResponse はログアウトのレスポンス
// expiredSessionId: 無効化されたセッションID
type LogoutResponse struct {
	ExpiredSessionID string `json:"expiredSessionId"`
}

// LogoutRequest はログアウトのリクエスト
// セッション情報はミドルウェアで抽出するため、リクエストボディは空
type LogoutRequest struct {
	// セッション情報はミドルウェアで抽出
}

// MemberInfoResponse は会員情報のレスポンス
// gmail: ユーザーのメールアドレス
// role: ユーザーのロール（user/business/admin）
type MemberInfoResponse struct {
	Gmail string `json:"gmail"`
	Role  string `json:"role"`
}

// RefreshTokenRequest はトークン更新のリクエスト
// refreshToken: 必須。リフレッシュトークン
type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

// RefreshTokenResponse はトークン更新のレスポンス
// accessToken: 新しいアクセストークン
type RefreshTokenResponse struct {
	AccessToken string `json:"accessToken"`
}
