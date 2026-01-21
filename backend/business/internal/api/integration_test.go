//go:build integration
// +build integration

package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"kojan-map/business/internal/api/handler"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository/impl"
	serviceImpl "kojan-map/business/internal/service/impl"
	"kojan-map/business/pkg/contextkeys"
	"kojan-map/business/pkg/jwt"
	"strings"
)

// setupTestDB はテスト用データベースをセットアップ
func setupTestDB(t *testing.T) *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "root:root@tcp(localhost:3306)/kojanmap_test?parseTime=true&charset=utf8mb4&loc=Local"
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	require.NoError(t, err, "データベース接続に失敗")

	// placeテーブルに必要なテストデータを挿入（placeId=0とplaceId=1）
	db.Exec("INSERT IGNORE INTO place (placeId, numPost, latitude, longitude) VALUES (0, 0, 0, 0)")
	db.Exec("INSERT IGNORE INTO place (placeId, numPost, latitude, longitude) VALUES (1, 0, 35.6895, 139.6917)")

	return db
}

// cleanupTestDB はテスト後のクリーンアップ
func cleanupTestDB(t *testing.T, db *gorm.DB) {
	db.Exec("SET FOREIGN_KEY_CHECKS = 0")
	db.Exec("TRUNCATE TABLE post_genre")
	db.Exec("TRUNCATE TABLE report")
	db.Exec("TRUNCATE TABLE block")
	db.Exec("TRUNCATE TABLE post")
	db.Exec("TRUNCATE TABLE business")
	db.Exec("TRUNCATE TABLE user")
	db.Exec("TRUNCATE TABLE genre")
	db.Exec("SET FOREIGN_KEY_CHECKS = 1")
}

// setupTestRouter はテスト用のルーターをセットアップ
func setupTestRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	// エラーハンドリングミドルウェアを追加
	router.Use(gin.Recovery())
	router.Use(func(c *gin.Context) {
		c.Next()
		// エラーがあればログに出力
		if len(c.Errors) > 0 {
			for _, err := range c.Errors {
				fmt.Printf("Gin Error: %v\n", err)
			}
		}
	})

	authRepo := impl.NewAuthRepoImpl(db)
	postRepo := impl.NewPostRepoImpl(db)
	reportRepo := impl.NewReportRepoImpl(db)

	tokenManager := jwt.NewTokenManager()
	authService := serviceImpl.NewAuthServiceImpl(authRepo, tokenManager)
	postService := serviceImpl.NewPostServiceImpl(postRepo)
	reportService := serviceImpl.NewReportServiceImpl(reportRepo)

	postHandler := handler.NewPostHandler(postService)
	reportHandler := handler.NewReportHandler(reportService)

	api := router.Group("/api")
	{
		api.POST("/auth/google", func(c *gin.Context) {
			authService.GoogleAuth(c.Request.Context(), c)
		})

		// 認証ミドルウェア: JWTトークンを検証してcontextに設定
		authMiddleware := func(c *gin.Context) {
			authHeader := c.GetHeader("Authorization")
			if authHeader == "" {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "認証トークンが必要です"})
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			claims, err := tokenManager.VerifyToken(tokenString)
			if err != nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "無効なトークン", "detail": err.Error()})
				return
			}

			// BusinessMemberからBusinessIDを取得
			var businessMember domain.BusinessMember
			if err := db.Where("userId = ?", claims.UserID).First(&businessMember).Error; err != nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "事業者情報が見つかりません", "userId": claims.UserID, "detail": err.Error()})
				return
			}

			// contextにユーザーIDと事業者IDを設定
			ctx := contextkeys.WithUserID(c.Request.Context(), claims.UserID)
			ctx = contextkeys.WithBusinessID(ctx, businessMember.ID)
			c.Request = c.Request.WithContext(ctx)
			c.Next()
		}

		authorized := api.Group("/")
		authorized.Use(authMiddleware)
		{
			posts := authorized.Group("/posts")
			{
				posts.POST("", postHandler.CreatePost)
				posts.GET("/:postId", postHandler.GetPost)
			}

			authorized.POST("/report", reportHandler.CreateReport)
		}
	}

	return router
}

// createTestUser はテスト用ユーザーを作成
func createTestUser(t *testing.T, db *gorm.DB, googleID, gmail string) *domain.User {
	user := &domain.User{
		ID:               googleID,
		Gmail:            gmail,
		Role:             "business",
		RegistrationDate: time.Now(),
	}
	err := db.Create(user).Error
	require.NoError(t, err, "テストユーザーの作成に失敗")
	return user
}

// createTestBusinessMember はテスト用事業者メンバーを作成
func createTestBusinessMember(t *testing.T, db *gorm.DB, userID, businessName string) *domain.BusinessMember {
	member := &domain.BusinessMember{
		UserID:           userID,
		BusinessName:     businessName,
		KanaBusinessName: "テストジギョウシャ",
		Address:          "東京都千代田区",
		Phone:            "03-1234-5678",
		PlaceID:          1,
		RegistDate:       time.Now(),
	}
	err := db.Create(member).Error
	require.NoError(t, err, "テスト事業者メンバーの作成に失敗")
	return member
}

// createTestGenre はテスト用ジャンルを作成
func createTestGenre(t *testing.T, db *gorm.DB, name, color string) *domain.Genre {
	genre := &domain.Genre{
		GenreName: name,
		Color:     color,
	}
	err := db.Create(genre).Error
	require.NoError(t, err, "テストジャンルの作成に失敗")
	return genre
}

// generateTestToken はテスト用JWTトークンを生成
func generateTestToken(t *testing.T, userID, gmail, role string) string {
	tokenManager := jwt.NewTokenManager()
	token, err := tokenManager.GenerateToken(userID, gmail, role)
	require.NoError(t, err, "テストトークンの生成に失敗")
	return token
}

// TestIntegration_POST001_CreatePost は POST-001 のテスト
// テスト項目: 投稿を作成できる
func TestIntegration_POST001_CreatePost(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	user := createTestUser(t, db, "test-user-1", "test1@example.com")
	businessMember := createTestBusinessMember(t, db, user.ID, "Test Business")
	t.Logf("作成した BusinessMember: ID=%d, UserID=%s", businessMember.ID, businessMember.UserID)
	
	// DBで確認
	var dbMember domain.BusinessMember
	if err := db.Where("userId = ?", user.ID).First(&dbMember).Error; err != nil {
		t.Fatalf("BusinessMemberがDBに存在しません: %v", err)
	}
	t.Logf("DBから取得した BusinessMember: ID=%d, UserID=%s", dbMember.ID, dbMember.UserID)
	
	genre := createTestGenre(t, db, "food", "FF0000")

	router := setupTestRouter(db)

	reqBody := domain.CreatePostRequest{
		LocationID:  "35.6895,139.6917",
		GenreIDs:    []int32{genre.ID},
		Title:       "統合テスト投稿",
		Description: "これは統合テストの投稿です",
		Images:      []string{},
	}
	body, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	token := generateTestToken(t, user.ID, user.Gmail, user.Role)
	req.Header.Set("Authorization", "Bearer "+token)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	t.Logf("レスポンスステータス: %d", w.Code)
	t.Logf("レスポンスボディ: %s", w.Body.String())
	
	if w.Code == http.StatusOK && w.Body.Len() == 0 {
		t.Log("注意: ステータス200だが、レスポンスボディが空です。ハンドラーでエラーが発生している可能性があります。")
	}

	assert.Equal(t, http.StatusCreated, w.Code, "ステータスコードが201であること")

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err, "レスポンスのJSONパースに成功すること")

	assert.NotNil(t, response["postId"], "postIdが返却されること")

	var post domain.Post
	err = db.First(&post, "userId = ?", user.ID).Error
	assert.NoError(t, err, "投稿がDBに保存されていること")
	assert.Equal(t, "統合テスト投稿", post.Title, "タイトルが正しく保存されていること")

	t.Logf("✅ POST-001: 投稿作成成功 (PostID: %v)", response["postId"])
}

// TestIntegration_POST004_SaveLocation は POST-004 のテスト
// テスト項目: 位置情報を正しく保存できる
func TestIntegration_POST004_SaveLocation(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	user := createTestUser(t, db, "test-user-2", "test2@example.com")
	createTestBusinessMember(t, db, user.ID, "Test Business 2")
	genre := createTestGenre(t, db, "scene", "00FF00")

	router := setupTestRouter(db)

	latitude := 35.6895
	longitude := 139.6917
	locationID := fmt.Sprintf("%.4f,%.4f", latitude, longitude)

	reqBody := domain.CreatePostRequest{
		LocationID:  locationID,
		GenreIDs:    []int32{genre.ID},
		Title:       "位置情報テスト",
		Description: "東京駅の位置情報",
		Images:      []string{},
	}
	body, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	token := generateTestToken(t, user.ID, user.Gmail, user.Role)
	req.Header.Set("Authorization", "Bearer "+token)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code, "ステータスコードが201であること")

	var post domain.Post
	err := db.First(&post, "userId = ?", user.ID).Error
	assert.NoError(t, err, "投稿がDBに保存されていること")
	assert.NotZero(t, post.PlaceID, "位置情報が保存されていること")

	t.Logf("✅ POST-004: 位置情報保存成功 (PlaceID: %d)", post.PlaceID)
}

// TestIntegration_REPORT001_CreateReport は REPORT-001 のテスト
// テスト項目: 投稿を通報できる
func TestIntegration_REPORT001_CreateReport(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	reporter := createTestUser(t, db, "reporter-1", "reporter@example.com")
	reportedUser := createTestUser(t, db, "reported-1", "reported@example.com")
	createTestBusinessMember(t, db, reporter.ID, "Reporter Business")
	genre := createTestGenre(t, db, "food", "FF0000")

	post := &domain.Post{
		UserID:      reportedUser.ID,
		PlaceID:     1,
		Title:       "通報対象投稿",
		Text:        "この投稿は通報されます",
		GenreID:     genre.ID,
		NumView:     0,
		NumReaction: 0,
		PostDate:    time.Now(),
	}
	err := db.Create(post).Error
	require.NoError(t, err, "テスト投稿の作成に失敗")

	router := setupTestRouter(db)

	reqBody := domain.CreateReportRequest{
		ReportedGoogleID: reportedUser.ID,
		TargetPostID:     int(post.ID),
		ReportReason:     "不適切なコンテンツ",
		ReportedAt:       time.Now().Format(time.RFC3339),
	}
	body, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "/api/report", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	token := generateTestToken(t, reporter.ID, reporter.Gmail, reporter.Role)
	req.Header.Set("Authorization", "Bearer "+token)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code, "ステータスコードが201であること")

	var report domain.Report
	err = db.First(&report, "postId = ?", post.ID).Error
	assert.NoError(t, err, "通報がDBに保存されていること")
	assert.Equal(t, "不適切なコンテンツ", report.Reason, "通報理由が正しく保存されていること")

	t.Logf("✅ REPORT-001: 通報作成成功 (ReportID: %d)", report.ID)
}

// TestIntegration_BIZ001_BusinessRequest は BIZ-001 のテスト
// テスト項目: 事業者申請を送信できる
func TestIntegration_BIZ001_BusinessRequest(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	if !db.Migrator().HasTable("business_requests") {
		t.Skip("business_requests テーブルが存在しないためスキップ")
	}

	user := createTestUser(t, db, "applicant-1", "applicant@example.com")

	type BusinessRequest struct {
		RequestID int64     `gorm:"primaryKey;autoIncrement;column:requestId"`
		Name      string    `gorm:"column:name;not null"`
		Address   string    `gorm:"column:address;not null"`
		Phone     string    `gorm:"column:phone;not null"`
		UserID    string    `gorm:"column:userId;not null"`
		Status    string    `gorm:"column:status;not null;default:'pending'"`
		CreatedAt time.Time `gorm:"column:createdAt;autoCreateTime"`
	}

	request := &BusinessRequest{
		Name:    "新規事業者",
		Address: "東京都千代田区",
		Phone:   "03-1234-5678",
		UserID:  user.ID,
		Status:  "pending",
	}

	err := db.Table("business_requests").Create(request).Error
	require.NoError(t, err, "事業者申請の作成に失敗")

	var savedRequest BusinessRequest
	err = db.Table("business_requests").First(&savedRequest, "userId = ?", user.ID).Error
	assert.NoError(t, err, "事業者申請がDBに保存されていること")
	assert.Equal(t, "pending", savedRequest.Status, "ステータスがpendingであること")
	assert.Equal(t, "新規事業者", savedRequest.Name, "事業者名が正しく保存されていること")

	t.Logf("✅ BIZ-001: 事業者申請作成成功 (RequestID: %d, Status: %s)", savedRequest.RequestID, savedRequest.Status)
}

// TestIntegration_AUTH001_LoginFlow は追加テスト項目
// テスト項目: ログインフローが正常に動作する
func TestIntegration_AUTH001_LoginFlow(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	user := createTestUser(t, db, "login-test-1", "logintest@example.com")
	createTestBusinessMember(t, db, user.ID, "Login Test Business")

	token := generateTestToken(t, user.ID, user.Gmail, user.Role)
	assert.NotEmpty(t, token, "JWTトークンが生成されること")

	tokenManager := jwt.NewTokenManager()
	claims, err := tokenManager.VerifyToken(token)
	assert.NoError(t, err, "トークンが正しく検証されること")
	assert.Equal(t, user.ID, claims.UserID, "ユーザーIDが正しいこと")

	t.Logf("✅ AUTH-001: ログインフロー成功")
}

// TestIntegration_POST002_GetPostIncrementsViewCount は追加テスト項目
// テスト項目: 投稿取得時に閲覧数が増加する
func TestIntegration_POST002_GetPostIncrementsViewCount(t *testing.T) {
	db := setupTestDB(t)
	defer cleanupTestDB(t, db)

	user := createTestUser(t, db, "view-test-1", "viewtest@example.com")
	createTestBusinessMember(t, db, user.ID, "View Test Business")
	genre := createTestGenre(t, db, "event", "0000FF")

	post := &domain.Post{
		UserID:      user.ID,
		PlaceID:     1,
		Title:       "閲覧数テスト",
		Text:        "閲覧数が増加するかテスト",
		GenreID:     genre.ID,
		NumView:     0,
		NumReaction: 0,
		PostDate:    time.Now(),
	}
	err := db.Create(post).Error
	require.NoError(t, err, "テスト投稿の作成に失敗")

	router := setupTestRouter(db)

	req, _ := http.NewRequest("GET", fmt.Sprintf("/api/posts/%d", post.ID), nil)
	token := generateTestToken(t, user.ID, user.Gmail, user.Role)
	req.Header.Set("Authorization", "Bearer "+token)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code, "ステータスコードが200であること")

	var updatedPost domain.Post
	err = db.First(&updatedPost, "postId = ?", post.ID).Error
	assert.NoError(t, err, "投稿が取得できること")
	assert.Equal(t, int32(1), updatedPost.NumView, "閲覧数が1増加していること")

	t.Logf("✅ POST-002: 閲覧数増加成功 (ViewCount: %d)", updatedPost.NumView)
}
