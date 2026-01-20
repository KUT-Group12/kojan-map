package impl

import (
	"context"
	"errors"
	"fmt"

	"kojan-map/business/internal/domain"

	"gorm.io/gorm"
)

// BlockRepoImpl は GORM を使用して BlockRepo インターフェースを実装します。
type BlockRepoImpl struct {
	db *gorm.DB
}

// NewBlockRepoImpl は新しいブロックリポジトリを作成します。
func NewBlockRepoImpl(db *gorm.DB) *BlockRepoImpl {
	return &BlockRepoImpl{db: db}
}

// Create は新しいブロックレコードを作成します（M1-9-2）。
// ブロック者 ID と被ブロック者 ID の組み合わせは一意
func (r *BlockRepoImpl) Create(ctx context.Context, blockerID, blockedID string) error {
	if blockerID == "" || blockedID == "" {
		return fmt.Errorf("both blockerID and blockedID are required")
	}

	block := &domain.Block{
		BlockingUserID: blockerID,
		BlockedUserID:  blockedID,
	}

	if err := r.db.WithContext(ctx).Create(block).Error; err != nil {
		// MySQL unique constraint violation error code: 1062
		// Check if it's a duplicate key error
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return fmt.Errorf("user already blocked")
		}
		return fmt.Errorf("failed to create block: %w", err)
	}

	return nil
}

// Delete はブロックレコードを削除します（M1-10-2）。
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
