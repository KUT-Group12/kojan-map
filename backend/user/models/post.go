package models

import (
	"time"

	"gorm.io/gorm"
)

// Post 投稿モデル
type Post struct {
	ID          int            `gorm:"column:postId;primaryKey" json:"postId"`
	PlaceID     int            `gorm:"column:placeId;index" json:"placeId"`
	UserID      string         `gorm:"column:userId;index" json:"userId"`
	PostDate    time.Time      `gorm:"column:postDate" json:"postDate"`
	Title       string         `gorm:"column:title;type:varchar(50)" json:"title"`
	Text        string         `gorm:"column:text;type:text" json:"text"`
	PostImage   []byte         `gorm:"column:postImage;type:blob" json:"postImage"`
	NumReaction int            `gorm:"column:numReaction;default:0" json:"numReaction"`
	NumView     int            `gorm:"column:numView;default:0" json:"numView"`
	GenreID     int            `gorm:"column:genreId;index" json:"genreId"`
	DeletedAt   gorm.DeletedAt `gorm:"column:deletedAt;index" json:"-"`
}

// TableName テーブル名を指定
func (Post) TableName() string {
	return "posts"
}

// UserReaction ユーザーのリアクション記録（表17）
type UserReaction struct {
	ID        int       `gorm:"column:reactionId;primaryKey" json:"reactionId"`
	UserID    string    `gorm:"column:userId;index" json:"userId"`
	PostID    int       `gorm:"column:postId;index" json:"postId"`
	CreatedAt time.Time `gorm:"column:createdAt" json:"createdAt"`
}

// TableName テーブル名を指定
func (UserReaction) TableName() string {
	return "reactions"
}
