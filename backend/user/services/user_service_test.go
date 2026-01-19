package services

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/glebarez/sqlite"
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
		&models.Genre{},
		&models.Place{},
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
	err = db.Where("googleId = ?", session.GoogleID).First(&user).Error
	assert.NoError(t, err)
	assert.Equal(t, "test@example.com", user.Gmail)
	assert.Equal(t, "user", user.Role)
}

func TestUserService_RegisterOrLogin_ExistingUser(t *testing.T) {
	db := setupTestDB(t)
	service := &UserService{}

	// 既存ユーザーを作成
	existingUser := models.User{
		ID:               uuid.New().String(),
		GoogleID:         "google456",
		Gmail:            "existing@example.com",
		Role:             "user",
		RegistrationDate: time.Now(),
	}
	db.Create(&existingUser)

	// 既存ユーザーでログイン
	session, err := service.RegisterOrLogin("google456", "existing@example.com")

	assert.NoError(t, err)
	assert.NotNil(t, session)
	assert.Equal(t, "google456", session.GoogleID)

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
		Gmail:            "session@example.com",
		Role:             "user",
		RegistrationDate: time.Now(),
	}
	db.Create(&user)

	oldSession := models.Session{
		SessionID: uuid.New().String(),
		GoogleID:  "google789",
		Expiry:    time.Now().Add(1 * time.Hour),
	}
	db.Create(&oldSession)

	// 同じユーザーで再ログイン（セッション延長）
	newSession, err := service.RegisterOrLogin("google789", "session@example.com")

	assert.NoError(t, err)
	assert.NotNil(t, newSession)
	assert.Equal(t, oldSession.SessionID, newSession.SessionID)

	// セッション有効期限が延長されたか確認
	var updatedSession models.Session
	db.Where("sessionId = ?", oldSession.SessionID).First(&updatedSession)
	assert.True(t, updatedSession.Expiry.After(oldSession.Expiry))
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
		Gmail:            "info@example.com",
		Role:             "user",
		RegistrationDate: time.Now(),
	}
	db.Create(&user)

	// ユーザー情報取得
	userInfo, err := service.GetUserInfo("google_info")

	assert.NoError(t, err)
	assert.NotNil(t, userInfo)
	assert.Equal(t, user.ID, userInfo.UserID)
	assert.Equal(t, "info@example.com", userInfo.Gmail)
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
		Gmail:            "delete@example.com",
		Role:             "user",
		RegistrationDate: time.Now(),
	}
	db.Create(&user)

	session := models.Session{
		SessionID: uuid.New().String(),
		GoogleID:  "google_delete",
		Expiry:    time.Now().Add(24 * time.Hour),
	}
	db.Create(&session)

	// ユーザー削除
	err := service.DeleteUser("google_delete")
	assert.NoError(t, err)

	// ユーザーが削除されたか確認
	var deletedUser models.User
	err = db.Where("googleId = ?", "google_delete").First(&deletedUser).Error
	assert.Error(t, err)

	// セッションも削除されたか確認
	var sessions []models.Session
	db.Where("googleId = ?", "google_delete").Find(&sessions)
	if len(sessions) > 0 {
		for _, s := range sessions {
			assert.True(t, time.Now().After(s.Expiry) || time.Now().Equal(s.Expiry))
		}
	}
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
		Gmail:            "byid@example.com",
		Role:             "user",
		RegistrationDate: time.Now(),
	}
	db.Create(&user)

	// ユーザーをIDで取得
	retrieved, err := service.GetUserByID(user.ID)
	assert.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, user.ID, retrieved.ID)
	assert.Equal(t, "byid@example.com", retrieved.Gmail)
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
	sessionID := uuid.New().String()
	session := models.Session{
		SessionID: sessionID,
		GoogleID:  "google_logout",
		Expiry:    time.Now().Add(24 * time.Hour),
	}
	db.Create(&session)

	// ログアウト実行
	err := service.Logout(sessionID)
	assert.NoError(t, err)

	// セッションが無効化されたか確認（RevokedAtが設定されている）
	var revokedSession models.Session
	err = db.Where("sessionId = ?", sessionID).First(&revokedSession).Error
	assert.NoError(t, err)
	// expiry を現在時刻に更新して無効化する仕様
	assert.True(t, time.Now().After(revokedSession.Expiry) || time.Now().Equal(revokedSession.Expiry))
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

// TestUserService_RegisterOrLogin_GetUserInfo - ユーザー登録と情報取得
func TestUserService_RegisterOrLogin_GetUserInfo(t *testing.T) {
	db := setupTestDB(t)
	defer func() {
		if err := db.Migrator().DropTable(&models.User{}, &models.Session{}, &models.Post{}); err != nil {
			t.Logf("Failed to drop table: %v", err)
		}
	}()

	service := &UserService{}

	// ユーザーを登録
	session, err := service.RegisterOrLogin("google456", "mypage@example.com")
	assert.NoError(t, err)
	assert.NotNil(t, session)

	// ユーザー情報を取得
	userInfo, err := service.GetUserInfo("google456")
	assert.NoError(t, err)
	assert.NotNil(t, userInfo)

	// ユーザーID確認
	assert.NotEmpty(t, userInfo.UserID)
}

// TestUserService_GetMyPageDetails_WithPosts - マイページ詳細情報（投稿あり）
func TestUserService_GetMyPageDetails_WithPosts(t *testing.T) {
	db := setupTestDB(t)
	defer func() {
		if err := db.Migrator().DropTable(&models.User{}, &models.Session{}, &models.Post{}); err != nil {
			t.Logf("Failed to drop table: %v", err)
		}
	}()

	service := &UserService{}

	// ユーザーを登録
	session, err := service.RegisterOrLogin("google789", "mypage2@example.com")
	assert.NoError(t, err)
	assert.NotNil(t, session)

	// ユーザー情報を取得
	userInfo, err := service.GetUserInfo("google789")
	assert.NoError(t, err)
	assert.NotNil(t, userInfo)

	// ユーザーが複数の投稿を作成
	posts := []models.Post{
		{
			UserID:   userInfo.UserID,
			Title:    "My Post 1",
			Text:     "Content 1",
			PlaceID:  1,
			GenreID:  1,
			PostDate: time.Now(),
		},
		{
			UserID:   userInfo.UserID,
			Title:    "My Post 2",
			Text:     "Content 2",
			PlaceID:  1,
			GenreID:  1,
			PostDate: time.Now(),
		},
	}
	for _, post := range posts {
		db.Create(&post)
	}

	// ユーザーのポスト数を確認
	var postCount int64
	db.Model(&models.Post{}).Where("userId = ?", userInfo.UserID).Count(&postCount)
	assert.Equal(t, int64(2), postCount)
}
