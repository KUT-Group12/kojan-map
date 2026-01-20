package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

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
	ID             int32          `gorm:"primaryKey;autoIncrement;column:postId"`
	PlaceID        int32          `gorm:"column:placeId;not null"`
	UserID         string         `gorm:"column:userId;type:varchar(50);not null"`
	PostDate       time.Time      `gorm:"column:postDate;not null"`
	Title          string         `gorm:"column:title;type:varchar(50);not null"`
	Text           string         `gorm:"column:text;type:text;not null"`
	PostImage      []byte         `gorm:"column:postImage;type:blob"`
	NumReaction    int32          `gorm:"column:numReaction;not null"`
	NumView        int32          `gorm:"column:numView;not null"`
	GenreID        int32          `gorm:"column:genreId;not null"`
	BusinessMember BusinessMember `gorm:"foreignKey:UserID;references:UserID"`
}

// TableName は対応するテーブル名を指定
func (Post) TableName() string {
	return "post"
}

// PostImage は投稿画像を表すドメインモデル
// ID: 主キー
// PostID: 投稿ID
// ImageURL: 画像URL
type PostImage struct {
	ID       string `gorm:"primaryKey"`
	PostID   int32
	ImageURL string
}

// TableName は対応するテーブル名を指定
func (PostImage) TableName() string {
	return "post_images"
}

// BeforeCreate はレコード作成前にIDを生成します
func (p *PostImage) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

// PostGenre は投稿とジャンルの多対多の中間テーブル
// PostID: 投稿ID（複合主キー）
// GenreID: ジャンルID（複合主キー）
type PostGenre struct {
	PostID  int32 `gorm:"primaryKey"`
	GenreID int32 `json:"genreIds"`
}

// TableName は対応するテーブル名を指定
func (PostGenre) TableName() string {
	return "post_genre"
}

// Genre はジャンルを表すドメインモデル
// ID: 主キー
// Name: ジャンル名
type Genre struct {
	ID        int32  `gorm:"primaryKey;autoIncrement;column:genreId"`
	GenreName string `gorm:"column:genreName;type:enum('food','event','scene','store','emergency','other');not null"`
	Color     string `gorm:"column:color;type:varchar(6);not null"`
}

// TableName は対応するテーブル名を指定
func (Genre) TableName() string {
	return "genre"
}

// CreatePostRequest は投稿作成時のリクエスト
// locationId: 必須。場所ID
// genreIds: 必須。ジャンルIDのリスト（最低1つ必要）
// title: 必須。投稿タイトル
// description: 必須。投稿の説明
// images: 画像URLのリスト（任意）
type CreatePostRequest struct {
	LocationID  string   `json:"locationId" binding:"required"`
	GenreIDs    []int32  `json:"genreIds" binding:"required,min=1"`
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Images      []string `json:"images"`
}

// PostResponse は投稿情報のレスポンス
// postId: 投稿ID
// locationId: 場所ID
// genreIds: ジャンルIDのリスト
// title: タイトル
// viewCount: 閲覧数
// reactionCount: リアクション数
// authorId: 投稿者ID
// postedAt: 投稿日時（ISO 8601形式: YYYY-MM-DDTHH:mm）
// description: 説明
// images: 画像URLのリスト
type PostResponse struct {
	PostID        int32    `json:"postId"`
	LocationID    string   `json:"locationId"`
	GenreIDs      []int32  `json:"genreIds"`
	Title         string   `json:"title"`
	ViewCount     int32    `json:"viewCount"`
	ReactionCount int32    `json:"reactionCount"`
	AuthorID      string   `json:"authorId"`
	PostedAt      string   `json:"postedAt"` // ISO 8601形式 (YYYY-MM-DDTHH:mm)
	Description   string   `json:"description"`
	Images        []string `json:"images"`
}

// PostHistoryResponse は投稿履歴のレスポンス
// postId: 投稿ID
// genreIds: ジャンルIDのリスト
// title: タイトル
// reactionCount: リアクション数
// postedAt: 投稿日時（ISO 8601形式: YYYY-MM-DDTHH:mm）
// description: 説明
type PostHistoryResponse struct {
	PostID        int32   `json:"postId"`
	GenreIDs      []int32 `json:"genreIds"`
	Title         string  `json:"title"`
	ReactionCount int32   `json:"reactionCount"`
	PostedAt      string  `json:"postedAt"` // ISO 8601形式 (YYYY-MM-DDTHH:mm)
	Description   string  `json:"description"`
}

// AnonymizePostRequest は投稿匿名化のリクエスト
// postId: 必須。匿名化する投稿のID
type AnonymizePostRequest struct {
	PostID int32 `json:"postId" binding:"required"`
}
