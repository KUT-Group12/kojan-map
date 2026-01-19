package domain

import "time"

// Post は投稿を表すドメインモデル
// ID: 主キー
// AuthorID: 投稿者ID
// BusinessMember: 事業者メンバー情報
// LocationID: 場所ID
// Title: タイトル
// Description: 説明
// ViewCount: 閲覧数
// ReactionCount: リアクション数
// PostedAt: 投稿日時
// UpdatedAt: 更新日時
// AnonymizedAt: 匿名化日時（NULL可）
// IsActive: アクティブフラグ（論理削除用）
// Images: 投稿画像リスト（外部キー: PostID）
// Genres: ジャンルリスト（多対多リレーション、中間テーブル: post_genre）
type Post struct {
	ID             int64 `gorm:"primaryKey;autoIncrement"`
	AuthorID       string
	BusinessMember BusinessMember `gorm:"foreignKey:AuthorID;references:UserID"`
	LocationID     string
	Title          string
	Description    string
	ViewCount      int64
	ReactionCount  int64
	PostedAt       time.Time
	UpdatedAt      time.Time
	AnonymizedAt   *time.Time  // 匿名化日時
	IsActive       bool        // 論理削除フラグ
	Images         []PostImage `gorm:"foreignKey:PostID"`
	Genres         []Genre     `gorm:"many2many:post_genre;"` // 多対多リレーション
}

// TableName は対応するテーブル名を指定
func (Post) TableName() string {
	return "posts"
}

// PostImage は投稿画像を表すドメインモデル
// ID: 主キー
// PostID: 投稿ID
// ImageURL: 画像URL
type PostImage struct {
	ID       string `gorm:"primaryKey"`
	PostID   int64
	ImageURL string
}

// TableName は対応するテーブル名を指定
func (PostImage) TableName() string {
	return "post_images"
}

// PostGenre は投稿とジャンルの多対多の中間テーブル
// PostID: 投稿ID（複合主キー）
// GenreID: ジャンルID（複合主キー）
type PostGenre struct {
	PostID   int64   `gorm:"primaryKey"`
	GenreIDs []int64 `json:"genreIds"`
}

// TableName は対応するテーブル名を指定
func (PostGenre) TableName() string {
	return "post_genre"
}

// Genre はジャンルを表すドメインモデル
// ID: 主キー
// Name: ジャンル名
type Genre struct {
	ID   int64 `gorm:"primaryKey"`
	Name string
}

// TableName は対応するテーブル名を指定
func (Genre) TableName() string {
	return "genres"
}

// CreatePostRequest は投稿作成時のリクエスト
// locationId: 必須。場所ID
// genreIds: 必須。ジャンルIDのリスト（最低1つ必要）
// title: 必須。投稿タイトル
// description: 必須。投稿の説明
// images: 画像URLのリスト（任意）
type CreatePostRequest struct {
	LocationID  string   `json:"locationId" binding:"required"`
	GenreIDs    []int64  `json:"genreIds" binding:"required,min=1"`
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Images      []string `json:"images"`
}

// PostResponse は投稿情報のレスポンス
// postId: 投稿ID
// locationId: 場所ID
// genreId: ジャンルID
// title: タイトル
// viewCount: 閲覧数
// reactionCount: リアクション数
// authorId: 投稿者ID
// postedAt: 投稿日時（ISO 8601形式: YYYY-MM-DDTHH:mm）
// description: 説明
// images: 画像URLのリスト
type PostResponse struct {
	PostID        int64    `json:"postId"`
	LocationID    string   `json:"locationId"`
	GenreIDs      []int64  `json:"genreIds"`
	Title         string   `json:"title"`
	ViewCount     int64    `json:"viewCount"`
	ReactionCount int64    `json:"reactionCount"`
	AuthorID      string   `json:"authorId"`
	PostedAt      string   `json:"postedAt"` // ISO 8601形式 (YYYY-MM-DDTHH:mm)
	Description   string   `json:"description"`
	Images        []string `json:"images"`
}

// PostHistoryResponse は投稿履歴のレスポンス
// postId: 投稿ID
// genreId: ジャンルID
// title: タイトル
// reactionCount: リアクション数
// postedAt: 投稿日時（ISO 8601形式: YYYY-MM-DDTHH:mm）
// description: 説明
type PostHistoryResponse struct {
	PostID        int64   `json:"postId"`
	GenreIDs      []int64 `json:"genreIds"`
	Title         string  `json:"title"`
	ReactionCount int64   `json:"reactionCount"`
	PostedAt      string  `json:"postedAt"` // ISO 8601形式 (YYYY-MM-DDTHH:mm)
	Description   string  `json:"description"`
}

// AnonymizePostRequest は投稿匿名化のリクエスト
// postId: 必須。匿名化する投稿のID
type AnonymizePostRequest struct {
	PostID int64 `json:"postId" binding:"required"`
}
