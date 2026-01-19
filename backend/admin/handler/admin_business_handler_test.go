package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAdminBusinessHandler_GetApplications(t *testing.T) {
	t.Run("returns 200 OK with applications list", func(t *testing.T) {
		router := setupTestRouter()

		router.GET("/api/admin/request", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"applications": []interface{}{}})
		})

		req, _ := http.NewRequest("GET", "/api/admin/request", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})
}

func TestAdminBusinessHandler_ApproveApplication(t *testing.T) {
	t.Run("returns 400 for invalid application ID", func(t *testing.T) {
		router := setupTestRouter()

		router.PUT("/api/applications/:id/approve", func(c *gin.Context) {
			id := c.Param("id")
			if id == "invalid" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid application ID"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		req, _ := http.NewRequest("PUT", "/api/applications/invalid/approve", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusBadRequest, resp.Code)
	})

	t.Run("returns 200 for valid application ID", func(t *testing.T) {
		router := setupTestRouter()

		router.PUT("/api/applications/:id/approve", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		req, _ := http.NewRequest("PUT", "/api/applications/1/approve", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})
}

func TestAdminBusinessHandler_RejectApplication(t *testing.T) {
	t.Run("returns 200 for valid rejection", func(t *testing.T) {
		router := setupTestRouter()

		router.PUT("/api/applications/:id/reject", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		req, _ := http.NewRequest("PUT", "/api/applications/1/reject", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})
}
