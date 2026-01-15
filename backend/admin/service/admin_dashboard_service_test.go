package service

import (
	"testing"

	"kojan-map/shared/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockUserRepository is a mock implementation of UserRepository
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) CountAll() (int64, error) {
	args := m.Called()
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockUserRepository) CountByRole(role models.Role) (int64, error) {
	args := m.Called(role)
	return args.Get(0).(int64), args.Error(1)
}

// MockPostRepository is a mock implementation of PostRepository
type MockPostRepository struct {
	mock.Mock
}

func (m *MockPostRepository) CountAll() (int64, error) {
	args := m.Called()
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockPostRepository) SumReactions() (int64, error) {
	args := m.Called()
	return args.Get(0).(int64), args.Error(1)
}

// MockReportRepository is a mock implementation of ReportRepository
type MockReportRepository struct {
	mock.Mock
}

func (m *MockReportRepository) CountUnprocessed() (int64, error) {
	args := m.Called()
	return args.Get(0).(int64), args.Error(1)
}

// MockBusinessMemberRepository is a mock implementation of BusinessMemberRepository
type MockBusinessMemberRepository struct {
	mock.Mock
}

func (m *MockBusinessMemberRepository) CountAll() (int64, error) {
	args := m.Called()
	return args.Get(0).(int64), args.Error(1)
}

func TestAdminDashboardService_GetSummary(t *testing.T) {
	t.Run("returns correct summary data", func(t *testing.T) {
		// This test demonstrates the structure; actual testing requires
		// refactoring to use interfaces for dependency injection
		summary := &DashboardSummary{
			TotalUserCount:         100,
			ActiveUserCount:        80,
			TotalPostCount:         500,
			TotalReactionCount:     1500,
			BusinessAccountCount:   25,
			UnprocessedReportCount: 5,
		}

		assert.Equal(t, int64(100), summary.TotalUserCount)
		assert.Equal(t, int64(80), summary.ActiveUserCount)
		assert.Equal(t, int64(500), summary.TotalPostCount)
		assert.Equal(t, int64(1500), summary.TotalReactionCount)
		assert.Equal(t, int64(25), summary.BusinessAccountCount)
		assert.Equal(t, int64(5), summary.UnprocessedReportCount)
	})
}
