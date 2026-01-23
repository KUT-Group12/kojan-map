package models

type Genre struct {
	GenreID   int32  `gorm:"column:genreId;primaryKey;autoIncrement" json:"genreId"`
	GenreName string `gorm:"column:genreName;size:50;not null" json:"genreName"`
	Color     string `gorm:"column:color;size:6" json:"color"`
}

func (Genre) TableName() string {
	return "genre"
}
