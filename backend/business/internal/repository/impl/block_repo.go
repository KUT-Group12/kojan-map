package impl

import (
	"context"
	"fmt"

	"gorm.io/gorm"
	"kojan-map/business/internal/domain"
)

// BlockRepoImpl implements the BlockRepo interface using GORM.
type BlockRepoImpl struct {
	db *gorm.DB
}

// NewBlockRepoImpl creates a new block repository.
func NewBlockRepoImpl(db *gorm.DB) *BlockRepoImpl {
	return &BlockRepoImpl{db: db}
}

// Create creates a new block record (M1-9-2).
// SSOT Rules: ブロック者 IDと被ブロック者 IDの組み合わせは一意
func (r *BlockRepoImpl) Create(ctx context.Context, blockerID, blockedID string) error {
	if blockerID == "" || blockedID == "" {
		return fmt.Errorf("both blockerID and blockedID are required")
	}

	// Check if already blocked
	var existingBlock domain.Block
	if err := r.db.WithContext(ctx).
		Where("blocking_user_id = ? AND blocked_google_id = ?", blockerID, blockedID).
		First(&existingBlock).Error; err == nil {
		return fmt.Errorf("user already blocked")
	}

	block := &domain.Block{
		BlockingUserID:  blockerID,
		BlockedGoogleID: blockedID,
	}

	if err := r.db.WithContext(ctx).Create(block).Error; err != nil {
		return fmt.Errorf("failed to create block: %w", err)
	}

	return nil
}

// Delete removes a block record (M1-10-2).
func (r *BlockRepoImpl) Delete(ctx context.Context, blockerID, blockedID string) error {
	if blockerID == "" || blockedID == "" {
		return fmt.Errorf("both blockerID and blockedID are required")
	}

	result := r.db.WithContext(ctx).
		Where("blocking_user_id = ? AND blocked_google_id = ?", blockerID, blockedID).
		Delete(&domain.Block{})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("block record not found")
	}

	return nil
}
