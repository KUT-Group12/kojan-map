package models

import (
	"gorm.io/gorm"
)

// Place 場所モデル
type Place struct {
	ID        int     `gorm:"column:place_id;primaryKey;autoIncrement" json:"placeId"`
	NumPost   int     `gorm:"column:num_post;default:0" json:"numPost"`
	Latitude  float64 `gorm:"column:latitude" json:"latitude"`
	Longitude float64 `gorm:"column:longitude" json:"longitude"`
}

// TableName テーブル名を指定
func (Place) TableName() string {
	return "place"
}

// BeforeCreate 新規作成時の処理
func (p *Place) BeforeCreate(tx *gorm.DB) error {
	if p.NumPost == 0 {
		p.NumPost = 0
	}
	return nil
}
