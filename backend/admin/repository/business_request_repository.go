package repository

import (
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// BusinessRequestRepository は事業者申請のデータベース操作を処理します。
type BusinessRequestRepository struct {
	db *gorm.DB
}

// NewBusinessRequestRepository は新しいBusinessRequestRepositoryを作成します。
func NewBusinessRequestRepository(db *gorm.DB) *BusinessRequestRepository {
	return &BusinessRequestRepository{db: db}
}

// FindAll は全ての事業者申請を取得します。
func (r *BusinessRequestRepository) FindAll() ([]models.BusinessRequest, error) {
	var requests []models.BusinessRequest
	result := r.db.Order("createdAt DESC").Find(&requests)
	if result.Error != nil {
		return nil, result.Error
	}
	return requests, nil
}

// FindAllPaginated はページネーション付きで事業者申請を取得します。
func (r *BusinessRequestRepository) FindAllPaginated(page, pageSize int, status *string) ([]models.BusinessRequest, int, error) {
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

	return requests, int(total), nil
}

// FindByID はIDで事業者申請を検索します。
func (r *BusinessRequestRepository) FindByID(id int32) (*models.BusinessRequest, error) {
	var request models.BusinessRequest
	result := r.db.Where("requestId = ?", id).First(&request)
	if result.Error != nil {
		return nil, result.Error
	}
	return &request, nil
}

// UpdateStatus は事業者申請のステータスを更新します。
func (r *BusinessRequestRepository) UpdateStatus(id int32, status string) error {
	return r.db.Model(&models.BusinessRequest{}).
		Where("requestId = ?", id).
		Update("status", status).Error
}

// Delete は事業者申請を削除します。
func (r *BusinessRequestRepository) Delete(id int32) error {
	return r.db.Where("requestId = ?", id).Delete(&models.BusinessRequest{}).Error
}

// CountPending は保留中の事業者申請の数をカウントします。
func (r *BusinessRequestRepository) CountPending() (int, error) {
	var count int64
	result := r.db.Model(&models.BusinessRequest{}).Where("status = ?", "pending").Count(&count)
	return int(count), result.Error
}
