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
	if userID == "" || blockerID == "" {
		return errors.New("userID and blockerID are required")
	}

	if userID == blockerID {
		return errors.New("cannot block yourself")
	}

	// 既にブロック済みか確認
	var existingBlock models.UserBlock
	result := config.DB.Where("blockerId = ? AND blockedId = ?", blockerID, userID).First(&existingBlock)
	if result.Error == nil {
		return errors.New("user already blocked")
	}

	block := models.UserBlock{
		BlockerId: blockerID,
		BlockedId: userID,
	}
	if err := config.DB.Create(&block).Error; err != nil {
		return errors.New("failed to block user")
	}
	return nil
}

// UnblockUser ブロック解除
func (bs *BlockService) UnblockUser(userID, blockerID string) error {
	if userID == "" || blockerID == "" {
		return errors.New("userID and blockerID are required")
	}

	result := config.DB.Where("blockerId = ? AND blockedId = ?", blockerID, userID).
		Delete(&models.UserBlock{})

	if result.Error != nil {
		return errors.New("failed to unblock user")
	}
	if result.RowsAffected == 0 {
		return errors.New("block relationship not found")
	}

	return nil
}

// GetBlockList ブロックリストを取得
func (bs *BlockService) GetBlockList(userID string) ([]models.UserBlock, error) {
	if userID == "" {
		return nil, errors.New("userID is required")
	}

	var blocks []models.UserBlock
	if err := config.DB.Where("blockerId = ?", userID).
		Find(&blocks).Error; err != nil {
		return nil, errors.New("failed to fetch block list")
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
		Date:       time.Now(),
		ReportFlag: false,
		RemoveFlag: false,
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
		AskUserID: userID,
		Date:      time.Now(),
		Subject:   subject,
		Text:      text,
		AskFlag:   false,
	}
	return config.DB.Create(&contact).Error
}

// BusinessApplicationService 事業者申請関連のビジネスロジック
type BusinessApplicationService struct{}

// CreateBusinessApplication 事業者申請を作成
func (bas *BusinessApplicationService) CreateBusinessApplication(userID, businessName, kanaBusinessName string, zipCode int, address string, phone string) error {
	if businessName == "" || kanaBusinessName == "" || address == "" || zipCode == 0 || phone == "" {
		return errors.New("all fields are required")
	}

	app := models.BusinessApplication{
		UserID:           userID,
		BusinessName:     businessName,
		KanaBusinessName: kanaBusinessName,
		ZipCode:          zipCode,
		Address:          address,
		Phone:            phone,
		RegistDate:       time.Now(),
	}
	return config.DB.Create(&app).Error
}
