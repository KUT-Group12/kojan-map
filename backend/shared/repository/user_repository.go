package repository

import (
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// UserRepository handles database operations for users
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new UserRepository
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// FindAll retrieves all users with pagination
func (r *UserRepository) FindAll(page, pageSize int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	r.db.Model(&models.User{}).Count(&total)

	offset := (page - 1) * pageSize
	result := r.db.Offset(offset).Limit(pageSize).Find(&users)
	if result.Error != nil {
		return nil, 0, result.Error
	}

	return users, total, nil
}

// FindByGoogleID finds a user by their Google ID
func (r *UserRepository) FindByGoogleID(googleID string) (*models.User, error) {
	var user models.User
	result := r.db.Where("googleId = ?", googleID).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

// CountAll counts all users
func (r *UserRepository) CountAll() (int64, error) {
	var count int64
	result := r.db.Model(&models.User{}).Count(&count)
	return count, result.Error
}

// CountByRole counts users by role
func (r *UserRepository) CountByRole(role models.Role) (int64, error) {
	var count int64
	result := r.db.Model(&models.User{}).Where("role = ?", role).Count(&count)
	return count, result.Error
}

// SoftDelete marks a user as deleted
func (r *UserRepository) SoftDelete(googleID string) error {
	return r.db.Model(&models.User{}).
		Where("googleId = ?", googleID).
		Update("deletedAt", gorm.Expr("NOW()")).Error
}
