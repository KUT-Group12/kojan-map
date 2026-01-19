<<<<<<< HEAD
package repository

import (
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// BusinessMemberRepository handles database operations for business members
type BusinessMemberRepository struct {
	db *gorm.DB
}

// NewBusinessMemberRepository creates a new BusinessMemberRepository
func NewBusinessMemberRepository(db *gorm.DB) *BusinessMemberRepository {
	return &BusinessMemberRepository{db: db}
}

// CountAll counts all business members
func (r *BusinessMemberRepository) CountAll() (int64, error) {
	var count int64
	result := r.db.Model(&models.BusinessMember{}).Count(&count)
	return count, result.Error
}

// Create creates a new business member from an approved request
func (r *BusinessMemberRepository) Create(member *models.BusinessMember) error {
	return r.db.Create(member).Error
}
=======
package repository

import (
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// BusinessMemberRepository handles database operations for business members
type BusinessMemberRepository struct {
	db *gorm.DB
}

// NewBusinessMemberRepository creates a new BusinessMemberRepository
func NewBusinessMemberRepository(db *gorm.DB) *BusinessMemberRepository {
	return &BusinessMemberRepository{db: db}
}

// CountAll counts all business members
func (r *BusinessMemberRepository) CountAll() (int64, error) {
	var count int64
	result := r.db.Model(&models.BusinessMember{}).Count(&count)
	return count, result.Error
}

// Create creates a new business member from an approved request
func (r *BusinessMemberRepository) Create(member *models.BusinessMember) error {
	return r.db.Create(member).Error
}
>>>>>>> origin/main
