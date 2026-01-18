package impl

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"
	"kojan-map/business/internal/domain"
)

// ContactRepoImpl は GORM を使用して ContactRepo を実装します。
type ContactRepoImpl struct {
	db *gorm.DB
}

// NewContactRepoImpl は新しいお問い合わせリポジトリを作成します。
func NewContactRepoImpl(db *gorm.DB) *ContactRepoImpl {
	return &ContactRepoImpl{db: db}
}

// Create は新しいお問い合わせを保存します（M1-11-2）。
func (r *ContactRepoImpl) Create(ctx context.Context, googleID string, subject, message string) error {
	contact := &domain.Contact{
		GoogleID:  googleID,
		Subject:   subject,
		Message:   message,
		Status:    "new",
		CreatedAt: time.Now(),
	}

	if err := r.db.WithContext(ctx).Create(contact).Error; err != nil {
		return fmt.Errorf("failed to create contact: %w", err)
	}

	return nil
}
