package errors

import (
	"fmt"
	"net/http"
)

// ErrorCode はエラーコードを表す
type ErrorCode string

const (
	// 認証関連
	ErrInvalidCredentials ErrorCode = "INVALID_CREDENTIALS"
	ErrMissingMFA         ErrorCode = "MISSING_MFA"
	ErrUnauthorized       ErrorCode = "UNAUTHORIZED"
	ErrTokenExpired       ErrorCode = "TOKEN_EXPIRED"

	// リソース関連
	ErrNotFound      ErrorCode = "NOT_FOUND"
	ErrAlreadyExists ErrorCode = "ALREADY_EXISTS"
	ErrDuplicate     ErrorCode = "DUPLICATE"

	// バリデーション関連
	ErrInvalidInput     ErrorCode = "INVALID_INPUT"
	ErrValidationFailed ErrorCode = "VALIDATION_FAILED"
	ErrInvalidEmail     ErrorCode = "INVALID_EMAIL"
	ErrInvalidImage     ErrorCode = "INVALID_IMAGE"
	ErrImageTooLarge    ErrorCode = "IMAGE_TOO_LARGE"

	// ビジネスロジック関連
	ErrOperationFailed      ErrorCode = "OPERATION_FAILED"
	ErrExternalServiceError ErrorCode = "EXTERNAL_SERVICE_ERROR"

	// その他
	ErrInternalServer ErrorCode = "INTERNAL_SERVER_ERROR"
)

// APIError は APIレスポンスのエラー形式
type APIError struct {
	ErrorCode  ErrorCode `json:"errorCode"`
	Message    string    `json:"message"`
	StatusCode int       `json:"-"`
}

// Error は error インターフェースを実装
func (e *APIError) Error() string {
	return fmt.Sprintf("[%s] %s", e.ErrorCode, e.Message)
}

// NewAPIError は新しいAPIエラーを作成
func NewAPIError(code ErrorCode, message string) *APIError {
	return &APIError{
		ErrorCode:  code,
		Message:    message,
		StatusCode: getStatusCode(code),
	}
}

// getStatusCode はエラーコードに対応するHTTPステータスコードを返す
func getStatusCode(code ErrorCode) int {
	switch code {
	case ErrInvalidCredentials, ErrMissingMFA, ErrUnauthorized, ErrTokenExpired:
		return http.StatusUnauthorized
	case ErrNotFound:
		return http.StatusNotFound
	case ErrAlreadyExists, ErrDuplicate:
		return http.StatusConflict
	case ErrInvalidInput, ErrValidationFailed, ErrInvalidEmail, ErrInvalidImage, ErrImageTooLarge:
		return http.StatusBadRequest
	case ErrOperationFailed, ErrExternalServiceError:
		return http.StatusBadGateway
	default:
		return http.StatusInternalServerError
	}
}
