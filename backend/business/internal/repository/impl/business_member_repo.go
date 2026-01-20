package impl

import (
	"context"
	"errors"
	"fmt"

	"kojan-map/business/internal/domain"
	"unicode/utf8"

	"gorm.io/gorm"
)

// BusinessMemberRepoImpl は GORM を使用して BusinessMemberRepo インターフェースを実装します。
type BusinessMemberRepoImpl struct {
	db *gorm.DB
}

// NewBusinessMemberRepoImpl は新しい事業者メンバーリポジトリを作成します。
func NewBusinessMemberRepoImpl(db *gorm.DB) *BusinessMemberRepoImpl {
	return &BusinessMemberRepoImpl{db: db}
}

// GetByGoogleID はユーザー ID（Google ID）を使用して事業者メンバー情報を取得します。
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

// UpdateName は事業者メンバーの事業者名を更新します（M3-4-2）。
// 事業者名は1文字以上50文字以下、不正な形式はエラー、ログイン済みかつ本人のみ更新可能
func (r *BusinessMemberRepoImpl) UpdateName(ctx context.Context, businessID int32, name string) error {
	if name == "" || utf8.RuneCountInString(name) > 50 {
		return fmt.Errorf("business name must be between 1 and 50 characters")
	}

	result := r.db.WithContext(ctx).Model(&domain.BusinessMember{}).
		Where("businessId = ?", businessID).
		Update("businessName", name)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("business member not found for id %d", businessID)
	}

	return nil
}

// UpdateIcon は事業者メンバーのプロフィール画像を更新します（M3-5-2）。
// 画像は PNG または JPEG のみ、5MB以下、ログイン済みかつ本人のみ更新可能
func (r *BusinessMemberRepoImpl) UpdateIcon(ctx context.Context, businessID int32, icon []byte) error {
	if len(icon) == 0 {
		return fmt.Errorf("icon data cannot be empty")
	}

	result := r.db.WithContext(ctx).Model(&domain.BusinessMember{}).
		Where("businessId = ?", businessID).
		Update("profileImage", icon)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("business member not found for id %d", businessID)
	}

	return nil
}

// Anonymize は事業者メンバーを匿名化します（M3-3）。
// 識別可能な個人情報は復元不能な値に置き換える、主キーおよび外部キーは変更しない、物理削除は行わない
func (r *BusinessMemberRepoImpl) Anonymize(ctx context.Context, businessID int32) error {
	// 機密フィールドを匿名化します
	result := r.db.WithContext(ctx).Model(&domain.BusinessMember{}).
		Where("businessId = ?", businessID).
		Updates(map[string]interface{}{
			"businessName":     "[Anonymized]",
			"kanaBusinessName": "[Anonymized]",
			"phone":            "[Anonymized]",
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

// GetMemberInfoByGoogleID は表示用のメンバー情報を取得します（M1-2）。
// ユーザーのメールアドレスとロールを返します。
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
