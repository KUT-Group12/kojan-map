package repository

import (
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// AskRepositoryはお問合せのデータベース操作を処理します．
type AskRepository struct {
	db *gorm.DB
}

// NewAskRepositoryは新しくAskRepositoryを作成するためのコンストラクタ関数です．
func NewAskRepository(db *gorm.DB) *AskRepository {
	return &AskRepository{db: db}
}

// FindAllは全てのお問い合わせを取得する機能です．
func (r *AskRepository) FindAll() ([]models.Ask, error) {
	var asks []models.Ask
	result := r.db.Order("date DESC").Find(&asks)
	if result.Error != nil {
		return nil, result.Error
	}
	return asks, nil
}

// FindAllPaginatedはページネーション付きでお問い合わせを取得する機能です．
func (r *AskRepository) FindAllPaginated(page, pageSize int) ([]models.Ask, int64, error) {
	var asks []models.Ask
	var total int64

	// 総数を取得
	if err := r.db.Model(&models.Ask{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// ページネーション付きで取得
	offset := (page - 1) * pageSize
	result := r.db.Order("date DESC").Offset(offset).Limit(pageSize).Find(&asks)
	if result.Error != nil {
		return nil, 0, result.Error
	}

	return asks, total, nil
}

// FindByIdは特定のIDのお問い合わせを取得する機能です．
func (r *AskRepository) FindByID(id int) (*models.Ask, error) {
	var ask models.Ask
	result := r.db.Where("askId = ?", id).First(&ask)
	if result.Error != nil {
		return nil, result.Error
	}
	return &ask, nil
}

// MarkAsHandledは特定のお問い合わせを処理済みとする機能です．
func (r *AskRepository) MarkAsHandled(id int) error {
	return r.db.Model(&models.Ask{}).
		Where("askId = ?", id).
		Updates(map[string]interface{}{
			"askFlag": true,
			"status":  models.AskStatusHandled,
		}).Error
}

// MarkAsRejectedは特定のお問い合わせを却下状態にする機能です．
func (r *AskRepository) MarkAsRejected(id int) error {
	return r.db.Model(&models.Ask{}).
		Where("askId = ?", id).
		Updates(map[string]interface{}{
			"askFlag": false,
			"status":  models.AskStatusRejected,
		}).Error
}
