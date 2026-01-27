package services

import (
	"math"

	"gorm.io/gorm"

	"kojan-map/user/models"
)

// PlaceService 場所サービス
type PlaceService struct {
	db *gorm.DB
}

// NewPlaceService 場所サービスを初期化
func NewPlaceService(db *gorm.DB) *PlaceService {
	return &PlaceService{db: db}
}

// FindOrCreatePlace 緯度経度から場所を検索または作成
// 同じ場所（近距離）が存在する場合はそのIDを返し、なければ新規作成
// FindOrCreatePlace 緯度経度から場所を検索または作成
// 同じ場所（近距離）が存在する場合はそのIDを返し、なければ新規作成
func (ps *PlaceService) FindOrCreatePlace(latitude, longitude float64) (int32, error) {
	const threshold = 0.0001 // 約11m以内を同じ場所と判定

	var placeID int32

	// トランザクションを開始して整合性を保つ
	err := ps.db.Transaction(func(tx *gorm.DB) error {
		var place models.Place

		// 近くの場所を検索（排他ロックを取得して競合を防ぐ）
		// Note: MySQLの場合、FOR UPDATEはインデックスが効かないとテーブルロックになる可能性があるため注意が必要だが、
		// ここではデータ整合性を優先する。
		if err := tx.Set("gorm:query_option", "FOR UPDATE").Where(
			"ABS(latitude - ?) < ? AND ABS(longitude - ?) < ?",
			latitude, threshold, longitude, threshold,
		).First(&place).Error; err == nil {
			// 既存の場所が見つかった場合、投稿数をインクリメント
			if updateErr := tx.Model(&place).Update("numPost", place.NumPost+1).Error; updateErr != nil {
				return updateErr
			}
			placeID = place.ID
			return nil
		} else if err != gorm.ErrRecordNotFound {
			return err
		}

		// 新規場所を作成
		newPlace := models.Place{
			Latitude:  latitude,
			Longitude: longitude,
			NumPost:   1,
		}

		if err := tx.Create(&newPlace).Error; err != nil {
			return err
		}
		placeID = newPlace.ID
		return nil
	})

	if err != nil {
		return 0, err
	}

	return placeID, nil
}

// GetPlaceByID IDから場所情報を取得
func (ps *PlaceService) GetPlaceByID(placeID int32) (*models.Place, error) {
	var place models.Place
	err := ps.db.First(&place, placeID).Error
	if err != nil {
		return nil, err
	}
	return &place, nil
}

// CalculateDistance 2点間の距離を計算（メートル単位）
func (ps *PlaceService) CalculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadius = 6371000 // 地球の半径（メートル）

	lat1Rad := lat1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	deltaLat := (lat2 - lat1) * math.Pi / 180
	deltaLon := (lon2 - lon1) * math.Pi / 180

	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(deltaLon/2)*math.Sin(deltaLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadius * c
}
