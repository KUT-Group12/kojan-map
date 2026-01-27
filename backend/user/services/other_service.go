package services

import (
	"errors"
	"time"

	"kojan-map/user/models"

	"gorm.io/gorm"
)

// BlockService ブロック関連のビジネスロジック
type BlockService struct {
	db *gorm.DB
}

func NewBlockService(db *gorm.DB) *BlockService {
	return &BlockService{db: db}
}

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
	result := bs.db.Where("blockerId = ? AND blockedId = ?", blockerID, userID).First(&existingBlock)
	if result.Error == nil {
		return errors.New("user already blocked")
	}
	if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("failed to check existing block")
	}

	block := models.UserBlock{
		BlockerId: blockerID,
		BlockedId: userID,
	}
	if err := bs.db.Create(&block).Error; err != nil {
		return errors.New("failed to block user")
	}
	return nil
}

// UnblockUser ブロック解除
func (bs *BlockService) UnblockUser(userID, blockerID string) error {
	if userID == "" || blockerID == "" {
		return errors.New("userID and blockerID are required")
	}

	result := bs.db.Where("blockerId = ? AND blockedId = ?", blockerID, userID).
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
	if err := bs.db.Where("blockerId = ?", userID).
		Find(&blocks).Error; err != nil {
		return nil, errors.New("failed to fetch block list")
	}
	return blocks, nil
}

// ReportService 通報関連のビジネスロジック
type ReportService struct {
	db *gorm.DB
}

func NewReportService(db *gorm.DB) *ReportService {
	return &ReportService{db: db}
}

// CreateReport 通報を作成
func (rs *ReportService) CreateReport(userID string, postID int32, reason string) error {
	if userID == "" || postID == 0 || reason == "" {
		return errors.New("userID, postID, and reason are required")
	}

	report := models.Report{
		UserID:     userID,
		PostID:     postID,
		Reason:     reason,
		Date:       time.Now(),
		ReportFlag: false,
		RemoveFlag: false,
	}
	return rs.db.Create(&report).Error
}

// ContactService 問い合わせ関連のビジネスロジック
type ContactService struct {
	db *gorm.DB
}

func NewContactService(db *gorm.DB) *ContactService {
	return &ContactService{db: db}
}

// CreateContact 問い合わせを作成
func (cs *ContactService) CreateContact(userID, subject, text string) error {
	if userID == "" || subject == "" || text == "" {
		return errors.New("userID, subject and text are required")
	}

	contact := models.Contact{
		AskUserID: userID,
		Date:      time.Now(),
		Subject:   subject,
		Text:      text,
		AskFlag:   false,
	}
	return cs.db.Create(&contact).Error
}

// BusinessApplicationService 事業者申請関連のビジネスロジック
type BusinessApplicationService struct {
	db *gorm.DB
}

func NewBusinessApplicationService(db *gorm.DB) *BusinessApplicationService {
	return &BusinessApplicationService{db: db}
}

// CreateBusinessApplication 事業者申請を作成
func (bas *BusinessApplicationService) CreateBusinessApplication(userID, name, address, phone string) error {
	if userID == "" || name == "" || address == "" {
		return errors.New("userID, name, and address are required")
	}

	app := models.BusinessRequest{
		UserID:  userID,
		Name:    name,
		Address: address,
		Phone:   phone,
	}
	return bas.db.Create(&app).Error
}
