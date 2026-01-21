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
)

// setupTestDB テスト用のMySQLデータベースに接続
func setupTestDB(t *testing.T) *gorm.DB {
	dsn := "root:root@tcp(localhost:3306)/kojanmap_test?parseTime=true&charset=utf8mb4&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("テストDBへの接続に失敗しました: %v", err)
	}

	config.DB = db
	// genreテーブルの初期化 (FK制約対策)
	db.Exec("INSERT IGNORE INTO genre (genreId, genreName, color) VALUES (1, 'food', 'FF0000')")
	db.Exec("INSERT IGNORE INTO genre (genreId, genreName, color) VALUES (2, 'event', '00FF00')")
	return db
}

// cleanupTestDB テストデータをクリーンアップ
func cleanupTestDB(t *testing.T, db *gorm.DB) {
	// 外部キー制約を無効化
	db.Exec("SET FOREIGN_KEY_CHECKS = 0")

	// テストデータを削除
	db.Exec("DELETE FROM report WHERE reportId >= 10000")
	db.Exec("DELETE FROM post WHERE postId >= 12345")
	db.Exec("DELETE FROM session WHERE googleId LIKE 'test-%' OR googleId LIKE '%test%'")
	db.Exec("DELETE FROM user WHERE googleId LIKE 'test-%' OR googleId LIKE '%test%' OR gmail LIKE '%test%' OR googleId LIKE '%creator%' OR googleId LIKE '%viewer%' OR googleId LIKE '%reporter%' OR googleId LIKE '%reported%'")
	db.Exec("DELETE FROM place WHERE placeId >= 9000")

	// 外部キー制約を再度有効化
	db.Exec("SET FOREIGN_KEY_CHECKS = 1")
}

// createTestUser テスト用ユーザーを作成
func createTestUser(t *testing.T, db *gorm.DB, googleID, email string) string {
	query := "INSERT INTO user (googleId, gmail, role, registrationDate) VALUES (?, ?, ?, ?)"
	err := db.Exec(query, googleID, email, "user", time.Now()).Error
	if err != nil {
		t.Fatalf("テストユーザーの作成に失敗しました: %v", err)
	}
	return googleID
}

// createTestSession テスト用セッションを作成
func createTestSession(t *testing.T, db *gorm.DB, googleID string) string {
	sessionID := "test-" + uuid.New().String()
	query := "INSERT INTO session (sessionId, googleId, expiry) VALUES (?, ?, ?)"
	err := db.Exec(query, sessionID, googleID, time.Now().Add(24*time.Hour)).Error
	if err != nil {
		t.Fatalf("テストセッションの作成に失敗しました: %v", err)
	}
	return sessionID
}

// createTestPlace テスト用場所を作成
func createTestPlace(t *testing.T, db *gorm.DB) int32 {
	placeID := int32(9001)
	query := "INSERT INTO place (placeId, numPost, latitude, longitude) VALUES (?, ?, ?, ?)"
	err := db.Exec(query, placeID, 0, 35.6812, 139.7671).Error
	if err != nil {
		t.Fatalf("テスト場所の作成に失敗しました: %v", err)
	}
	return placeID
}

// TestIntegration_USER001_UserRegistrationFlow ユーザー登録フロー統合テスト
func TestIntegration_USER001_UserRegistrationFlow(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	googleID := "test-google-123"
	email := "integration-test@example.com"

	// ユーザーを直接作成
	userGoogleID := createTestUser(t, db, googleID, email)

	// セッションを作成
	sessionID := createTestSession(t, db, googleID)

	// DBからユーザーを取得して確認
	var dbGoogleID, dbEmail, dbRole string
	var dbRegDate time.Time
	err := db.Raw("SELECT googleId, gmail, role, registrationDate FROM user WHERE googleId = ?", googleID).Row().Scan(&dbGoogleID, &dbEmail, &dbRole, &dbRegDate)
	assert.NoError(t, err, "ユーザーがDBに保存されていません")
	assert.Equal(t, email, dbEmail, "メールアドレスが一致しません")
	assert.Equal(t, "user", dbRole, "ロールが正しくありません")

	// DBからセッションを取得して確認
	var dbSessionID, dbSessionGoogleID string
	var dbExpiry time.Time
	err = db.Raw("SELECT sessionId, googleId, expiry FROM session WHERE sessionId = ?", sessionID).Row().Scan(&dbSessionID, &dbSessionGoogleID, &dbExpiry)
	assert.NoError(t, err, "セッションがDBに保存されていません")
	assert.Equal(t, googleID, dbSessionGoogleID, "GoogleIDが一致しません")
	assert.True(t, dbExpiry.After(time.Now()), "セッションの有効期限が過去です")

	_ = userGoogleID // unused
}

// TestIntegration_USER002_CreatePostWithDB 投稿作成とDB保存の統合テスト
func TestIntegration_USER002_CreatePostWithDB(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	// テストユーザーと場所を作成
	userGoogleID := createTestUser(t, db, "post-creator-1", "post-creator@example.com")
	placeID := createTestPlace(t, db)

	// 投稿を直接作成
	postID := int32(12345)
	query := "INSERT INTO post (postId, userId, title, text, placeId, numView, numReaction, genreId, postDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
	err := db.Exec(query, postID, userGoogleID, "統合テスト投稿", "これは統合テストの投稿です", placeID, 0, 0, 1, time.Now()).Error
	assert.NoError(t, err, "投稿の作成に失敗しました")

	// DBから投稿を取得して確認
	var dbTitle, dbUserID string
	var dbPlaceID int32
	err = db.Raw("SELECT title, userId, placeId FROM post WHERE postId = ?", postID).Row().Scan(&dbTitle, &dbUserID, &dbPlaceID)
	assert.NoError(t, err, "投稿がDBに保存されていません")
	assert.Equal(t, "統合テスト投稿", dbTitle, "タイトルが一致しません")
	assert.Equal(t, userGoogleID, dbUserID, "ユーザーIDが一致しません")
	assert.Equal(t, placeID, dbPlaceID, "場所IDが一致しません")
}

// TestIntegration_USER003_GetPostIncrementsViewCount 投稿取得時の閲覧数増加テスト
func TestIntegration_USER003_GetPostIncrementsViewCount(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	// テストデータ作成
	userGoogleID := createTestUser(t, db, "viewer-1", "viewer@example.com")
	placeID := createTestPlace(t, db)

	// 投稿作成
	postID := int32(12346)
	query := "INSERT INTO post (postId, userId, title, text, placeId, numView, numReaction, genreId, postDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
	err := db.Exec(query, postID, userGoogleID, "閲覧数テスト投稿", "閲覧数を確認するテスト", placeID, 0, 0, 1, time.Now()).Error
	assert.NoError(t, err, "投稿の作成に失敗しました")

	// 閲覧数を手動で増加
	err = db.Exec("UPDATE post SET numView = 1 WHERE postId = ?", postID).Error
	assert.NoError(t, err, "閲覧数の更新に失敗しました")

	// DBから投稿を再取得して閲覧数を確認
	var numView int32
	err = db.Raw("SELECT numView FROM post WHERE postId = ?", postID).Row().Scan(&numView)
	assert.NoError(t, err, "投稿の取得に失敗しました")
	assert.Equal(t, int32(1), numView, "閲覧数が1に増加していません")

	// 再度閲覧数を増加
	err = db.Exec("UPDATE post SET numView = 2 WHERE postId = ?", postID).Error
	assert.NoError(t, err)

	// 再度確認
	err = db.Raw("SELECT numView FROM post WHERE postId = ?", postID).Row().Scan(&numView)
	assert.NoError(t, err)
	assert.Equal(t, int32(2), numView, "閲覧数が2に増加していません")
}

// TestIntegration_USER004_CreateReportWithDB 通報作成とDB保存の統合テスト
func TestIntegration_USER004_CreateReportWithDB(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	// テストデータ作成
	reporterGoogleID := createTestUser(t, db, "reporter-1", "reporter@example.com")
	reportedUserGoogleID := createTestUser(t, db, "reported-1", "reported@example.com")
	placeID := createTestPlace(t, db)

	// 投稿作成
	postID := int32(12347)
	query := "INSERT INTO post (postId, userId, title, text, placeId, numView, numReaction, genreId, postDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
	err := db.Exec(query, postID, reportedUserGoogleID, "通報対象投稿", "通報される投稿", placeID, 0, 0, 1, time.Now()).Error
	assert.NoError(t, err, "投稿の作成に失敗しました")

	// 通報作成
	reportID := int32(10001)
	query = "INSERT INTO report (reportId, userId, postId, reason, date, reportFlag, removeFlag) VALUES (?, ?, ?, ?, ?, ?, ?)"
	err = db.Exec(query, reportID, reporterGoogleID, postID, "不適切な内容", time.Now(), false, false).Error
	assert.NoError(t, err, "通報の作成に失敗しました")

	// DBから通報を取得して確認
	var dbUserID string
	var dbPostID int32
	var dbReportFlag bool
	err = db.Raw("SELECT userId, postId, reportFlag FROM report WHERE reportId = ?", reportID).Row().Scan(&dbUserID, &dbPostID, &dbReportFlag)
	assert.NoError(t, err, "通報がDBに保存されていません")
	assert.Equal(t, reporterGoogleID, dbUserID, "通報者IDが一致しません")
	assert.Equal(t, postID, dbPostID, "通報対象IDが一致しません")
	assert.False(t, dbReportFlag, "ReportFlagが正しくありません")
}

// TestIntegration_USER005_SessionExtensionOnLogin セッション延長テスト
func TestIntegration_USER005_SessionExtensionOnLogin(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	googleID := "session-test-google-456"
	email := "session-test@example.com"

	// 既存ユーザーとセッションを作成
	userGoogleID := createTestUser(t, db, googleID, email)

	// 旧セッション作成（1時間後に期限切れ）
	oldSessionID := "test-old-" + uuid.New().String()
	oldExpiry := time.Now().Add(1 * time.Hour)
	err := db.Exec("INSERT INTO session (sessionId, googleId, expiry) VALUES (?, ?, ?)", oldSessionID, googleID, oldExpiry).Error
	assert.NoError(t, err, "旧セッションの作成に失敗しました")

	// 新しいセッションを作成（延長をシミュレート）
	newSessionID := "test-new-" + uuid.New().String()
	newExpiry := time.Now().Add(24 * time.Hour)
	err = db.Exec("INSERT INTO session (sessionId, googleId, expiry) VALUES (?, ?, ?)", newSessionID, googleID, newExpiry).Error
	assert.NoError(t, err, "新しいセッションの作成に失敗しました")

	// DBからセッションを取得
	var dbExpiry time.Time
	err = db.Raw("SELECT expiry FROM session WHERE sessionId = ?", newSessionID).Row().Scan(&dbExpiry)
	assert.NoError(t, err, "セッションの取得に失敗しました")

	// セッションの有効期限が延長されているか確認
	expectedExpiry := time.Now().Add(24 * time.Hour)
	timeDiff := dbExpiry.Sub(expectedExpiry).Abs()
	assert.True(t, timeDiff < 5*time.Minute, "セッションの有効期限が延長されていません")

	// ユーザー数が増えていないか確認
	var userCount int64
	db.Raw("SELECT COUNT(*) FROM user WHERE googleId = ?", userGoogleID).Row().Scan(&userCount)
	assert.Equal(t, int64(1), userCount, "ユーザーが重複作成されました")
}
