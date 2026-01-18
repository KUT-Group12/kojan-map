package impl

import (
	"context"
	"errors"

	"gorm.io/gorm"
	"kojan-map/business/internal/domain"
)

// AuthRepoImpl implements the AuthRepo interface using GORM.
type AuthRepoImpl struct {
	db *gorm.DB
}

// NewAuthRepoImpl creates a new auth repository.
func NewAuthRepoImpl(db *gorm.DB) *AuthRepoImpl {
	return &AuthRepoImpl{db: db}
}

// GetOrCreateUser retrieves or creates a user record.
func (r *AuthRepoImpl) GetOrCreateUser(ctx context.Context, googleID, gmail, role string) (interface{}, error) {
	var user domain.User
	result := r.db.WithContext(ctx).Where("id = ?", googleID).First(&user)

	if result.Error == nil {
		// User exists
		return &user, nil
	}

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Create new user
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

// GetUserByID retrieves a user by Google ID.
func (r *AuthRepoImpl) GetUserByID(ctx context.Context, googleID string) (interface{}, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("id = ?", googleID).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByGmail retrieves a user by gmail address.
func (r *AuthRepoImpl) GetUserByGmail(ctx context.Context, gmail string) (interface{}, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("gmail = ?", gmail).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetBusinessMemberByUserID retrieves business member info by user ID.
func (r *AuthRepoImpl) GetBusinessMemberByUserID(ctx context.Context, userID string) (interface{}, error) {
	var member domain.BusinessMember
	if err := r.db.WithContext(ctx).Where("userId = ?", userID).First(&member).Error; err != nil {
		return nil, err
	}
	return &member, nil
}
