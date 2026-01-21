//go:build integration
// +build integration

package handler

import (
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// setupTestDB テスト用のMySQLデータベースに接続
func setupTestDB(t *testing.T) *gorm.DB {
	dsn := "root:root@tcp(localhost:3306)/kojanmap_test?parseTime=true&charset=utf8mb4&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("テストDBへの接続に失敗しました: %v", err)
	}
	return db
}

// cleanupTestDB テストデータをクリーンアップ
func cleanupTestDB(t *testing.T, db *gorm.DB) {
	db.Exec("SET FOREIGN_KEY_CHECKS = 0")
	db.Exec("DELETE FROM report WHERE reportId >= 20000")
	db.Exec("DELETE FROM businessReq WHERE requestId >= 20000")
	db.Exec("DELETE FROM post WHERE postId >= 20000")
	db.Exec("DELETE FROM user WHERE googleId LIKE 'admin-test-%'")
	db.Exec("DELETE FROM place WHERE placeId >= 20000")
	db.Exec("SET FOREIGN_KEY_CHECKS = 1")
}

// createTestUser テスト用ユーザーを作成
func createTestUser(t *testing.T, db *gorm.DB, googleID, email, role string) string {
	query := "INSERT INTO user (googleId, gmail, role, registrationDate) VALUES (?, ?, ?, ?)"
	err := db.Exec(query, googleID, email, role, time.Now()).Error
	if err != nil {
		t.Fatalf("テストユーザーの作成に失敗しました: %v", err)
	}
	return googleID
}

// createTestPlace テスト用場所を作成
func createTestPlace(t *testing.T, db *gorm.DB, placeID int32) int32 {
	query := "INSERT INTO place (placeId, numPost, latitude, longitude) VALUES (?, ?, ?, ?)"
	err := db.Exec(query, placeID, 0, 35.6812, 139.7671).Error
	if err != nil {
		t.Fatalf("テスト場所の作成に失敗しました: %v", err)
	}
	return placeID
}

// TestIntegration_ADMIN001_ReportCRUD 通報データのCRUD統合テスト
func TestIntegration_ADMIN001_ReportCRUD(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	// テストデータ作成
	reporterGoogleID := createTestUser(t, db, "admin-test-reporter-1", "reporter@test.com", "user")
	reportedUserGoogleID := createTestUser(t, db, "admin-test-reported-1", "reported@test.com", "user")
	placeID := createTestPlace(t, db, 20001)

	// 投稿作成
	postID := int32(20001)
	query := "INSERT INTO post (postId, userId, title, text, placeId, numView, numReaction, genreId, postDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
	err := db.Exec(query, postID, reportedUserGoogleID, "テスト投稿", "テスト内容", placeID, 0, 0, 1, time.Now()).Error
	assert.NoError(t, err, "投稿の作成に失敗しました")

	// 通報作成
	reportID := int32(20001)
	query = "INSERT INTO report (reportId, userId, postId, reason, date, reportFlag, removeFlag) VALUES (?, ?, ?, ?, ?, ?, ?)"
	err = db.Exec(query, reportID, reporterGoogleID, postID, "不適切な内容", time.Now(), false, false).Error
	assert.NoError(t, err, "通報の作成に失敗しました")

	// 通報読み取り
	var dbReporterID string
	var dbPostID int32
	var dbReportFlag bool
	err = db.Raw("SELECT userId, postId, reportFlag FROM report WHERE reportId = ?", reportID).Row().Scan(&dbReporterID, &dbPostID, &dbReportFlag)
	assert.NoError(t, err, "通報の取得に失敗しました")
	assert.Equal(t, reporterGoogleID, dbReporterID, "通報者IDが一致しません")
	assert.Equal(t, postID, dbPostID, "投稿IDが一致しません")
	assert.False(t, dbReportFlag, "reportFlagが正しくありません")

	// 通報更新
	err = db.Exec("UPDATE report SET reportFlag = ?, removeFlag = ? WHERE reportId = ?", true, true, reportID).Error
	assert.NoError(t, err, "通報の更新に失敗しました")

	// 更新確認
	var dbRemoveFlag bool
	err = db.Raw("SELECT reportFlag, removeFlag FROM report WHERE reportId = ?", reportID).Row().Scan(&dbReportFlag, &dbRemoveFlag)
	assert.NoError(t, err, "更新後の通報取得に失敗しました")
	assert.True(t, dbReportFlag, "reportFlagがtrueに更新されていません")
	assert.True(t, dbRemoveFlag, "removeFlagがtrueに更新されていません")
}

// TestIntegration_ADMIN002_BusinessRequestCRUD 事業者申請データのCRUD統合テスト
func TestIntegration_ADMIN002_BusinessRequestCRUD(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	// テストユーザー作成
	userGoogleID := createTestUser(t, db, "admin-test-applicant-1", "applicant@test.com", "user")

	// 事業者申請作成
	requestID := int64(20001)
	query := "INSERT INTO businessReq (requestId, name, address, phone, userId) VALUES (?, ?, ?, ?, ?)"
	err := db.Exec(query, requestID, "テスト事業者", "東京都渋谷区", "03-1234-5678", userGoogleID).Error
	assert.NoError(t, err, "事業者申請の作成に失敗しました")

	// 事業者申請読み取り
	var dbName, dbAddress, dbUserID string
	err = db.Raw("SELECT name, address, userId FROM businessReq WHERE requestId = ?", requestID).Row().Scan(&dbName, &dbAddress, &dbUserID)
	assert.NoError(t, err, "事業者申請の取得に失敗しました")
	assert.Equal(t, "テスト事業者", dbName, "事業者名が一致しません")
	assert.Equal(t, "東京都渋谷区", dbAddress, "住所が一致しません")
	assert.Equal(t, userGoogleID, dbUserID, "ユーザーIDが一致しません")

	// 事業者申請削除
	err = db.Exec("DELETE FROM businessReq WHERE requestId = ?", requestID).Error
	assert.NoError(t, err, "事業者申請の削除に失敗しました")

	// 削除確認
	var count int64
	db.Raw("SELECT COUNT(*) FROM businessReq WHERE requestId = ?", requestID).Row().Scan(&count)
	assert.Equal(t, int64(0), count, "事業者申請が削除されていません")
}

// TestIntegration_ADMIN003_UserRoleUpdate ユーザーロール更新統合テスト
func TestIntegration_ADMIN003_UserRoleUpdate(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	// テストユーザー作成（role='user'）
	userGoogleID := createTestUser(t, db, "admin-test-user-1", "testuser@test.com", "user")

	// ロールがuserであることを確認
	var userRole string
	err := db.Raw("SELECT role FROM user WHERE googleId = ?", userGoogleID).Row().Scan(&userRole)
	assert.NoError(t, err, "ユーザーの取得に失敗しました")
	assert.Equal(t, "user", userRole, "初期ロールがuserではありません")

	// ロールをbusinessに更新
	err = db.Exec("UPDATE user SET role = ? WHERE googleId = ?", "business", userGoogleID).Error
	assert.NoError(t, err, "ユーザーロールの更新に失敗しました")

	// 更新確認
	err = db.Raw("SELECT role FROM user WHERE googleId = ?", userGoogleID).Row().Scan(&userRole)
	assert.NoError(t, err, "更新後のユーザー取得に失敗しました")
	assert.Equal(t, "business", userRole, "ロールがbusinessに更新されていません")
}

// TestIntegration_ADMIN004_ReportListPagination 通報一覧のページネーション統合テスト
func TestIntegration_ADMIN004_ReportListPagination(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	// テストデータ作成（3件の通報）
	reporterGoogleID := createTestUser(t, db, "admin-test-reporter-multi", "reporter-multi@test.com", "user")
	reportedUserGoogleID := createTestUser(t, db, "admin-test-reported-multi", "reported-multi@test.com", "user")
	placeID := createTestPlace(t, db, 20002)

	for i := 0; i < 3; i++ {
		postID := int32(20010 + i)
		query := "INSERT INTO post (postId, userId, title, text, placeId, numView, numReaction, genreId, postDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
		err := db.Exec(query, postID, reportedUserGoogleID, fmt.Sprintf("投稿%d", i), "内容", placeID, 0, 0, 1, time.Now()).Error
		assert.NoError(t, err)

		reportID := int32(20010 + i)
		query = "INSERT INTO report (reportId, userId, postId, reason, date, reportFlag, removeFlag) VALUES (?, ?, ?, ?, ?, ?, ?)"
		err = db.Exec(query, reportID, reporterGoogleID, postID, fmt.Sprintf("理由%d", i), time.Now(), false, false).Error
		assert.NoError(t, err)
	}

	// 通報一覧取得（全件）
	var count int64
	db.Raw("SELECT COUNT(*) FROM report WHERE reportId >= 20000").Row().Scan(&count)
	assert.GreaterOrEqual(t, count, int64(3), "通報が3件以上作成されていません")

	// 処理済みフィルターのテスト（reportFlag = false のみ）
	var unhandledCount int64
	db.Raw("SELECT COUNT(*) FROM report WHERE reportId >= 20000 AND reportFlag = false").Row().Scan(&unhandledCount)
	assert.Equal(t, int64(3), unhandledCount, "未処理の通報が3件ではありません")
}
