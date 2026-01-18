package domain

import "time"

// Post は投稿を表すドメインモデル
type Post struct {
	ID             string `gorm:"primaryKey"`
	AuthorID       string
	BusinessMember BusinessMember
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
type PostImage struct {
	ID       string `gorm:"primaryKey"`
	PostID   string
	ImageURL string
}

// TableName は対応するテーブル名を指定
func (PostImage) TableName() string {
	return "post_images"
}

// PostGenre は投稿とジャンルの多対多の中間テーブル
type PostGenre struct {
	PostID  string `gorm:"primaryKey"`
	GenreID int64  `gorm:"primaryKey"`
}

// TableName は対応するテーブル名を指定
func (PostGenre) TableName() string {
	return "post_genre"
}

// Genre はジャンルを表すドメインモデル（プレースホルダー）
type Genre struct {
	ID   int64  `gorm:"primaryKey"`
	Name string
}

// TableName は対応するテーブル名を指定
func (Genre) TableName() string {
	return "genres"
}

// CreatePostRequest は投稿作成時のリクエスト
type CreatePostRequest struct {
	LocationID  string   `json:"locationId" binding:"required"`
	GenreIDs    []int64  `json:"genreIds" binding:"required,min=1"`
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Images      []string `json:"images"`
}

// PostResponse は投稿情報のレスポンス
type PostResponse struct {
	PostID        string   `json:"postId"`
	LocationID    string   `json:"locationId"`
	GenreID       string   `json:"genreId"`
	Title         string   `json:"title"`
	ViewCount     int64    `json:"viewCount"`
	ReactionCount int64    `json:"reactionCount"`
	AuthorID      string   `json:"authorId"`
	PostedAt      string   `json:"postedAt"` // ISO 8601形式 (YYYY-MM-DDTHH:mm)
	Description   string   `json:"description"`
	Images        []string `json:"images"`
}

// PostHistoryResponse は投稿履歴のレスポンス
type PostHistoryResponse struct {
	PostID        string `json:"postId"`
	GenreID       string `json:"genreId"`
	Title         string `json:"title"`
	ReactionCount int64  `json:"reactionCount"`
	PostedAt      string `json:"postedAt"` // ISO 8601形式 (YYYY-MM-DDTHH:mm)
	Description   string `json:"description"`
}

// AnonymizePostRequest は投稿匿名化のリクエスト
type AnonymizePostRequest struct {
	PostID string `json:"postId" binding:"required"`
}
