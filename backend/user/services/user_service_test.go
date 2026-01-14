package services

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"kojan-map/user/config"
	"kojan-map/user/models"
)

// setupTestDB テスト用のインメモリDBを初期化
func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	assert.NoError(t, err)

	// マイグレーション
	err = db.AutoMigrate(
		&models.User{},
		&models.Session{},
		&models.Post{},
		&models.UserReaction{},
		&models.UserBlock{},
		&models.Report{},
		&models.Contact{},
		&models.BusinessApplication{},
	)
	assert.NoError(t, err)

	config.DB = db
	return db
}

func TestUserService_RegisterOrLogin_NewUser(t *testing.T) {
	db := setupTestDB(t)
	service := &UserService{}

	// 新規ユーザー登録
	session, err := service.RegisterOrLogin("google123", "test@example.com")

	assert.NoError(t, err)
	assert.NotNil(t, session)
	assert.NotEmpty(t, session.SessionID)

	// DBにユーザーが作成されたか確認
	var user models.User
	err = db.Where("id = ?", session.UserID).First(&user).Error
	assert.NoError(t, err)
	assert.Equal(t, "test@example.com", user.Email)
	assert.Equal(t, "user", user.Role)
}

func TestUserService_RegisterOrLogin_ExistingUser(t *testing.T) {
	db := setupTestDB(t)
	service := &UserService{}

	// 既存ユーザーを作成
	existingUser := models.User{
		ID:               uuid.New().String(),
		GoogleID:         "google456",
		Email:            "existing@example.com",
		Role:             "user",
		RegistrationDate: time.Now(),
	}
	db.Create(&existingUser)

	// 既存ユーザーでログイン
	session, err := service.RegisterOrLogin("google456", "existing@example.com")

	assert.NoError(t, err)
	assert.NotNil(t, session)
	assert.Equal(t, existingUser.ID, session.UserID)

	// ユーザー数が増えていないか確認
	var count int64
	db.Model(&models.User{}).Count(&count)
	assert.Equal(t, int64(1), count)
}

func TestUserService_RegisterOrLogin_ExtendSession(t *testing.T) {
	db := setupTestDB(t)
	service := &UserService{}

	// ユーザーとセッションを作成
	user := models.User{
		ID:               uuid.New().String(),
		GoogleID:         "google789",
		Email:            "session@example.com",
		Role:             "user",
		RegistrationDate: time.Now(),
	}
	db.Create(&user)

	oldSession := models.Session{
		ID:        uuid.New().String(),
		SessionID: uuid.New().String(),
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}
	db.Create(&oldSession)

	// 同じユーザーで再ログイン（セッション延長）
	newSession, err := service.RegisterOrLogin("google789", "session@example.com")

	assert.NoError(t, err)
	assert.NotNil(t, newSession)
	assert.Equal(t, oldSession.SessionID, newSession.SessionID)
	
	// セッション有効期限が延長されたか確認
	var updatedSession models.Session
	db.Where("session_id = ?", oldSession.SessionID).First(&updatedSession)
	assert.True(t, updatedSession.ExpiresAt.After(oldSession.ExpiresAt))
}

func TestUserService_RegisterOrLogin_ValidationError(t *testing.T) {
	setupTestDB(t)
	service := &UserService{}

	// GoogleIDが空の場合
	_, err := service.RegisterOrLogin("", "test@example.com")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "googleID is required")

	// Emailが空の場合
	_, err = service.RegisterOrLogin("google123", "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "email is required")
}

func TestUserService_GetUserInfo(t *testing.T) {
	db := setupTestDB(t)
	service := &UserService{}

	// テストユーザーを作成
	user := models.User{
		ID:               uuid.New().String(),
		GoogleID:         "google_info",
		Email:            "info@example.com",
		Role:             "user",
		RegistrationDate: time.Now(),
	}
	db.Create(&user)

	// ユーザー情報取得
	userInfo, err := service.GetUserInfo("google_info")

	assert.NoError(t, err)
	assert.NotNil(t, userInfo)
	assert.Equal(t, user.ID, userInfo.UserID)
	assert.Equal(t, "info@example.com", userInfo.Email)
	assert.Equal(t, "user", userInfo.Role)
}

func TestUserService_GetUserInfo_NotFound(t *testing.T) {
	setupTestDB(t)
	service := &UserService{}

	// 存在しないユーザー
	_, err := service.GetUserInfo("nonexistent")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "user not found")
}

func TestUserService_DeleteUser(t *testing.T) {
	db := setupTestDB(t)
	service := &UserService{}

	// テストユーザーと関連データを作成
	user := models.User{
		ID:               uuid.New().String(),
		GoogleID:         "google_delete",
		Email:            "delete@example.com",
		Role:             "user",
		RegistrationDate: time.Now(),
	}
	db.Create(&user)

	session := models.Session{
		ID:        uuid.New().String(),
		SessionID: uuid.New().String(),
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	db.Create(&session)

	// ユーザー削除
	err := service.DeleteUser("google_delete")
	assert.NoError(t, err)

	// ユーザーが削除されたか確認
	var deletedUser models.User
	err = db.Where("google_id = ?", "google_delete").First(&deletedUser).Error
	assert.Error(t, err)

	// セッションも削除されたか確認
	var deletedSession models.Session
	err = db.Where("user_id = ?", user.ID).First(&deletedSession).Error
	assert.Error(t, err)
}

func TestUserService_DeleteUser_NotFound(t *testing.T) {
	setupTestDB(t)
	service := &UserService{}

	// 存在しないユーザーの削除
	err := service.DeleteUser("nonexistent")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "user not found")
}

func TestUserService_GetUserByID(t *testing.T) {
	db := setupTestDB(t)
	service := &UserService{}

	// テストユーザーを作成
	user := models.User{
		ID:               uuid.New().String(),
		GoogleID:         "google_id_test",
		Email:            "byid@example.com",
		Role:             "user",
		RegistrationDate: time.Now(),
	}
	db.Create(&user)

	// ユーザーをIDで取得
	retrieved, err := service.GetUserByID(user.ID)
	assert.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, user.ID, retrieved.ID)
	assert.Equal(t, "byid@example.com", retrieved.Email)
}

func TestUserService_GetUserByID_NotFound(t *testing.T) {
	setupTestDB(t)
	service := &UserService{}

	// 存在しないユーザーID
	_, err := service.GetUserByID("nonexistent-id")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "user not found")
}

func TestUserService_GetUserByID_ValidationError(t *testing.T) {
	setupTestDB(t)
	service := &UserService{}

	// 空のユーザーID
	_, err := service.GetUserByID("")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "userID is required")
}

func TestUserService_Logout(t *testing.T) {
	db := setupTestDB(t)
	service := &UserService{}

	// セッションを作成
	session := models.Session{
		ID:        uuid.New().String(),
		SessionID: uuid.New().String(),
		UserID:    uuid.New().String(),
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	db.Create(&session)

	// ログアウト実行
	err := service.Logout(session.SessionID)
	assert.NoError(t, err)

	// セッションが削除されたか確認
	var deletedSession models.Session
	err = db.Where("session_id = ?", session.SessionID).First(&deletedSession).Error
	assert.Error(t, err)
}

func TestUserService_Logout_NotFound(t *testing.T) {
	setupTestDB(t)
	service := &UserService{}

	// 存在しないセッションID
	err := service.Logout("nonexistent-session")
	// 存在しないセッションをログアウトするとエラー
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "session not found")
}
