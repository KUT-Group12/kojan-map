package impl

import (
	"context"

	"gorm.io/gorm"
)

// PaymentRepoImpl is a mock implementation (no external Stripe call).
type PaymentRepoImpl struct {
	db *gorm.DB
}

// NewPaymentRepoImpl creates a new payment repository.
func NewPaymentRepoImpl(db *gorm.DB) *PaymentRepoImpl {
	return &PaymentRepoImpl{db: db}
}

// CreatePayment is a no-op placeholder to satisfy interface.
func (r *PaymentRepoImpl) CreatePayment(ctx context.Context, businessID int64, amount int64, payFlag bool) (int64, error) {
	// No-op: Stripe integration is mocked; return dummy ID
	return 0, nil
}
