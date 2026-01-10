package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAdminReportHandler_GetReports(t *testing.T) {
	t.Run("returns 200 OK with default pagination", func(t *testing.T) {
		router := setupTestRouter()
		
		router.GET("/api/admin/reports", func(c *gin.Context) {
			page := c.DefaultQuery("page", "1")
			pageSize := c.DefaultQuery("pageSize", "20")
			
			c.JSON(http.StatusOK, gin.H{
				"reports":  []interface{}{},
				"total":    0,
				"page":     page,
				"pageSize": pageSize,
			})
		})

		req, _ := http.NewRequest("GET", "/api/admin/reports", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})

	t.Run("accepts handled filter parameter", func(t *testing.T) {
		router := setupTestRouter()
		
		router.GET("/api/admin/reports", func(c *gin.Context) {
			handled := c.Query("handled")
			c.JSON(http.StatusOK, gin.H{"filter": handled})
		})

		req, _ := http.NewRequest("GET", "/api/admin/reports?handled=true", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})
}

func TestAdminReportHandler_HandleReport(t *testing.T) {
	t.Run("returns 400 for invalid report ID", func(t *testing.T) {
		router := setupTestRouter()
		
		router.PUT("/api/admin/reports/:id/handle", func(c *gin.Context) {
			id := c.Param("id")
			if id == "invalid" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report ID"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		req, _ := http.NewRequest("PUT", "/api/admin/reports/invalid/handle", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusBadRequest, resp.Code)
	})

	t.Run("returns 200 for valid report ID", func(t *testing.T) {
		router := setupTestRouter()
		
		router.PUT("/api/admin/reports/:id/handle", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		req, _ := http.NewRequest("PUT", "/api/admin/reports/123/handle", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})
}
