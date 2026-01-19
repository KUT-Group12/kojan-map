package handler

import "kojan-map/admin/service"

// SuccessResponse は成功時の標準レスポンス
type SuccessResponse struct {
	Success bool `json:"success"`
}

// ErrorResponse はエラー時の標準レスポンス
type ErrorResponse struct {
	Error string `json:"error"`
}

// GetApplicationsResponse は申請一覧取得のレスポンス
type GetApplicationsResponse struct {
	Applications []service.BusinessApplicationResponse `json:"applications"`
}
