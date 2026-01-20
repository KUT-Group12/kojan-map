package impl

import (
	"context"
	"fmt"

	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/errors"
)

// PaymentServiceImpl はPaymentServiceインターフェースを実装します。
type PaymentServiceImpl struct {
	paymentRepo repository.PaymentRepo
}

// NewPaymentServiceImpl は新しい決済サービスを作成します。
func NewPaymentServiceImpl(paymentRepo repository.PaymentRepo) *PaymentServiceImpl {
	return &PaymentServiceImpl{paymentRepo: paymentRepo}
}

// CreateRedirect はモックのStripeリダイレクトURLを返します（M1-15-3）。
func (s *PaymentServiceImpl) CreateRedirect(ctx context.Context, businessID int64) (string, error) {
	if businessID <= 0 {
		return "", errors.NewAPIError(errors.ErrInvalidInput, "businessId must be greater than 0")
	}

	// 外部Stripe呼び出しなし。必要に応じてプレースホルダーの決済レコードを作成
	_, err := s.paymentRepo.CreatePayment(ctx, businessID, 0, false)
	if err != nil {
		return "", errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to create payment placeholder: %v", err))
	}

	// モックのリダイレクトURL
	redirectURL := fmt.Sprintf("https://example.com/stripe/mock-redirect?businessId=%d", businessID)
	return redirectURL, nil
}
