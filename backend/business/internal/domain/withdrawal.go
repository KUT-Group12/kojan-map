package domain

// WithdrawalRequest は退会のリクエスト
type WithdrawalRequest struct {
	GoogleID string `json:"googleId" binding:"required"`
}

// WithdrawalResponse は退会のレスポンス
type WithdrawalResponse struct {
	Status string `json:"status"`
}
