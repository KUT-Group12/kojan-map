package service

import (
	adminrepo "kojan-map/admin/repository"
	"kojan-map/shared/models"
	sharedrepo "kojan-map/shared/repository"
)

// DashboardSummary represents the admin dashboard summary response
type DashboardSummary struct {
	TotalUserCount         int64 `json:"totalUserCount"`
	ActiveUserCount        int64 `json:"activeUserCount"`
	TotalPostCount         int64 `json:"totalPostCount"`
	TotalReactionCount     int64 `json:"totalReactionCount"`
	BusinessAccountCount   int64 `json:"businessAccountCount"`
	UnprocessedReportCount int64 `json:"unprocessedReportCount"`
}

// AdminDashboardService handles admin dashboard business logic
type AdminDashboardService struct {
	userRepo           *sharedrepo.UserRepository
	postRepo           *sharedrepo.PostRepository
	reportRepo         *adminrepo.ReportRepository
	businessMemberRepo *adminrepo.BusinessMemberRepository
}

// NewAdminDashboardService creates a new AdminDashboardService
func NewAdminDashboardService(
	userRepo *sharedrepo.UserRepository,
	postRepo *sharedrepo.PostRepository,
	reportRepo *adminrepo.ReportRepository,
	businessMemberRepo *adminrepo.BusinessMemberRepository,
) *AdminDashboardService {
	return &AdminDashboardService{
		userRepo:           userRepo,
		postRepo:           postRepo,
		reportRepo:         reportRepo,
		businessMemberRepo: businessMemberRepo,
	}
}

// GetSummary retrieves the dashboard summary data
func (s *AdminDashboardService) GetSummary() (*DashboardSummary, error) {
	totalUsers, err := s.userRepo.CountAll()
	if err != nil {
		return nil, err
	}

	// Active users are those without deletedAt
	activeUsers, err := s.userRepo.CountByRole(models.RoleUser)
	if err != nil {
		return nil, err
	}

	totalPosts, err := s.postRepo.CountAll()
	if err != nil {
		return nil, err
	}

	totalReactions, err := s.postRepo.SumReactions()
	if err != nil {
		return nil, err
	}

	businessCount, err := s.businessMemberRepo.CountAll()
	if err != nil {
		return nil, err
	}

	unprocessedReports, err := s.reportRepo.CountUnprocessed()
	if err != nil {
		return nil, err
	}

	return &DashboardSummary{
		TotalUserCount:         totalUsers,
		ActiveUserCount:        activeUsers,
		TotalPostCount:         totalPosts,
		TotalReactionCount:     totalReactions,
		BusinessAccountCount:   businessCount,
		UnprocessedReportCount: unprocessedReports,
	}, nil
}
