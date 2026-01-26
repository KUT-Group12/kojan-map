package models

import (
	"time"
)

// Post 投稿モデル
type Post struct {
	ID          int32     `gorm:"column:postId;primaryKey" json:"postId"`
	PlaceID     int32     `gorm:"column:placeId;index" json:"placeId"`
	UserID      string    `gorm:"column:userId;type:varchar(50);index" json:"userId"`
	PostDate    time.Time `gorm:"column:postDate" json:"postDate"`
	Title       string    `gorm:"column:title;type:varchar(50)" json:"title"`
	Text        string    `gorm:"column:text;type:text" json:"text"`
	PostImage   []byte    `gorm:"column:postImage;type:longblob" json:"postImage"`
	NumReaction int32     `gorm:"column:numReaction;default:0" json:"numReaction"`
	NumView     int32     `gorm:"column:numView;default:0" json:"numView"`
	GenreID     int32     `gorm:"column:genreId;index" json:"genreId"`
}

// TableName テーブル名を指定
func (Post) TableName() string {
	return "post"
}

// UserReaction ユーザーのリアクション記録（表17）
type UserReaction struct {
	ID        int32     `gorm:"column:reactionId;primaryKey" json:"reactionId"`
	UserID    string    `gorm:"column:userId;type:varchar(50);index" json:"userId"`
	PostID    int32     `gorm:"column:postId;index" json:"postId"`
	CreatedAt time.Time `gorm:"column:createdAt" json:"createdAt"`
}

// TableName テーブル名を指定
func (UserReaction) TableName() string {
	return "reaction"
}
