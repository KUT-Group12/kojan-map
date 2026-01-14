package models

import (
	"time"

	"gorm.io/gorm"
)

// Post 投稿モデル
type Post struct {
	ID          int            `gorm:"primaryKey" json:"postId"`
	PlaceID     int            `gorm:"index" json:"placeId"`
	UserID      string         `gorm:"index" json:"userId"`
	PostDate    time.Time      `json:"postDate"`
	Title       string         `gorm:"type:varchar(50)" json:"title"`
	Text        string         `gorm:"type:text" json:"text"`
	PostImage   []byte         `gorm:"type:blob" json:"postImage"`
	NumReaction int            `gorm:"default:0" json:"numReaction"`
	NumView     int            `gorm:"default:0" json:"numView"`
	GenreID     int            `gorm:"index" json:"genreId"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
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
