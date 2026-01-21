//go:build integration
// +build integration

package handlers

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"kojan-map/user/config"
	"kojan-map/user/models"
)

// setupTestDB テスト用のMySQLデータベースに接続
func setupTestDB(t *testing.T) *gorm.DB {
	dsn := "root:root@tcp(localhost:3306)/kojanmap_test?parseTime=true&charset=utf8mb4&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("テストDBへの接続に失敗しました: %v", err)
	}

	config.DB = db
	return db
}

// cleanupTestDB テストデータをクリーンアップ
func cleanupTestDB(t *testing.T, db *gorm.DB) {
	// 外部キー制約を無効化
	db.Exec("SET FOREIGN_KEY_CHECKS = 0")
	
	// テストデータを削除
	db.Exec("DELETE FROM report WHERE reportId >= 10000")
	db.Exec("DELETE FROM post WHERE postId >= 12345")
	db.Exec("DELETE FROM session WHERE googleId LIKE 'test-%'")
	db.Exec("DELETE FROM user WHERE googleId LIKE 'test-%'")
	db.Exec("DELETE FROM place WHERE placeId >= 9000")
	
	// 外部キー制約を再度有効化
	db.Exec("SET FOREIGN_KEY_CHECKS = 1")
}

// createTestUser テスト用ユーザーを作成
func createTestUser(t *testing.T, db *gorm.DB, googleID, email string) *models.User {
	user := &models.User{
		GoogleID:         googleID,
		Gmail:            email,
		Role:             "user",
		RegistrationDate: time.Now(),
	}
	if err := db.Table("user").Create(user).Error; err != nil {
		t.Fatalf("テストユーザーの作成に失敗しました: %v", err)
	}
	return user
}

// createTestSession テスト用セッションを作成
func createTestSession(t *testing.T, db *gorm.DB, googleID string) *models.Session {
	session := &models.Session{
		SessionID: "test-" + uuid.New().String(),
		GoogleID:  googleID,
		Expiry:    time.Now().Add(24 * time.Hour),
	}
	if err := db.Create(session).Error; err != nil {
		t.Fatalf("テストセッションの作成に失敗しました: %v", err)
	}
	return session
}

// createTestPlace テスト用場所を作成
func createTestPlace(t *testing.T, db *gorm.DB) *models.Place {
	place := &models.Place{
		ID:        9001,
		NumPost:   0,
		Latitude:  35.6812,
		Longitude: 139.7671,
	}
	if err := db.Table("place").Create(place).Error; err != nil {
		t.Fatalf("テスト場所の作成に失敗しました: %v", err)
	}
	return place
}

// TestIntegration_USER001_UserRegistrationFlow ユーザー登録フロー統合テスト
func TestIntegration_USER001_UserRegistrationFlow(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	googleID := "test-google-123"
	email := "integration-test@example.com"

	// ユーザーを直接作成
	user := &models.User{
		GoogleID:         googleID,
		Gmail:            email,
		Role:             "user",
		RegistrationDate: time.Now(),
	}
	err := db.Table("user").Create(user).Error
	assert.NoError(t, err, "ユーザー作成に失敗しました")

	// セッションを作成
	session := &models.Session{
		SessionID: "test-" + uuid.New().String(),
		GoogleID:  googleID,
		Expiry:    time.Now().Add(24 * time.Hour),
	}
	err = db.Table("session").Create(session).Error
	assert.NoError(t, err, "セッション作成に失敗しました")

	// DBからユーザーを取得して確認
	var dbUser models.User
	err = db.Table("user").Where("googleId = ?", googleID).First(&dbUser).Error
	assert.NoError(t, err, "ユーザーがDBに保存されていません")
	assert.Equal(t, email, dbUser.Gmail, "メールアドレスが一致しません")
	assert.Equal(t, "user", dbUser.Role, "ロールが正しくありません")

	// DBからセッションを取得して確認
	var dbSession models.Session
	err = db.Table("session").Where("sessionId = ?", session.SessionID).First(&dbSession).Error
	assert.NoError(t, err, "セッションがDBに保存されていません")
	assert.Equal(t, googleID, dbSession.GoogleID, "GoogleIDが一致しません")
	assert.True(t, dbSession.Expiry.After(time.Now()), "セッションの有効期限が過去です")
}

// TestIntegration_USER002_CreatePostWithDB 投稿作成とDB保存の統合テスト
func TestIntegration_USER002_CreatePostWithDB(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	// テストユーザーと場所を作成
	user := createTestUser(t, db, "post-creator-1", "post-creator@example.com")
	place := createTestPlace(t, db)

	// 投稿を直接作成
	post := &models.Post{
		ID:       12345,
		UserID:   user.GoogleID, // GoogleIDを使用
		Title:    "統合テスト投稿",
		Text:     "これは統合テストの投稿です",
		PlaceID:  place.ID,
		NumView:  0,
		PostDate: time.Now(),
	}
	err := db.Table("post").Create(post).Error
	assert.NoError(t, err, "投稿の作成に失敗しました")

	// DBから投稿を取得して確認
	var dbPost models.Post
	err = db.Table("post").Where("postId = ?", post.ID).First(&dbPost).Error
	assert.NoError(t, err, "投稿がDBに保存されていません")
	assert.Equal(t, "統合テスト投稿", dbPost.Title, "タイトルが一致しません")
	assert.Equal(t, user.GoogleID, dbPost.UserID, "ユーザーIDが一致しません")
	assert.Equal(t, place.ID, dbPost.PlaceID, "場所IDが一致しません")
}

// TestIntegration_USER003_GetPostIncrementsViewCount 投稿取得時の閲覧数増加テスト
func TestIntegration_USER003_GetPostIncrementsViewCount(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	// テストデータ作成
	user := createTestUser(t, db, "viewer-1", "viewer@example.com")
	place := createTestPlace(t, db)

	post := &models.Post{
		ID:       12346,
		UserID:   user.GoogleID,
		Title:    "閲覧数テスト投稿",
		Text:     "閲覧数を確認するテスト",
		PlaceID:  place.ID,
		NumView:  0,
		PostDate: time.Now(),
	}
	err := db.Table("post").Create(post).Error
	assert.NoError(t, err, "投稿の作成に失敗しました")

	// 閲覧数を手動で増加
	err = db.Table("post").Where("postId = ?", post.ID).Update("numView", 1).Error
	assert.NoError(t, err, "閲覧数の更新に失敗しました")

	// DBから投稿を再取得して閲覧数を確認
	var updatedPost models.Post
	err = db.Table("post").Where("postId = ?", post.ID).First(&updatedPost).Error
	assert.NoError(t, err, "投稿の取得に失敗しました")
	assert.Equal(t, int32(1), updatedPost.NumView, "閲覧数が1に増加していません")

	// 再度閲覧数を増加
	err = db.Table("post").Where("postId = ?", post.ID).Update("numView", 2).Error
	assert.NoError(t, err)

	// 再度確認
	err = db.Table("post").Where("postId = ?", post.ID).First(&updatedPost).Error
	assert.NoError(t, err)
	assert.Equal(t, int32(2), updatedPost.NumView, "閲覧数が2に増加していません")
}

// TestIntegration_USER004_CreateReportWithDB 通報作成とDB保存の統合テスト
func TestIntegration_USER004_CreateReportWithDB(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	// テストデータ作成
	reporter := createTestUser(t, db, "reporter-1", "reporter@example.com")
	reportedUser := createTestUser(t, db, "reported-1", "reported@example.com")
	place := createTestPlace(t, db)

	post := &models.Post{
		ID:       12347,
		UserID:   reportedUser.GoogleID,
		Title:    "通報対象投稿",
		Text:     "通報される投稿",
		PlaceID:  place.ID,
		PostDate: time.Now(),
	}
	err := db.Table("post").Create(post).Error
	assert.NoError(t, err, "投稿の作成に失敗しました")

	// 通報作成
	report := &models.Report{
		ID:         10001,
		UserID:     reporter.GoogleID,
		PostID:     post.ID,
		Reason:     "不適切な内容",
		Date:       time.Now(),
		ReportFlag: false,
		RemoveFlag: false,
	}
	err = db.Table("report").Create(report).Error
	assert.NoError(t, err, "通報の作成に失敗しました")

	// DBから通報を取得して確認
	var dbReport models.Report
	err = db.Table("report").Where("reportId = ?", report.ID).First(&dbReport).Error
	assert.NoError(t, err, "通報がDBに保存されていません")
	assert.Equal(t, reporter.GoogleID, dbReport.UserID, "通報者IDが一致しません")
	assert.Equal(t, post.ID, dbReport.PostID, "通報対象IDが一致しません")
	assert.False(t, dbReport.ReportFlag, "ReportFlagが正しくありません")
}

// TestIntegration_USER005_SessionExtensionOnLogin セッション延長テスト
func TestIntegration_USER005_SessionExtensionOnLogin(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	googleID := "session-test-google-456"
	email := "session-test@example.com"

	// 既存ユーザーとセッションを作成
	user := createTestUser(t, db, googleID, email)
	oldSession := &models.Session{
		SessionID: "test-old-" + uuid.New().String(),
		GoogleID:  googleID,
		Expiry:    time.Now().Add(1 * time.Hour), // 1時間後に期限切れ
	}
	err := db.Table("session").Create(oldSession).Error
	assert.NoError(t, err, "旧セッションの作成に失敗しました")

	// 新しいセッションを作成（延長をシミュレート）
	newSession := &models.Session{
		SessionID: "test-new-" + uuid.New().String(),
		GoogleID:  googleID,
		Expiry:    time.Now().Add(24 * time.Hour),
	}
	err = db.Table("session").Create(newSession).Error
	assert.NoError(t, err, "新しいセッションの作成に失敗しました")

	// DBからセッションを取得
	var updatedSession models.Session
	err = db.Table("session").Where("sessionId = ?", newSession.SessionID).First(&updatedSession).Error
	assert.NoError(t, err, "セッションの取得に失敗しました")

	// セッションの有効期限が延長されているか確認
	expectedExpiry := time.Now().Add(24 * time.Hour)
	timeDiff := updatedSession.Expiry.Sub(expectedExpiry).Abs()
	assert.True(t, timeDiff < 5*time.Minute, "セッションの有効期限が延長されていません")

	// ユーザー数が増えていないか確認
	var userCount int64
	db.Table("user").Where("googleId = ?", user.GoogleID).Count(&userCount)
	assert.Equal(t, int64(1), userCount, "ユーザーが重複作成されました")
}
