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

// FindAllPaginated retrieves business requests with pagination
func (r *BusinessRequestRepository) FindAllPaginated(page, pageSize int, status *string) ([]models.BusinessRequest, int64, error) {
	var requests []models.BusinessRequest
	var total int64

	query := r.db.Model(&models.BusinessRequest{})
	if status != nil && *status != "" {
		query = query.Where("status = ?", *status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	result := query.Order("createdAt DESC").Offset(offset).Limit(pageSize).Find(&requests)
	if result.Error != nil {
		return nil, 0, result.Error
	}

	return requests, total, nil
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

// CountPending counts pending business requests
func (r *BusinessRequestRepository) CountPending() (int64, error) {
	var count int64
	result := r.db.Model(&models.BusinessRequest{}).Where("status = ?", "pending").Count(&count)
	return count, result.Error
}
