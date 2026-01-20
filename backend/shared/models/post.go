package models

import (
	"time"
)

// Post represents the 投稿内容 table
type Post struct {
	PostID      int32     `gorm:"column:postId;primaryKey;autoIncrement" json:"postId"`
	PlaceID     int32     `gorm:"column:placeId;not null" json:"placeId"`
	UserID      string    `gorm:"column:userId;not null;size:50" json:"userId"`
	PostDate    time.Time `gorm:"column:postDate;not null" json:"postDate"`
	Title       string    `gorm:"column:title;not null;size:50" json:"title"`
	Text        string    `gorm:"column:text;not null;type:text" json:"text"`
	PostImage   []byte    `gorm:"column:postImage;type:blob" json:"-"`
	NumReaction int32     `gorm:"column:numReaction;not null;default:0" json:"numReaction"`
	NumView     int32     `gorm:"column:numView;not null;default:0" json:"numView"`
	GenreID     int32     `gorm:"column:genreId;not null" json:"genreId"`
}

// TableName specifies the table name for Post
func (Post) TableName() string {
	return "posts"
}
