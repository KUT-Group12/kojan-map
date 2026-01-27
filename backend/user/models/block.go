package models

// UserBlock ユーザーブロック情報
type UserBlock struct {
	BlockId   int32  `gorm:"column:blockId;primaryKey;autoIncrement" json:"blockId"`
	BlockerId string `gorm:"column:blockerId;size:50;not null;index" json:"blockerId"`
	BlockedId string `gorm:"column:blockedId;size:50;not null;index" json:"blockedId"`
}

// TableName テーブル名を指定
func (UserBlock) TableName() string {
	return "block"
}
