package services

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"kojan-map/user/models"
)

func TestPostService_CreatePost(t *testing.T) {
	setupTestDB(t)
	service := &PostService{}

	post := &models.Post{
		UserID:    "user123",
		Title:     "テスト投稿",
		Text:      "これはテスト投稿です",
		GenreID:   1,
		PlaceID:   1,
		CreatedAt: time.Now(),
	}

	err := service.CreatePost(post)
	assert.NoError(t, err)
	assert.NotZero(t, post.ID)
}

func TestPostService_CreatePost_ValidationError(t *testing.T) {
	setupTestDB(t)
	service := &PostService{}

	// タイトルが空
	post := &models.Post{
		UserID: "user123",
		Title:  "",
		Text:   "テキストあり",
	}
	err := service.CreatePost(post)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "title and text are required")

	// テキストが空
	post = &models.Post{
		UserID: "user123",
		Title:  "タイトルあり",
		Text:   "",
	}
	err = service.CreatePost(post)
	assert.Error(t, err)
}

func TestPostService_GetAllPosts(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	posts := []models.Post{
		{UserID: "user1", Title: "投稿1", Text: "テキスト1", GenreID: 1, IsAnonymized: false, CreatedAt: time.Now()},
		{UserID: "user2", Title: "投稿2", Text: "テキスト2", GenreID: 1, IsAnonymized: false, CreatedAt: time.Now().Add(1 * time.Hour)},
		{UserID: "user3", Title: "投稿3", Text: "テキスト3", GenreID: 1, IsAnonymized: true, CreatedAt: time.Now()}, // 匿名化済み
	}
	for _, p := range posts {
		db.Create(&p)
	}

	// 投稿一覧取得
	result, err := service.GetAllPosts()
	assert.NoError(t, err)
	assert.Equal(t, 2, len(result)) // 匿名化済みは除外
	assert.Equal(t, "投稿2", result[0].Title) // 新しい順
}

func TestPostService_GetPostDetail(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	post := models.Post{
		UserID:  "user123",
		Title:   "詳細テスト",
		Text:    "詳細テキスト",
		NumView: 0,
	}
	db.Create(&post)

	// 投稿詳細取得
	result, err := service.GetPostDetail(int(post.ID))
	assert.NoError(t, err)
	assert.Equal(t, "詳細テスト", result.Title)
	assert.Equal(t, 1, result.NumView) // 閲覧数が増加
}

func TestPostService_GetPostDetail_NotFound(t *testing.T) {
	setupTestDB(t)
	service := &PostService{}

	// 存在しない投稿
	_, err := service.GetPostDetail(99999)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "post not found")
}

func TestPostService_DeletePost(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	post := models.Post{
		UserID: "owner123",
		Title:  "削除テスト",
		Text:   "削除されます",
	}
	db.Create(&post)

	// 投稿削除（所有者）
	err := service.DeletePost(int(post.ID), "owner123")
	assert.NoError(t, err)

	// 削除されたか確認
	var deletedPost models.Post
	err = db.First(&deletedPost, post.ID).Error
	assert.Error(t, err)
}

func TestPostService_DeletePost_Unauthorized(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	post := models.Post{
		UserID: "owner123",
		Title:  "削除テスト",
		Text:   "削除されます",
	}
	db.Create(&post)

	// 別のユーザーで削除を試みる
	err := service.DeletePost(int(post.ID), "other_user")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "unauthorized")

	// 投稿が残っているか確認
	var existingPost models.Post
	err = db.First(&existingPost, post.ID).Error
	assert.NoError(t, err)
}

func TestPostService_AnonymizePost(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	post := models.Post{
		UserID:       "user123",
		Title:        "匿名化テスト",
		Text:         "匿名化されます",
		GenreID:      1,
		IsAnonymized: false,
	}
	db.Create(&post)

	// 投稿を匿名化
	err := service.AnonymizePost(int(post.ID))
	assert.NoError(t, err)

	// 匿名化されたか確認
	var anonymizedPost models.Post
	db.First(&anonymizedPost, post.ID)
	assert.True(t, anonymizedPost.IsAnonymized)
	assert.Equal(t, "[削除されました]", anonymizedPost.Title)
	assert.Equal(t, "[削除されました]", anonymizedPost.Text)
}

func TestPostService_AddReaction(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	post := models.Post{
		UserID:      "user123",
		Title:       "リアクションテスト",
		Text:        "リアクションされます",
		GenreID:     1,
		NumReaction: 0,
	}
	db.Create(&post)

	// リアクション追加
	err := service.AddReaction("reactor1", int(post.ID))
	assert.NoError(t, err)

	// リアクションが記録されたか確認
	var reaction models.UserReaction
	err = db.Where("post_id = ? AND user_id = ?", post.ID, "reactor1").First(&reaction).Error
	assert.NoError(t, err)

	// リアクション数が増加したか確認
	var updatedPost models.Post
	db.First(&updatedPost, post.ID)
	assert.Equal(t, 1, updatedPost.NumReaction)
}

func TestPostService_AddReaction_Toggle(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	post := models.Post{
		UserID:      "user123",
		Title:       "トグルテスト",
		Text:        "トグルされます",
		GenreID:     1,
		NumReaction: 1,
	}
	db.Create(&post)

	// 既存のリアクションを作成
	reaction := models.UserReaction{
		PostID: post.ID,
		UserID: "reactor1",
	}
	db.Create(&reaction)

	// リアクション削除（トグル）
	err := service.AddReaction("reactor1", int(post.ID))
	assert.NoError(t, err)

	// リアクションが削除されたか確認
	var deletedReaction models.UserReaction
	err = db.Where("post_id = ? AND user_id = ?", post.ID, "reactor1").First(&deletedReaction).Error
	assert.Error(t, err)

	// リアクション数が減少したか確認
	var updatedPost models.Post
	db.First(&updatedPost, post.ID)
	assert.Equal(t, 0, updatedPost.NumReaction)
}

func TestPostService_IsUserReacted(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	post := models.Post{
		UserID: "user123",
		Title:  "リアクション確認テスト",
		Text:   "リアクション確認",
		GenreID: 1,
	}
	db.Create(&post)

	// リアクションを追加
	reaction := models.UserReaction{
		PostID: post.ID,
		UserID: "reactor1",
	}
	db.Create(&reaction)

	// リアクション済みか確認
	isReacted, err := service.IsUserReacted("reactor1", int(post.ID))
	assert.NoError(t, err)
	assert.True(t, isReacted)

	// 未リアクションか確認
	isReacted, err = service.IsUserReacted("other_user", int(post.ID))
	assert.NoError(t, err)
	assert.False(t, isReacted)
}

func TestPostService_SearchByKeyword(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	posts := []models.Post{
		{UserID: "user1", Title: "高知のラーメン", Text: "おすすめのラーメン店", GenreID: 1, IsAnonymized: false},
		{UserID: "user2", Title: "高知の観光", Text: "桂浜がおすすめです", GenreID: 2, IsAnonymized: false},
		{UserID: "user3", Title: "東京のラーメン", Text: "東京にもあります", GenreID: 1, IsAnonymized: false},
	}
	for _, p := range posts {
		db.Create(&p)
	}

	// キーワード検索
	results, err := service.SearchPostsByKeyword("ラーメン")
	assert.NoError(t, err)
	assert.Equal(t, 2, len(results))
}

func TestPostService_SearchByGenre(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	posts := []models.Post{
		{UserID: "user1", Title: "投稿1", Text: "テキスト", GenreID: 1, IsAnonymized: false},
		{UserID: "user2", Title: "投稿2", Text: "テキスト", GenreID: 2, IsAnonymized: false},
		{UserID: "user3", Title: "投稿3", Text: "テキスト", GenreID: 1, IsAnonymized: false},
	}
	for _, p := range posts {
		db.Create(&p)
	}

	// ジャンル検索
	results, err := service.SearchPostsByGenre(1)
	assert.NoError(t, err)
	assert.Equal(t, 2, len(results))
}

func TestPostService_SearchByPeriod(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	now := time.Now()
	yesterday := now.AddDate(0, 0, -1)
	tomorrow := now.AddDate(0, 0, 1)

	posts := []models.Post{
		{UserID: "user1", Title: "昨日の投稿", Text: "テキスト", GenreID: 1, PostDate: yesterday, IsAnonymized: false},
		{UserID: "user2", Title: "今日の投稿", Text: "テキスト", GenreID: 1, PostDate: now, IsAnonymized: false},
		{UserID: "user3", Title: "明日の投稿", Text: "テキスト", GenreID: 1, PostDate: tomorrow, IsAnonymized: false},
	}
	for _, p := range posts {
		db.Create(&p)
	}

	// 期間検索（昨日から今日）
	results, err := service.SearchPostsByPeriod(yesterday, now)
	assert.NoError(t, err)
	assert.Equal(t, 2, len(results))
}

func TestPostService_GetUserPostHistory(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	posts := []models.Post{
		{UserID: "user123", Title: "投稿1", Text: "テキスト1", GenreID: 1, IsAnonymized: false},
		{UserID: "user123", Title: "投稿2", Text: "テキスト2", GenreID: 1, IsAnonymized: false},
		{UserID: "user456", Title: "投稿3", Text: "テキスト3", GenreID: 1, IsAnonymized: false},
	}
	for _, p := range posts {
		db.Create(&p)
	}

	// ユーザーの投稿履歴を取得
	results, err := service.GetUserPostHistory("user123")
	assert.NoError(t, err)
	assert.Equal(t, 2, len(results))
	assert.Equal(t, "user123", results[0].UserID)
}

func TestPostService_GetUserPostHistory_Empty(t *testing.T) {
	setupTestDB(t)
	service := &PostService{}

	// 投稿がないユーザーの履歴取得
	results, err := service.GetUserPostHistory("nonexistent")
	assert.NoError(t, err)
	assert.Equal(t, 0, len(results))
}

func TestPostService_GetPinSize_Under50(t *testing.T) {
	setupTestDB(t)
	service := &PostService{}

	// ピンサイズ判定（投稿数50未満 = 1.0）
	pinSize, err := service.GetPinSize(1)
	assert.NoError(t, err)
	assert.Equal(t, 1.0, pinSize)
}

func TestPostService_SearchByKeyword_NoResults(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	post := models.Post{
		UserID:       "user1",
		Title:        "高知のラーメン",
		Text:         "おすすめのラーメン店",
		GenreID:      1,
		IsAnonymized: false,
	}
	db.Create(&post)

	// 存在しないキーワードで検索
	results, err := service.SearchPostsByKeyword("東京の寿司")
	assert.NoError(t, err)
	assert.Equal(t, 0, len(results))
}

func TestPostService_SearchByGenre_NoResults(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	post := models.Post{
		UserID:       "user1",
		Title:        "投稿1",
		Text:         "テキスト",
		GenreID:      1,
		IsAnonymized: false,
	}
	db.Create(&post)

	// 存在しないジャンルで検索
	results, err := service.SearchPostsByGenre(999)
	assert.NoError(t, err)
	assert.Equal(t, 0, len(results))
}

func TestPostService_SearchByPeriod_NoResults(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	post := models.Post{
		UserID:       "user1",
		Title:        "投稿1",
		Text:         "テキスト",
		GenreID:      1,
		PostDate:     time.Now(),
		IsAnonymized: false,
	}
	db.Create(&post)

	// 範囲外の期間で検索
	startDate := time.Now().AddDate(0, 0, -10)
	endDate := time.Now().AddDate(0, 0, -5)
	results, err := service.SearchPostsByPeriod(startDate, endDate)
	assert.NoError(t, err)
	assert.Equal(t, 0, len(results))
}

func TestPostService_DeletePost_NotFound(t *testing.T) {
	setupTestDB(t)
	service := &PostService{}

	// 存在しない投稿の削除
	err := service.DeletePost(99999, "user123")
	assert.Error(t, err)
}

func TestPostService_AddReaction_ErrorHandling(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	post := models.Post{
		UserID:  "user123",
		Title:   "投稿",
		Text:    "テキスト",
		GenreID: 1,
	}
	db.Create(&post)

	// ユーザーIDが空の場合
	err := service.AddReaction("", int(post.ID))
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "userID is required")
}

func TestPostService_IsUserReacted_NotReacted(t *testing.T) {
	db := setupTestDB(t)
	service := &PostService{}

	// テスト投稿を作成
	post := models.Post{
		UserID:  "user123",
		Title:   "投稿",
		Text:    "テキスト",
		GenreID: 1,
	}
	db.Create(&post)

	// リアクション状態確認（リアクションなし）
	isReacted, err := service.IsUserReacted("user456", int(post.ID))
	assert.NoError(t, err)
	assert.False(t, isReacted)
}
