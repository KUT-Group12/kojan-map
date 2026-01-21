package impl

import (
	"context"

	"gorm.io/gorm"
)

// PaymentRepoImpl はモック実装です（外部 Stripe 呼び出しは行いません）。
type PaymentRepoImpl struct {
	db *gorm.DB
}

// NewPaymentRepoImpl は新しい支払いリポジトリを作成します。
func NewPaymentRepoImpl(db *gorm.DB) *PaymentRepoImpl {
	return &PaymentRepoImpl{db: db}
}

// CreatePayment はインターフェースを満たすためのプレースホルダー（何も実行しません）。
func (r *PaymentRepoImpl) CreatePayment(ctx context.Context, businessID int32, amount int, payFlag bool) (int32, error) {
	// 何も実行しません: Stripe 統合はモックされており、ダミー ID を返します
	return 0, nil
}
