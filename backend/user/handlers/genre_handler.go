package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/user/services"
)

type GenreHandler struct {
	genreService *services.GenreService
}

func NewGenreHandler(genreService *services.GenreService) *GenreHandler {
	return &GenreHandler{genreService: genreService}
}

// GetGenres ジャンル一覧を取得
// GET /api/genres
func (gh *GenreHandler) GetGenres(c *gin.Context) {
	genres, err := gh.genreService.GetAllGenres()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch genres"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"genres": genres})
}
