package services

import (
	"github.com/stretchr/testify/assert"
	"kojan-map/user/models"
	"testing"
	"time"
)

func TestBlockService_BlockUser(t *testing.T) {
	db := setupTestDB(t)
	cleanupDB(db)
	service := NewBlockService(db)

	// テストユーザーを作成（外部キー制約対応）
	blocker := models.User{GoogleID: "blocker123", Gmail: "blocker@example.com", Role: "user", RegistrationDate: time.Now()}
	blocked := models.User{GoogleID: "blocked456", Gmail: "blocked@example.com", Role: "user", RegistrationDate: time.Now()}
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
	db := setupTestDB(t)
	cleanupDB(db)
	service := NewBlockService(db)

	// 自分自身をブロック
	err := service.BlockUser("user123", "user123")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "cannot block yourself")
}

func TestBlockService_BlockUser_Duplicate(t *testing.T) {
	db := setupTestDB(t)
	cleanupDB(db)
	service := NewBlockService(db)

	// テストユーザーを作成（外部キー制約対応）
	blocker := models.User{GoogleID: "blocker123", Gmail: "blocker@example.com", Role: "user", RegistrationDate: time.Now()}
	blocked := models.User{GoogleID: "blocked456", Gmail: "blocked@example.com", Role: "user", RegistrationDate: time.Now()}
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
	cleanupDB(db)
	service := NewBlockService(db)

	// テストユーザーを作成（外部キー制約対応）
	blocker := models.User{GoogleID: "blocker123", Gmail: "blocker@example.com", Role: "user", RegistrationDate: time.Now()}
	blocked := models.User{GoogleID: "blocked456", Gmail: "blocked@example.com", Role: "user", RegistrationDate: time.Now()}
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
	db := setupTestDB(t)
	cleanupDB(db)
	service := NewBlockService(db)

	// 存在しないブロックの解除
	err := service.UnblockUser("blocked456", "blocker123")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "not found")
}

func TestBlockService_GetBlockList(t *testing.T) {
	db := setupTestDB(t)
	cleanupDB(db)
	service := NewBlockService(db)

	// ブロッカーユーザーを作成（外部キー制約対応）
	blocker := models.User{GoogleID: "blocker123", Gmail: "blocker@example.com", Role: "user", RegistrationDate: time.Now()}
	otherUser := models.User{GoogleID: "other_user", Gmail: "other@example.com", Role: "user", RegistrationDate: time.Now()}
	db.Create(&blocker)
	db.Create(&otherUser)

	// テストユーザーを作成
	users := []models.User{
		{GoogleID: "blocked1", Gmail: "blocked1@example.com", Role: "user", RegistrationDate: time.Now()},
		{GoogleID: "blocked2", Gmail: "blocked2@example.com", Role: "user", RegistrationDate: time.Now()},
		{GoogleID: "blocked3", Gmail: "blocked3@example.com", Role: "user", RegistrationDate: time.Now()},
	}
	for _, u := range users {
		db.Create(&u)
	}

	// ブロックを作成
	blocks := []models.UserBlock{
		{BlockerId: "blocker123", BlockedId: users[0].GoogleID},
		{BlockerId: "blocker123", BlockedId: users[1].GoogleID},
		{BlockerId: "other_user", BlockedId: users[2].GoogleID},
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
	db := setupTestDB(t)
	cleanupDB(db)
	service := NewReportService(db)

	// FK 満たすためのユーザー・投稿作成
	db.Create(&models.User{GoogleID: "google_reporter", Gmail: "reporter@example.com", Role: "user", RegistrationDate: time.Now()})
	db.Create(&models.Post{ID: 100, UserID: "google_reporter", Title: "test", Text: "test", PostDate: time.Now()})

	// 通報を作成
	err := service.CreateReport("google_reporter", int32(100), "不適切な内容")
	assert.NoError(t, err)
}

func TestReportService_CreateReport_ValidationError(t *testing.T) {
	db := setupTestDB(t)
	cleanupDB(db)
	service := NewReportService(db)

	// FK 満たすためのユーザー作成
	db.Create(&models.User{GoogleID: "google_reporter", Gmail: "reporter@example.com", Role: "user", RegistrationDate: time.Now()})

	// Reasonが空
	err := service.CreateReport("", 0, "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "required")
}

func TestContactService_CreateContact(t *testing.T) {
	db := setupTestDB(t)
	cleanupDB(db)
	service := NewContactService(db)
	db.Create(&models.User{GoogleID: "google_sender", Gmail: "sender@example.com", Role: "user", RegistrationDate: time.Now()})

	// お問い合わせを作成
	err := service.CreateContact("google_sender", "質問", "これは質問です")
	assert.NoError(t, err)
}

func TestContactService_CreateContact_ValidationError(t *testing.T) {
	db := setupTestDB(t)
	cleanupDB(db)
	service := NewContactService(db)
	db.Create(&models.User{GoogleID: "google_sender", Gmail: "sender@example.com", Role: "user", RegistrationDate: time.Now()})

	// Subjectが空
	err := service.CreateContact("", "", "メッセージ")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "required")
}

func TestBusinessApplicationService_CreateApplication(t *testing.T) {
	db := setupTestDB(t)
	cleanupDB(db)
	service := NewBusinessApplicationService(db)
	db.Create(&models.User{GoogleID: "google_applicant", Gmail: "applicant@example.com", Role: "user", RegistrationDate: time.Now()})

	// 企業会員申請を作成
	err := service.CreateBusinessApplication("google_applicant", "テスト株式会社", "東京都渋谷区", "09012345678")
	assert.NoError(t, err)
}

func TestBusinessApplicationService_CreateApplication_ValidationError(t *testing.T) {
	db := setupTestDB(t)
	cleanupDB(db)
	service := NewBusinessApplicationService(db)
	db.Create(&models.User{GoogleID: "google_applicant", Gmail: "applicant@example.com", Role: "user", RegistrationDate: time.Now()})

	// BusinessNameが空
	err := service.CreateBusinessApplication("google_applicant", "", "東京都渋谷区", "09012345678")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "userID, name, and address are required")
}
