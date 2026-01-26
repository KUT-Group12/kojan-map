package repository

import (
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// BusinessMemberRepository は事業者会員のデータベース操作を処理します。
type BusinessMemberRepository struct {
	db *gorm.DB
}

// NewBusinessMemberRepository は新しいBusinessMemberRepositoryを作成します。
func NewBusinessMemberRepository(db *gorm.DB) *BusinessMemberRepository {
	return &BusinessMemberRepository{db: db}
}

// CountAll は全ての事業者会員の数をカウントします。
func (r *BusinessMemberRepository) CountAll() (int, error) {
	var count int64
	result := r.db.Model(&models.BusinessMember{}).Count(&count)
	return int(count), result.Error
}

// Create は承認されたリクエストから新しい事業者会員を作成します。
func (r *BusinessMemberRepository) Create(member *models.BusinessMember) error {
	return r.db.Create(member).Error
}
