package models

type Genre struct {
	GenreID   int    `gorm:"column:genre_id;primaryKey;autoIncrement" json:"genreId"`
	GenreName string `gorm:"column:genre_name;size:50;not null" json:"genreName"`
	Color     string `gorm:"column:color;size:6" json:"color"`
}

func (Genre) TableName() string {
	return "genre"
}
