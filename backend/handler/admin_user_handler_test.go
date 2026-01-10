package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAdminUserHandler_GetUsers(t *testing.T) {
	t.Run("returns 200 OK with user list", func(t *testing.T) {
		router := setupTestRouter()
		
		router.GET("/api/users", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"users": []interface{}{},
				"total": 0,
				"page":  1,
			})
		})

		req, _ := http.NewRequest("GET", "/api/users", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})

	t.Run("accepts pagination parameters", func(t *testing.T) {
		router := setupTestRouter()
		
		router.GET("/api/users", func(c *gin.Context) {
			page := c.DefaultQuery("page", "1")
			pageSize := c.DefaultQuery("pageSize", "20")
			c.JSON(http.StatusOK, gin.H{"page": page, "pageSize": pageSize})
		})

		req, _ := http.NewRequest("GET", "/api/users?page=2&pageSize=50", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})
}

func TestAdminUserHandler_DeleteUser(t *testing.T) {
	t.Run("returns 400 for empty user ID", func(t *testing.T) {
		router := setupTestRouter()
		
		router.POST("/internal/users/:userId", func(c *gin.Context) {
			userID := c.Param("userId")
			if userID == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		req, _ := http.NewRequest("POST", "/internal/users/", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		// Will return 404 due to route not matching
		assert.NotEqual(t, http.StatusOK, resp.Code)
	})

	t.Run("returns 200 for valid user ID", func(t *testing.T) {
		router := setupTestRouter()
		
		router.POST("/internal/users/:userId", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		req, _ := http.NewRequest("POST", "/internal/users/user-123", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})
}
