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
func (s *GenreService) GetGenreByName(genreName string) (int, error) {
	// ジャンル名のマッピング
	genreMapping := map[string]string{
		"food":      "グルメ",
		"event":     "イベント",
		"scenery":   "景色",
		"shop":      "お店",
		"emergency": "緊急情報",
		"other":     "その他",
	}

	japaneseName, ok := genreMapping[genreName]
	if !ok {
		return 0, errors.New("無効なジャンル名です")
	}

	var genre models.Genre
	if err := s.DB.Where("genre_name = ?", japaneseName).First(&genre).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, errors.New("ジャンルが見つかりませんでした")
		}
		return 0, err
	}

	return genre.GenreID, nil
}

// GetGenreByID は、ジャンルIDからジャンル情報を取得します
func (s *GenreService) GetGenreByID(genreID int) (*models.Genre, error) {
	var genre models.Genre
	if err := s.DB.Where("genre_id = ?", genreID).First(&genre).Error; err != nil {
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
