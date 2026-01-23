package services

import (
	"errors"

	"gorm.io/gorm"

	"kojan-map/user/models"
)

type GenreService struct {
	DB *gorm.DB
}

func NewGenreService(db *gorm.DB) *GenreService {
	return &GenreService{DB: db}
}

// GetGenreByName は、ジャンル名からジャンルIDを取得します
func (s *GenreService) GetGenreByName(genreName string) (int32, error) {
	// DB側のgenreNameは英語コード（例: food,event,scene,store,emergency,other）で管理している想定
	// 入力が日本語の場合にも対応するため、和名->英名マップを用意する
	japaneseToEnglish := map[string]string{
		"グルメ":    "food",
		"イベント":  "event",
		"景色":      "scene",
		"お店":      "store",
		"緊急情報":  "emergency",
		"その他":    "other",
	}

	// そのまま英名が渡された場合はそれを使う
	var lookupName string
	if _, ok := japaneseToEnglish[genreName]; ok {
		lookupName = japaneseToEnglish[genreName]
	} else {
		lookupName = genreName
	}

	var genre models.Genre
	if err := s.DB.Where("genreName = ?", lookupName).First(&genre).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, errors.New("ジャンルが見つかりませんでした")
		}
		return 0, err
	}

	return genre.GenreID, nil
}

// GetGenreByID は、ジャンルIDからジャンル情報を取得します
func (s *GenreService) GetGenreByID(genreID int32) (*models.Genre, error) {
	var genre models.Genre
	if err := s.DB.Where("genreId = ?", genreID).First(&genre).Error; err != nil {
		return nil, err
	}
	return &genre, nil
}

// GetAllGenres は、すべてのジャンルを取得します
func (s *GenreService) GetAllGenres() ([]models.Genre, error) {
	var genres []models.Genre
	if err := s.DB.Find(&genres).Error; err != nil {
		return nil, err
	}
	return genres, nil
}
