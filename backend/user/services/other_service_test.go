package services

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"kojan-map/user/models"
)

func TestBlockService_BlockUser(t *testing.T) {
	db := setupTestDB(t)
	service := &BlockService{}

	// ユーザーをブロック
	err := service.BlockUser("blocked456", "blocker123")
	assert.NoError(t, err)

	// ブロックが記録されたか確認
	var block models.UserBlock
	err = db.Where("user_id = ? AND blocker_id = ?", "blocked456", "blocker123").First(&block).Error
	assert.NoError(t, err)
	assert.Equal(t, "blocker123", block.BlockerID)
	assert.Equal(t, "blocked456", block.UserID)
}

func TestBlockService_BlockUser_SelfBlock(t *testing.T) {
	setupTestDB(t)
	service := &BlockService{}

	// 自分自身をブロック
	err := service.BlockUser("user123", "user123")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "cannot block yourself")
}

func TestBlockService_BlockUser_Duplicate(t *testing.T) {
	db := setupTestDB(t)
	service := &BlockService{}

	// 初回ブロック
	block := models.UserBlock{
		UserID:    "blocked456",
		BlockerID: "blocker123",
		CreatedAt: time.Now(),
	}
	db.Create(&block)

	// 重複ブロック
	err := service.BlockUser("blocked456", "blocker123")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "already blocked")
}

func TestBlockService_UnblockUser(t *testing.T) {
	db := setupTestDB(t)
	service := &BlockService{}

	// ブロックを作成
	block := models.UserBlock{
		UserID:    "blocked456",
		BlockerID: "blocker123",
		CreatedAt: time.Now(),
	}
	db.Create(&block)

	// ブロック解除
	err := service.UnblockUser("blocked456", "blocker123")
	assert.NoError(t, err)

	// ブロックが削除されたか確認
	var deletedBlock models.UserBlock
	err = db.Where("user_id = ? AND blocker_id = ?", "blocked456", "blocker123").First(&deletedBlock).Error
	assert.Error(t, err)
}

func TestBlockService_UnblockUser_NotFound(t *testing.T) {
	setupTestDB(t)
	service := &BlockService{}

	// 存在しないブロックの解除
	err := service.UnblockUser("blocked456", "blocker123")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "not found")
}

func TestBlockService_GetBlockList(t *testing.T) {
	db := setupTestDB(t)
	service := &BlockService{}

	// テストユーザーを作成
	users := []models.User{
		{ID: uuid.New().String(), GoogleID: "blocked1", Email: "blocked1@example.com", Role: "user"},
		{ID: uuid.New().String(), GoogleID: "blocked2", Email: "blocked2@example.com", Role: "user"},
		{ID: uuid.New().String(), GoogleID: "blocked3", Email: "blocked3@example.com", Role: "user"},
	}
	for _, u := range users {
		db.Create(&u)
	}

	// ブロックを作成
	blocks := []models.UserBlock{
		{BlockerID: "blocker123", UserID: users[0].ID, CreatedAt: time.Now()},
		{BlockerID: "blocker123", UserID: users[1].ID, CreatedAt: time.Now()},
		{BlockerID: "other_user", UserID: users[2].ID, CreatedAt: time.Now()}, // 別ユーザー
	}
	for _, b := range blocks {
		db.Create(&b)
	}

	// ブロックリスト取得
	blockList, err := service.GetBlockList("blocker123")
	assert.NoError(t, err)
	assert.Equal(t, 2, len(blockList))
}

func TestReportService_CreateReport(t *testing.T) {
	setupTestDB(t)
	service := &ReportService{}

	// 通報を作成
	err := service.CreateReport("reporter123", 100, "不適切な内容")
	assert.NoError(t, err)
}

func TestReportService_CreateReport_ValidationError(t *testing.T) {
	setupTestDB(t)
	service := &ReportService{}

	// Reasonが空
	err := service.CreateReport("reporter123", 100, "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "reason is required")
}

func TestContactService_CreateContact(t *testing.T) {
	setupTestDB(t)
	service := &ContactService{}

	// お問い合わせを作成
	err := service.CreateContact("sender123", "質問", "これは質問です")
	assert.NoError(t, err)
}

func TestContactService_CreateContact_ValidationError(t *testing.T) {
	setupTestDB(t)
	service := &ContactService{}

	// Subjectが空
	err := service.CreateContact("sender123", "", "メッセージ")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "subject and text are required")
}

func TestBusinessApplicationService_CreateApplication(t *testing.T) {
	setupTestDB(t)
	service := &BusinessApplicationService{}

	// 企業会員申請を作成
	err := service.CreateBusinessApplication("applicant123", "テスト株式会社", "東京都渋谷区", "090-1234-5678")
	assert.NoError(t, err)
}

func TestBusinessApplicationService_CreateApplication_ValidationError(t *testing.T) {
	setupTestDB(t)
	service := &BusinessApplicationService{}

	// BusinessNameが空
	err := service.CreateBusinessApplication("applicant123", "", "東京都渋谷区", "090-1234-5678")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "businessName, address, and phone are required")
}
