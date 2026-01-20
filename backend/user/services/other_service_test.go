package services

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"kojan-map/user/config"
	"kojan-map/user/models"
)

func TestBlockService_BlockUser(t *testing.T) {
	db := setupTestDB(t)
	service := &BlockService{}

	// テストユーザーを作成（外部キー制約対応）
	blocker := models.User{ID: "blocker123", GoogleID: "blocker123", Gmail: "blocker@example.com", Role: "user"}
	blocked := models.User{ID: "blocked456", GoogleID: "blocked456", Gmail: "blocked@example.com", Role: "user"}
	db.Create(&blocker)
	db.Create(&blocked)

	// ユーザーをブロック
	err := service.BlockUser("blocked456", "blocker123")
	assert.NoError(t, err)

	// ブロックが記録されたか確認
	var block models.UserBlock
	err = db.Where("blockerId = ? AND blockedId = ?", "blocker123", "blocked456").First(&block).Error
	assert.NoError(t, err)
	assert.Equal(t, "blocker123", block.BlockerId)
	assert.Equal(t, "blocked456", block.BlockedId)
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

	// テストユーザーを作成（外部キー制約対応）
	blocker := models.User{ID: "blocker123", GoogleID: "blocker123", Gmail: "blocker@example.com", Role: "user"}
	blocked := models.User{ID: "blocked456", GoogleID: "blocked456", Gmail: "blocked@example.com", Role: "user"}
	db.Create(&blocker)
	db.Create(&blocked)

	// 初回ブロック
	block := models.UserBlock{
		BlockedId: "blocked456",
		BlockerId: "blocker123",
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

	// テストユーザーを作成（外部キー制約対応）
	blocker := models.User{ID: "blocker123", GoogleID: "blocker123", Gmail: "blocker@example.com", Role: "user"}
	blocked := models.User{ID: "blocked456", GoogleID: "blocked456", Gmail: "blocked@example.com", Role: "user"}
	db.Create(&blocker)
	db.Create(&blocked)

	// ブロックを作成
	block := models.UserBlock{
		BlockedId: "blocked456",
		BlockerId: "blocker123",
	}
	db.Create(&block)

	// ブロック解除
	err := service.UnblockUser("blocked456", "blocker123")
	assert.NoError(t, err)

	// ブロックが削除されたか確認
	var deletedBlock models.UserBlock
	err = db.Where("blockerId = ? AND blockedId = ?", "blocker123", "blocked456").First(&deletedBlock).Error
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

	// ブロッカーユーザーを作成（外部キー制約対応）
	blocker := models.User{ID: "blocker123", GoogleID: "blocker123", Gmail: "blocker@example.com", Role: "user"}
	otherUser := models.User{ID: "other_user", GoogleID: "other_user", Gmail: "other@example.com", Role: "user"}
	db.Create(&blocker)
	db.Create(&otherUser)

	// テストユーザーを作成
	users := []models.User{
		{ID: uuid.New().String(), GoogleID: "blocked1", Gmail: "blocked1@example.com", Role: "user"},
		{ID: uuid.New().String(), GoogleID: "blocked2", Gmail: "blocked2@example.com", Role: "user"},
		{ID: uuid.New().String(), GoogleID: "blocked3", Gmail: "blocked3@example.com", Role: "user"},
	}
	for _, u := range users {
		db.Create(&u)
	}

	// ブロックを作成
	blocks := []models.UserBlock{
		{BlockerId: "blocker123", BlockedId: users[0].ID},
		{BlockerId: "blocker123", BlockedId: users[1].ID},
		{BlockerId: "other_user", BlockedId: users[2].ID},
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

	// FK 満たすためのユーザー作成
	config.DB.Create(&models.User{ID: "reporter123", GoogleID: "google_reporter", Gmail: "reporter@example.com", Role: "general", RegistrationDate: time.Now(), CreatedAt: time.Now(), UpdatedAt: time.Now()})

	// 通報を作成
	err := service.CreateReport("reporter123", int32(100), "不適切な内容")
	assert.NoError(t, err)
}

func TestReportService_CreateReport_ValidationError(t *testing.T) {
	setupTestDB(t)
	service := &ReportService{}

	// FK 満たすためのユーザー作成
	config.DB.Create(&models.User{ID: "reporter123", GoogleID: "google_reporter", Gmail: "reporter@example.com", Role: "general", RegistrationDate: time.Now(), CreatedAt: time.Now(), UpdatedAt: time.Now()})

	// Reasonが空
	err := service.CreateReport("", 0, "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "required")
}

func TestContactService_CreateContact(t *testing.T) {
	setupTestDB(t)
	service := &ContactService{}
	config.DB.Create(&models.User{ID: "sender123", GoogleID: "google_sender", Gmail: "sender@example.com", Role: "general", RegistrationDate: time.Now(), CreatedAt: time.Now(), UpdatedAt: time.Now()})

	// お問い合わせを作成
	err := service.CreateContact("sender123", "質問", "これは質問です")
	assert.NoError(t, err)
}

func TestContactService_CreateContact_ValidationError(t *testing.T) {
	setupTestDB(t)
	service := &ContactService{}
	config.DB.Create(&models.User{ID: "sender123", GoogleID: "google_sender", Gmail: "sender@example.com", Role: "general", RegistrationDate: time.Now(), CreatedAt: time.Now(), UpdatedAt: time.Now()})

	// Subjectが空
	err := service.CreateContact("", "", "メッセージ")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "required")
}

func TestBusinessApplicationService_CreateApplication(t *testing.T) {
	setupTestDB(t)
	service := &BusinessApplicationService{}
	config.DB.Create(&models.User{ID: "applicant123", GoogleID: "google_applicant", Gmail: "applicant@example.com", Role: "general", RegistrationDate: time.Now(), CreatedAt: time.Now(), UpdatedAt: time.Now()})

	// 企業会員申請を作成
	err := service.CreateBusinessApplication("applicant123", "テスト株式会社", "テスト株式会社", "1234567", "東京都渋谷区", "09012345678")
	assert.NoError(t, err)
}

func TestBusinessApplicationService_CreateApplication_ValidationError(t *testing.T) {
	setupTestDB(t)
	service := &BusinessApplicationService{}
	config.DB.Create(&models.User{ID: "applicant123", GoogleID: "google_applicant", Gmail: "applicant@example.com", Role: "general", RegistrationDate: time.Now(), CreatedAt: time.Now(), UpdatedAt: time.Now()})

	// BusinessNameが空
	err := service.CreateBusinessApplication("applicant123", "", "", "1234567", "東京都渋谷区", "09012345678")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "all fields are required")
}
