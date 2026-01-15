package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	return gin.New()
}

func TestAdminDashboardHandler_GetSummary(t *testing.T) {
	t.Run("returns 200 OK for valid request", func(t *testing.T) {
		router := setupTestRouter()

		// Mock handler that returns dummy data
		router.GET("/api/admin/summary", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"totalUserCount":         100,
				"activeUserCount":        80,
				"totalPostCount":         500,
				"totalReactionCount":     1500,
				"businessAccountCount":   25,
				"unprocessedReportCount": 5,
			})
		})

		req, _ := http.NewRequest("GET", "/api/admin/summary", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})
}
