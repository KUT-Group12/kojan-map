package domain

// GoogleAuthRequest はGoogle認証のリクエスト
type GoogleAuthRequest struct {
	// Googleから取得した認証情報を含む
	// フロントエンドから送信される
}

// GoogleAuthResponse はGoogle認証のレスポンス
type GoogleAuthResponse struct {
	SessionID string `json:"sessionId"`
}

// BusinessLoginRequest は事業者ログインのリクエスト
type BusinessLoginRequest struct {
	Gmail   string `json:"gmail" binding:"required,email"`
	MFACode string `json:"mfaCode" binding:"required"`
}

// BusinessLoginResponse は事業者ログインのレスポンス
type BusinessLoginResponse struct {
	Token string `json:"token"`
	Business struct {
		ID   string `json:"id"`
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
