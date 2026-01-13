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
//
// Parameters:
//   - id: お問合せID
//
// Returns :
//   - error:お問合せIDが見つからない場合，または処理済みの場合
func (r *AskRepository) MarkAsHandled(id int) error {
	return r.db.Model(&models.Ask{}).
		Where("askId = ?", id).
		Update("askFlag", true).Error
}

// MarkAsRejectedは特定のお問い合わせを未処理状態にする機能です．
// Parameters:
//   - id: お問い合わせID
//
// Returns:
//   - error: 更新に失敗した場合，または該当するお問い合わせが見つからない場合
func (r *AskRepository) MarkAsRejected(id int) error {
	// For now, we just mark it as not handled
	// In a real scenario, you might want a separate status field
	return r.db.Model(&models.Ask{}).
		Where("askId = ?", id).
		Update("askFlag", false).Error
}
