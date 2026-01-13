package services

import (
	"errors"
	"time"

	"kojan-map/user/config"
	"kojan-map/user/models"
)

// BlockService ブロック関連のビジネスロジック
type BlockService struct{}

// BlockUser ユーザーをブロック
func (bs *BlockService) BlockUser(userID, blockerID string) error {
	block := models.UserBlock{
		UserID:    userID,
		BlockerID: blockerID,
	}
	return config.DB.Create(&block).Error
}

// UnblockUser ブロック解除
func (bs *BlockService) UnblockUser(userID, blockerID string) error {
	return config.DB.Where("user_id = ? AND blocker_id = ?", userID, blockerID).
		Delete(&models.UserBlock{}).Error
}

// GetBlockList ブロックリストを取得
func (bs *BlockService) GetBlockList(userID string) ([]models.UserBlock, error) {
	var blocks []models.UserBlock
	if err := config.DB.Where("user_id = ?", userID).Find(&blocks).Error; err != nil {
		return nil, err
	}
	return blocks, nil
}

// ReportService 通報関連のビジネスロジック
type ReportService struct{}

// CreateReport 通報を作成
func (rs *ReportService) CreateReport(userID string, postID int, reason string) error {
	if reason == "" {
		return errors.New("reason is required")
	}

	report := models.Report{
		UserID:     userID,
		PostID:     postID,
		Reason:     reason,
		ReportDate: time.Now(),
		Status:     "pending",
	}
	return config.DB.Create(&report).Error
}

// ContactService 問い合わせ関連のビジネスロジック
type ContactService struct{}

// CreateContact 問い合わせを作成
func (cs *ContactService) CreateContact(userID, subject, text string) error {
	if subject == "" || text == "" {
		return errors.New("subject and text are required")
	}

	contact := models.Contact{
		UserID:  userID,
		Subject: subject,
		Text:    text,
		Status:  "pending",
	}
	return config.DB.Create(&contact).Error
}

// BusinessApplicationService 事業者申請関連のビジネスロジック
type BusinessApplicationService struct{}

// CreateBusinessApplication 事業者申請を作成
func (bas *BusinessApplicationService) CreateBusinessApplication(userID, businessName, address, phone string) error {
	if businessName == "" || address == "" || phone == "" {
		return errors.New("businessName, address, and phone are required")
	}

	app := models.BusinessApplication{
		UserID:       userID,
		BusinessName: businessName,
		Address:      address,
		Phone:        phone,
		Status:       "pending",
	}
	return config.DB.Create(&app).Error
}
