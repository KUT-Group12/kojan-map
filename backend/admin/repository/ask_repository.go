package repository

import (
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// AskRepository handles database operations for contact inquiries
type AskRepository struct {
	db *gorm.DB
}

// NewAskRepository creates a new AskRepository
func NewAskRepository(db *gorm.DB) *AskRepository {
	return &AskRepository{db: db}
}

// FindAll retrieves all inquiries
func (r *AskRepository) FindAll() ([]models.Ask, error) {
	var asks []models.Ask
	result := r.db.Order("date DESC").Find(&asks)
	if result.Error != nil {
		return nil, result.Error
	}
	return asks, nil
}

// FindByID finds an inquiry by ID
func (r *AskRepository) FindByID(id int) (*models.Ask, error) {
	var ask models.Ask
	result := r.db.Where("askId = ?", id).First(&ask)
	if result.Error != nil {
		return nil, result.Error
	}
	return &ask, nil
}

// MarkAsHandled marks an inquiry as handled (askFlag = true)
func (r *AskRepository) MarkAsHandled(id int) error {
	return r.db.Model(&models.Ask{}).
		Where("askId = ?", id).
		Update("askFlag", true).Error
}

// MarkAsRejected marks an inquiry as rejected (askFlag = false, or could be a separate field)
func (r *AskRepository) MarkAsRejected(id int) error {
	// For now, we just mark it as not handled
	// In a real scenario, you might want a separate status field
	return r.db.Model(&models.Ask{}).
		Where("askId = ?", id).
		Update("askFlag", false).Error
}
