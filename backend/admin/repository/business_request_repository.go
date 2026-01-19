package repository

import (
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// BusinessRequestRepository handles database operations for business requests
type BusinessRequestRepository struct {
	db *gorm.DB
}

// NewBusinessRequestRepository creates a new BusinessRequestRepository
func NewBusinessRequestRepository(db *gorm.DB) *BusinessRequestRepository {
	return &BusinessRequestRepository{db: db}
}

// FindAll retrieves all business requests
func (r *BusinessRequestRepository) FindAll() ([]models.BusinessRequest, error) {
	var requests []models.BusinessRequest
	result := r.db.Order("createdAt DESC").Find(&requests)
	if result.Error != nil {
		return nil, result.Error
	}
	return requests, nil
}

// FindByID finds a business request by ID
func (r *BusinessRequestRepository) FindByID(id int) (*models.BusinessRequest, error) {
	var request models.BusinessRequest
	result := r.db.Where("requestId = ?", id).First(&request)
	if result.Error != nil {
		return nil, result.Error
	}
	return &request, nil
}

// UpdateStatus updates the status of a business request
func (r *BusinessRequestRepository) UpdateStatus(id int, status string) error {
	return r.db.Model(&models.BusinessRequest{}).
		Where("requestId = ?", id).
		Update("status", status).Error
}

// Delete deletes a business request
func (r *BusinessRequestRepository) Delete(id int) error {
	return r.db.Where("requestId = ?", id).Delete(&models.BusinessRequest{}).Error
}
