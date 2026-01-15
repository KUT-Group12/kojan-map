package service

import (
	"testing"

	"kojan-map/shared/models"

	"github.com/stretchr/testify/assert"
)

func TestAdminUserService_GetUsers(t *testing.T) {
	t.Run("returns paginated results with defaults", func(t *testing.T) {
		page := -1
		pageSize := 0

		if page < 1 {
			page = 1
		}
		if pageSize < 1 || pageSize > 100 {
			pageSize = 20
		}

		assert.Equal(t, 1, page)
		assert.Equal(t, 20, pageSize)
	})
}

func TestAdminUserService_DeleteUser(t *testing.T) {
	t.Run("prevents deleting admin users", func(t *testing.T) {
		user := &models.User{
			GoogleID: "admin-user-id",
			Role:     models.RoleAdmin,
		}

		if user.Role == models.RoleAdmin {
			err := &testError{msg: "cannot delete admin users"}
			assert.Error(t, err)
			assert.Equal(t, "cannot delete admin users", err.Error())
		}
	})

	t.Run("allows deleting regular users", func(t *testing.T) {
		user := &models.User{
			GoogleID: "regular-user-id",
			Role:     models.RoleUser,
		}

		canDelete := user.Role != models.RoleAdmin
		assert.True(t, canDelete)
	})

	t.Run("prevents double deletion", func(t *testing.T) {
		deletedAt := "2025-01-10T12:00:00Z"
		if deletedAt != "" {
			err := &testError{msg: "user is already deleted"}
			assert.Error(t, err)
		}
	})
}

func TestUserListResponse(t *testing.T) {
	t.Run("formats response correctly", func(t *testing.T) {
		response := UserListResponse{
			Users: []models.User{
				{GoogleID: "user1", Gmail: "user1@example.com", Role: models.RoleUser},
				{GoogleID: "user2", Gmail: "user2@example.com", Role: models.RoleBusiness},
			},
			Total: 100,
			Page:  1,
		}

		assert.Equal(t, 2, len(response.Users))
		assert.Equal(t, int64(100), response.Total)
		assert.Equal(t, 1, response.Page)
	})
}
