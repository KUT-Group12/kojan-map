package impl

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"
	"kojan-map/business/internal/domain"
)

// BusinessMemberRepoImpl implements the BusinessMemberRepo interface using GORM.
type BusinessMemberRepoImpl struct {
	db *gorm.DB
}

// NewBusinessMemberRepoImpl creates a new business member repository.
func NewBusinessMemberRepoImpl(db *gorm.DB) *BusinessMemberRepoImpl {
	return &BusinessMemberRepoImpl{db: db}
}

// GetByGoogleID retrieves business member info by user ID (Google ID).
func (r *BusinessMemberRepoImpl) GetByGoogleID(ctx context.Context, googleID string) (interface{}, error) {
	var member domain.BusinessMember
	if err := r.db.WithContext(ctx).Where("userId = ?", googleID).First(&member).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("business member not found for userId %s", googleID)
		}
		return nil, err
	}
	return &member, nil
}

// UpdateName updates the business name for a business member (M3-4-2).
// SSOT Rules: 事業者名は1文字以上50文字以下、不正な形式はエラー、ログイン済みかつ本人のみ更新可能
func (r *BusinessMemberRepoImpl) UpdateName(ctx context.Context, businessID int64, name string) error {
	if name == "" || len(name) > 50 {
		return fmt.Errorf("business name must be between 1 and 50 characters")
	}

	result := r.db.WithContext(ctx).Model(&domain.BusinessMember{}).
		Where("id = ?", businessID).
		Update("businessName", name)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("business member not found for id %d", businessID)
	}

	return nil
}

// UpdateIcon updates the profile image for a business member (M3-5-2).
// SSOT Rules: 画像は PNG または JPEG のみ、5MB以下、ログイン済みかつ本人のみ更新可能
func (r *BusinessMemberRepoImpl) UpdateIcon(ctx context.Context, businessID int64, icon []byte) error {
	if len(icon) == 0 {
		return fmt.Errorf("icon data cannot be empty")
	}

	result := r.db.WithContext(ctx).Model(&domain.BusinessMember{}).
		Where("id = ?", businessID).
		Update("profileImage", icon)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("business member not found for id %d", businessID)
	}

	return nil
}

// Anonymize anonymizes a business member (M3-3).
// SSOT Rules: 識別可能な個人情報は復元不能な値に置き換える、主キーおよび外部キーは変更しない、物理削除は行わない
func (r *BusinessMemberRepoImpl) Anonymize(ctx context.Context, businessID int64) error {
	// Anonymize sensitive fields
	result := r.db.WithContext(ctx).Model(&domain.BusinessMember{}).
		Where("id = ?", businessID).
		Updates(map[string]interface{}{
			"businessName":     "[Anonymized]",
			"kanaBusinessName": "[Anonymized]",
			"phone":            0,
			"address":          "[Anonymized]",
			"profileImage":     nil,
			"anonymizedAt":     gorm.Expr("NOW()"),
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("business member not found for id %d", businessID)
	}

	return nil
}

// GetMemberInfoByGoogleID retrieves member information for display (M1-2).
// Returns user email and role.
func (r *BusinessMemberRepoImpl) GetMemberInfoByGoogleID(ctx context.Context, googleID string) (interface{}, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("id = ?", googleID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found for id %s", googleID)
		}
		return nil, err
	}
	return &user, nil
}
