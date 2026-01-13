package models

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Post 投稿モデル
type Post struct {
	ID           int               `gorm:"primaryKey" json:"postId"`
	PlaceID      int               `json:"placeId"`
	GenreID      int               `json:"genreId"`
	UserID       string            `json:"userId"`
	Title        string            `json:"title"`
	Text         string            `gorm:"type:longtext" json:"text"`
	PostImage    string            `json:"postImage"`
	NumView      int               `json:"numView"`
	NumReaction  int               `json:"numReaction"`
	PostDate     time.Time         `json:"postData"`
	IsAnonymized bool              `gorm:"default:false" json:"isAnonymized"`
	Location     datatypes.JSONMap `gorm:"type:json" json:"location"`
	CreatedAt    time.Time         `json:"createdAt"`
	UpdatedAt    time.Time         `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt    `gorm:"index" json:"-"`
}

// TableName テーブル名を指定
func (Post) TableName() string {
	return "posts"
}

// UserReaction ユーザーのリアクション記録
type UserReaction struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	PostID    int       `gorm:"index" json:"postId"`
	UserID    string    `gorm:"index" json:"userId"`
	CreatedAt time.Time `json:"createdAt"`
}

// TableName テーブル名を指定
func (UserReaction) TableName() string {
	return "user_reactions"
}
