package models

// Place 場所モデル
type Place struct {
	ID        int     `gorm:"column:placeId;primaryKey;autoIncrement" json:"placeId"`
	NumPost   int     `gorm:"column:numPost;default:0" json:"numPost"`
	Latitude  float64 `gorm:"column:latitude" json:"latitude"`
	Longitude float64 `gorm:"column:longitude" json:"longitude"`
}

// TableName テーブル名を指定
func (Place) TableName() string {
	return "places"
}
