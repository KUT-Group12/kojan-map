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

// GetGenreByName は、ジャンル名（英語）からジャンルIDを取得します
func (s *GenreService) GetGenreByName(genreName string) (int32, error) {
	var genre models.Genre
	if err := s.DB.Where("genreName = ?", genreName).First(&genre).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, errors.New("ジャンルが見つかりませんでした")
		}
		return 0, err
	}
	return genre.GenreID, nil
}

// GetAllGenres は、すべてのジャンルを取得します
func (s *GenreService) GetAllGenres() ([]models.Genre, error) {
	var genres []models.Genre
	if err := s.DB.Find(&genres).Error; err != nil {
		return nil, err
	}
	return genres, nil
}
