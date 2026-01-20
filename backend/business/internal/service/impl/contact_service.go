package impl

import (
	"context"
	"fmt"

	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/errors"
)

// ContactServiceImpl はContactServiceインターフェースを実装します。
type ContactServiceImpl struct {
	contactRepo repository.ContactRepo
}

// NewContactServiceImpl は新しいお問い合わせサービスを作成します。
func NewContactServiceImpl(contactRepo repository.ContactRepo) *ContactServiceImpl {
	return &ContactServiceImpl{contactRepo: contactRepo}
}

// CreateContact はお問い合わせの送信を処理します（M1-11-2）。
func (s *ContactServiceImpl) CreateContact(ctx context.Context, googleID, subject, message string) error {
	if subject == "" || message == "" {
		return errors.NewAPIError(errors.ErrInvalidInput, "subject and message are required")
	}

	if googleID == "" {
		return errors.NewAPIError(errors.ErrInvalidInput, "googleId is required")
	}

	if err := s.contactRepo.Create(ctx, googleID, subject, message); err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to create contact: %v", err))
	}

	return nil
}
