package impl

import (
	"context"
	"errors"

	"gorm.io/gorm"
	"kojan-map/business/internal/domain"
)

// AuthRepoImpl は GORM を使用して AuthRepo インターフェースを実装します。
type AuthRepoImpl struct {
	db *gorm.DB
}

// NewAuthRepoImpl は新しい認証リポジトリを作成します。
func NewAuthRepoImpl(db *gorm.DB) *AuthRepoImpl {
	return &AuthRepoImpl{db: db}
}

// GetOrCreateUser はユーザーレコードを取得、または作成します。
func (r *AuthRepoImpl) GetOrCreateUser(ctx context.Context, googleID, gmail, role string) (interface{}, error) {
	var user domain.User
	result := r.db.WithContext(ctx).Where("id = ?", googleID).First(&user)

	if result.Error == nil {
		// ユーザーが存在します
		return &user, nil
	}

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// 新しいユーザーを作成します
		user = domain.User{
			ID:    googleID,
			Gmail: gmail,
			Role:  role,
		}
		if err := r.db.WithContext(ctx).Create(&user).Error; err != nil {
			return nil, err
		}
		return &user, nil
	}

	return nil, result.Error
}

// GetUserByID は Google ID を使用してユーザーを取得します。
func (r *AuthRepoImpl) GetUserByID(ctx context.Context, googleID string) (interface{}, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("id = ?", googleID).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByGmail は Gmail アドレスを使用してユーザーを取得します。
func (r *AuthRepoImpl) GetUserByGmail(ctx context.Context, gmail string) (interface{}, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("gmail = ?", gmail).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetBusinessMemberByUserID はユーザー ID を使用して事業者メンバー情報を取得します。
func (r *AuthRepoImpl) GetBusinessMemberByUserID(ctx context.Context, userID string) (interface{}, error) {
	var member domain.BusinessMember
	if err := r.db.WithContext(ctx).Where("userId = ?", userID).First(&member).Error; err != nil {
		return nil, err
	}
	return &member, nil
}
