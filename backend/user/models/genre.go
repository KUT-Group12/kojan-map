package models

import (
	"gorm.io/gorm"
)

type Genre struct {
	GenreID   int    `gorm:"column:genre_id;primaryKey;autoIncrement" json:"genreId"`
	GenreName string `gorm:"column:genre_name;size:50;not null" json:"genreName"`
}

func (Genre) TableName() string {
	return "genre"
}

func (g *Genre) BeforeCreate(tx *gorm.DB) error {
	return nil
}
