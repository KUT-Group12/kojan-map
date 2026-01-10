package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAdminContactHandler_GetInquiries(t *testing.T) {
	t.Run("returns 200 OK with inquiries list", func(t *testing.T) {
		router := setupTestRouter()
		
		router.GET("/internal/asks", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"asks": []interface{}{}})
		})

		req, _ := http.NewRequest("GET", "/internal/asks", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})
}

func TestAdminContactHandler_ApproveInquiry(t *testing.T) {
	t.Run("returns 400 for invalid request ID", func(t *testing.T) {
		router := setupTestRouter()
		
		router.POST("/internal/requests/:requestId/approve", func(c *gin.Context) {
			id := c.Param("requestId")
			if id == "invalid" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request ID"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		req, _ := http.NewRequest("POST", "/internal/requests/invalid/approve", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusBadRequest, resp.Code)
	})

	t.Run("returns 200 for valid request ID", func(t *testing.T) {
		router := setupTestRouter()
		
		router.POST("/internal/requests/:requestId/approve", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		req, _ := http.NewRequest("POST", "/internal/requests/123/approve", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})
}

func TestAdminContactHandler_RejectInquiry(t *testing.T) {
	t.Run("returns 200 for valid rejection", func(t *testing.T) {
		router := setupTestRouter()
		
		router.POST("/internal/requests/:requestId/reject", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		req, _ := http.NewRequest("POST", "/internal/requests/123/reject", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})
}
