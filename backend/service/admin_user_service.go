package service

import (
	"errors"
	"kojan-map/models"
	"kojan-map/repository"
)

// UserListResponse represents the paginated user list response
type UserListResponse struct {
	Users []models.User `json:"users"`
	Total int64         `json:"total"`
	Page  int           `json:"page"`
}

// AdminUserService handles admin user management business logic
type AdminUserService struct {
	userRepo *repository.UserRepository
}

// NewAdminUserService creates a new AdminUserService
func NewAdminUserService(userRepo *repository.UserRepository) *AdminUserService {
	return &AdminUserService{userRepo: userRepo}
}

// GetUsers retrieves users with pagination
func (s *AdminUserService) GetUsers(page, pageSize int) (*UserListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	users, total, err := s.userRepo.FindAll(page, pageSize)
	if err != nil {
		return nil, err
	}

	return &UserListResponse{
		Users: users,
		Total: total,
		Page:  page,
	}, nil
}

// DeleteUser soft-deletes a user
func (s *AdminUserService) DeleteUser(googleID string) error {
	// Verify the user exists
	user, err := s.userRepo.FindByGoogleID(googleID)
	if err != nil {
		return errors.New("user not found")
	}

	if user.DeletedAt != nil {
		return errors.New("user is already deleted")
	}

	// Prevent deleting admin users
	if user.Role == models.RoleAdmin {
		return errors.New("cannot delete admin users")
	}

	return s.userRepo.SoftDelete(googleID)
}
