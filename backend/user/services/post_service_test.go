package services

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"

	"kojan-map/user/models"
)

// TestPostService_CreatePost - 投稿の新規作成
func TestPostService_CreatePost(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	// テスト用ジャンル・場所をセットアップ
	genre := models.Genre{GenreName: "グルメ"}
	db.Create(&genre)

	place := models.Place{Latitude: 35.6762, Longitude: 139.6503, NumPost: 0}
	db.Create(&place)

	post := &models.Post{
		UserID:      "user123",
		Title:       "テスト投稿",
		Text:        "これはテスト投稿です",
		PostImage:   "test.jpg",
		NumView:     0,
		NumReaction: 0,
		PlaceID:     place.ID,
		GenreID:     genre.GenreID,
		PostDate:    time.Now(),
	}

	err := postService.CreatePost(post)
	assert.NoError(t, err)
	assert.Equal(t, "user123", post.UserID)
	assert.Equal(t, "テスト投稿", post.Title)
}

// TestPostService_GetAllPosts - 全投稿の取得（map形式）
func TestPostService_GetAllPosts(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	// テストデータ準備
	setupTestPostData(db)

	posts, err := postService.GetAllPosts()
	assert.NoError(t, err)
	assert.Greater(t, len(posts), 0)

	// レスポンス形式確認
	for _, post := range posts {
		// 必須フィールドの確認
		assert.NotNil(t, post["postId"])
		assert.NotNil(t, post["userId"])
		assert.NotNil(t, post["title"])
		assert.NotNil(t, post["text"])
		assert.NotNil(t, post["postImage"])
		assert.NotNil(t, post["numView"])
		assert.NotNil(t, post["numReaction"])

		// Genre JOIN 確認
		assert.NotNil(t, post["genreId"])
		assert.NotNil(t, post["genreName"])

		// Place JOIN 確認
		assert.NotNil(t, post["placeId"])
		assert.NotNil(t, post["latitude"])
		assert.NotNil(t, post["longitude"])
	}
}

// TestPostService_GetPostDetail - 投稿詳細取得と閲覧数インクリメント
func TestPostService_GetPostDetail(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	// テストデータ準備
	setupTestPostData(db)

	var testPost models.Post
	db.First(&testPost)

	// 詳細取得（閲覧数カウント）
	post, err := postService.GetPostDetail(testPost.ID)
	assert.NoError(t, err)
	assert.NotNil(t, post)

	// レスポンス形式確認
	assert.Equal(t, testPost.ID, post["postId"])
	assert.Equal(t, testPost.UserID, post["userId"])
	assert.Equal(t, testPost.Title, post["title"])
	assert.Equal(t, testPost.Text, post["text"])
	assert.NotNil(t, post["numView"])
	assert.NotNil(t, post["genreId"])
	assert.NotNil(t, post["genreName"])
	assert.NotNil(t, post["placeId"])
	assert.NotNil(t, post["latitude"])
	assert.NotNil(t, post["longitude"])

	// 閲覧数が増加したか確認
	var updatedPost models.Post
	db.First(&updatedPost, testPost.ID)
	assert.Equal(t, testPost.NumView+1, updatedPost.NumView)
}

// TestPostService_GetPostDetail_NotFound - 存在しない投稿エラーハンドリング
func TestPostService_GetPostDetail_NotFound(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	setupTestPostData(db)

	post, err := postService.GetPostDetail(99999)
	assert.Error(t, err)
	assert.Nil(t, post)
}

// TestPostService_SearchPostsByGenre - ジャンル別検索
func TestPostService_SearchPostsByGenre(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	setupTestPostData(db)

	// ジャンルID 1 の投稿検索
	posts, err := postService.SearchPostsByGenre(1)
	assert.NoError(t, err)
	assert.NotNil(t, posts)

	// ジャンルが一致することを確認
	for _, post := range posts {
		assert.Equal(t, 1, post.GenreID)
	}
}

// TestPostService_SearchPostsByKeyword - キーワード検索
func TestPostService_SearchPostsByKeyword(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	setupTestPostData(db)

	// キーワード検索
	posts, err := postService.SearchPostsByKeyword("テスト")
	assert.NoError(t, err)
	assert.NotNil(t, posts)
	assert.Greater(t, len(posts), 0)
}

// TestPostService_AddReaction - リアクション追加
func TestPostService_AddReaction(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	setupTestPostData(db)

	var testPost models.Post
	db.First(&testPost)

	// リアクション追加
	err := postService.AddReaction("user123", testPost.ID)
	assert.NoError(t, err)

	// リアクション確認
	reacted, err := postService.IsUserReacted("user123", testPost.ID)
	assert.NoError(t, err)
	assert.True(t, reacted)
}

// TestPostService_IsUserReacted - ユーザーのリアクション状態確認
func TestPostService_IsUserReacted(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	setupTestPostData(db)

	var testPost models.Post
	db.First(&testPost)

	// リアクションなし
	reacted, err := postService.IsUserReacted("user999", testPost.ID)
	assert.NoError(t, err)
	assert.False(t, reacted)

	// リアクション追加
	err = postService.AddReaction("user999", testPost.ID)
	assert.NoError(t, err)

	// リアクション確認
	reacted, err = postService.IsUserReacted("user999", testPost.ID)
	assert.NoError(t, err)
	assert.True(t, reacted)
}

// TestPostService_AnonymizePost - 投稿の匿名化
func TestPostService_AnonymizePost(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	setupTestPostData(db)

	var testPost models.Post
	db.First(&testPost)

	err := postService.AnonymizePost(testPost.ID)
	assert.NoError(t, err)

	// 匿名化確認
	var anonymizedPost models.Post
	db.First(&anonymizedPost, testPost.ID)
	assert.True(t, anonymizedPost.IsAnonymized)
}

// TestPostService_DeletePost - 投稿削除（所有者確認付き）
func TestPostService_DeletePost(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	setupTestPostData(db)

	var testPost models.Post
	db.First(&testPost)
	postID := testPost.ID
	userID := testPost.UserID

	// 所有者による削除
	err := postService.DeletePost(postID, userID)
	assert.NoError(t, err)

	// 削除確認
	var deletedPost models.Post
	errResult := db.First(&deletedPost, postID).Error
	assert.Equal(t, gorm.ErrRecordNotFound, errResult)
}

// TestPostService_DeletePost_Unauthorized - 非所有者による削除拒否
func TestPostService_DeletePost_Unauthorized(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	setupTestPostData(db)

	var testPost models.Post
	db.First(&testPost)

	// 異なるユーザーが削除を試みる
	err := postService.DeletePost(testPost.ID, "unauthorized_user")
	assert.Error(t, err)

	// 投稿がまだ存在することを確認
	var stillExistsPost models.Post
	errResult := db.First(&stillExistsPost, testPost.ID).Error
	assert.NoError(t, errResult)
}

// TestPostService_GetUserPostHistory - ユーザーの投稿履歴取得
func TestPostService_GetUserPostHistory(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	setupTestPostData(db)

	posts, err := postService.GetUserPostHistory("user123")
	assert.NoError(t, err)
	assert.NotNil(t, posts)

	// ユーザーIDが一致することを確認
	for _, post := range posts {
		assert.Equal(t, "user123", post.UserID)
	}
}

// TestPostService_ResponseFieldMapping - レスポンスフィールドマッピング確認
func TestPostService_ResponseFieldMapping(t *testing.T) {
	db := setupTestDB(t)
	postService := &PostService{}

	setupTestPostData(db)

	posts, err := postService.GetAllPosts()
	assert.NoError(t, err)

	if len(posts) > 0 {
		post := posts[0]

		// Post テーブルのフィールド確認
		requiredFields := []string{
			"postId",      // Post.ID
			"userId",      // Post.UserID
			"title",       // Post.Title
			"text",        // Post.Text
			"postImage",   // Post.PostImage
			"numView",     // Post.NumView
			"numReaction", // Post.NumReaction
			"postData",    // Post.PostDate
			"createdAt",   // Post.CreatedAt
		}

		for _, field := range requiredFields {
			assert.NotNil(t, post[field], "フィールド %s が見つかりません", field)
		}

		// Genre JOIN フィールド確認
		assert.NotNil(t, post["genreId"])
		assert.NotNil(t, post["genreName"])

		// Place JOIN フィールド確認
		assert.NotNil(t, post["placeId"])
		assert.NotNil(t, post["latitude"])
		assert.NotNil(t, post["longitude"])
	}
}

// Helper: setupTestPostData - テストデータ準備
func setupTestPostData(db *gorm.DB) {
	// ジャンル作成
	genres := []models.Genre{
		{GenreName: "グルメ"},
		{GenreName: "イベント"},
		{GenreName: "景色"},
	}
	for _, genre := range genres {
		db.Create(&genre)
	}

	// 場所作成
	places := []models.Place{
		{Latitude: 35.6762, Longitude: 139.6503, NumPost: 0},
		{Latitude: 35.6815, Longitude: 139.7670, NumPost: 0},
	}
	for _, place := range places {
		db.Create(&place)
	}

	// 投稿作成
	posts := []models.Post{
		{
			UserID:       "user123",
			Title:        "テスト投稿1",
			Text:         "テスト投稿の内容1",
			PostImage:    "test1.jpg",
			NumView:      10,
			NumReaction:  5,
			PlaceID:      1,
			GenreID:      1,
			PostDate:     time.Now(),
			IsAnonymized: false,
		},
		{
			UserID:       "user456",
			Title:        "テスト投稿2",
			Text:         "テスト投稿の内容2",
			PostImage:    "test2.jpg",
			NumView:      20,
			NumReaction:  8,
			PlaceID:      2,
			GenreID:      2,
			PostDate:     time.Now(),
			IsAnonymized: false,
		},
	}
	for _, post := range posts {
		db.Create(&post)
	}
}
