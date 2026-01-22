package repository

import (
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// ReportRepository は通報のデータベース操作を処理します。
type ReportRepository struct {
	db *gorm.DB
}

// NewReportRepository は新しいReportRepositoryを作成します。
func NewReportRepository(db *gorm.DB) *ReportRepository {
	return &ReportRepository{db: db}
}

// FindAll はページネーションとオプションのフィルター付きで全ての通報を取得します。
func (r *ReportRepository) FindAll(page, pageSize int, handled *bool) ([]models.Report, int, error) {
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

	return reports, int(total), nil
}

// FindByID はIDで通報を検索します。
func (r *ReportRepository) FindByID(id int32) (*models.Report, error) {
	var report models.Report
	result := r.db.Where("reportId = ?", id).First(&report)
	if result.Error != nil {
		return nil, result.Error
	}
	return &report, nil
}

// CountUnprocessed は未処理の通報の数をカウントします。
func (r *ReportRepository) CountUnprocessed() (int, error) {
	var count int64
	result := r.db.Model(&models.Report{}).Where("reportFlag = ?", false).Count(&count)
	return int(count), result.Error
}

// MarkAsHandled は通報を処理済みとしてマークします。
func (r *ReportRepository) MarkAsHandled(id int32) error {
	return r.db.Model(&models.Report{}).
		Where("reportId = ?", id).
		Update("reportFlag", true).Error
}
