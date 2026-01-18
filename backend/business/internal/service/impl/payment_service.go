package impl

import (
	"context"
	"fmt"

	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/errors"
)

// PaymentServiceImpl implements the PaymentService interface.
type PaymentServiceImpl struct {
	paymentRepo repository.PaymentRepo
}

// NewPaymentServiceImpl creates a new payment service.
func NewPaymentServiceImpl(paymentRepo repository.PaymentRepo) *PaymentServiceImpl {
	return &PaymentServiceImpl{paymentRepo: paymentRepo}
}

// CreateRedirect returns a mock Stripe redirect URL (M1-15-3).
func (s *PaymentServiceImpl) CreateRedirect(ctx context.Context, businessID int64) (string, error) {
	if businessID <= 0 {
		return "", errors.NewAPIError(errors.ErrInvalidInput, "businessId must be greater than 0")
	}

	// No external Stripe call; just create a placeholder payment record if needed
	_, err := s.paymentRepo.CreatePayment(ctx, businessID, 0, false)
	if err != nil {
		return "", errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to create payment placeholder: %v", err))
	}

	// Mock redirect URL
	redirectURL := fmt.Sprintf("https://example.com/stripe/mock-redirect?businessId=%d", businessID)
	return redirectURL, nil
}
