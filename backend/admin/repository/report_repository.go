<<<<<<< HEAD
package repository

import (
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// ReportRepository handles database operations for reports
type ReportRepository struct {
	db *gorm.DB
}

// NewReportRepository creates a new ReportRepository
func NewReportRepository(db *gorm.DB) *ReportRepository {
	return &ReportRepository{db: db}
}

// FindAll retrieves all reports with pagination and optional filter
func (r *ReportRepository) FindAll(page, pageSize int, handled *bool) ([]models.Report, int64, error) {
	var reports []models.Report
	var total int64

	query := r.db.Model(&models.Report{})
	if handled != nil {
		query = query.Where("reportFlag = ?", *handled)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	result := query.Offset(offset).Limit(pageSize).Order("date DESC").Find(&reports)
	if result.Error != nil {
		return nil, 0, result.Error
	}

	return reports, total, nil
}

// FindByID finds a report by ID
func (r *ReportRepository) FindByID(id int) (*models.Report, error) {
	var report models.Report
	result := r.db.Where("reportId = ?", id).First(&report)
	if result.Error != nil {
		return nil, result.Error
	}
	return &report, nil
}

// CountUnprocessed counts unprocessed reports
func (r *ReportRepository) CountUnprocessed() (int64, error) {
	var count int64
	result := r.db.Model(&models.Report{}).Where("reportFlag = ?", false).Count(&count)
	return count, result.Error
}

// MarkAsHandled marks a report as handled
func (r *ReportRepository) MarkAsHandled(id int) error {
	return r.db.Model(&models.Report{}).
		Where("reportId = ?", id).
		Update("reportFlag", true).Error
}
=======
package repository

import (
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// ReportRepository handles database operations for reports
type ReportRepository struct {
	db *gorm.DB
}

// NewReportRepository creates a new ReportRepository
func NewReportRepository(db *gorm.DB) *ReportRepository {
	return &ReportRepository{db: db}
}

// FindAll retrieves all reports with pagination and optional filter
func (r *ReportRepository) FindAll(page, pageSize int, handled *bool) ([]models.Report, int64, error) {
	var reports []models.Report
	var total int64

	query := r.db.Model(&models.Report{})
	if handled != nil {
		query = query.Where("reportFlag = ?", *handled)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	result := query.Offset(offset).Limit(pageSize).Order("date DESC").Find(&reports)
	if result.Error != nil {
		return nil, 0, result.Error
	}

	return reports, total, nil
}

// FindByID finds a report by ID
func (r *ReportRepository) FindByID(id int) (*models.Report, error) {
	var report models.Report
	result := r.db.Where("reportId = ?", id).First(&report)
	if result.Error != nil {
		return nil, result.Error
	}
	return &report, nil
}

// CountUnprocessed counts unprocessed reports
func (r *ReportRepository) CountUnprocessed() (int64, error) {
	var count int64
	result := r.db.Model(&models.Report{}).Where("reportFlag = ?", false).Count(&count)
	return count, result.Error
}

// MarkAsHandled marks a report as handled
func (r *ReportRepository) MarkAsHandled(id int) error {
	return r.db.Model(&models.Report{}).
		Where("reportId = ?", id).
		Update("reportFlag", true).Error
}
>>>>>>> origin/main
