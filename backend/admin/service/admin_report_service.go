<<<<<<< HEAD
package service

import (
	"errors"

	adminrepo "kojan-map/admin/repository"
	"kojan-map/shared/models"
)

// ReportListResponse represents the paginated report list response
type ReportListResponse struct {
	Reports  []models.Report `json:"reports"`
	Total    int64           `json:"total"`
	Page     int             `json:"page"`
	PageSize int             `json:"pageSize"`
}

// AdminReportService handles admin report management business logic
type AdminReportService struct {
	reportRepo *adminrepo.ReportRepository
}

// NewAdminReportService creates a new AdminReportService
func NewAdminReportService(reportRepo *adminrepo.ReportRepository) *AdminReportService {
	return &AdminReportService{reportRepo: reportRepo}
}

// GetReports retrieves reports with pagination and optional filter
func (s *AdminReportService) GetReports(page, pageSize int, handled *bool) (*ReportListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	reports, total, err := s.reportRepo.FindAll(page, pageSize, handled)
	if err != nil {
		return nil, err
	}

	return &ReportListResponse{
		Reports:  reports,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// MarkAsHandled marks a report as handled
func (s *AdminReportService) MarkAsHandled(id int) error {
	// Verify the report exists
	report, err := s.reportRepo.FindByID(id)
	if err != nil {
		return errors.New("report not found")
	}

	if report.ReportFlag {
		return errors.New("report is already handled")
	}

	return s.reportRepo.MarkAsHandled(id)
}
=======
package service

import (
	"errors"

	adminrepo "kojan-map/admin/repository"
	"kojan-map/shared/models"
)

// ReportListResponse represents the paginated report list response
type ReportListResponse struct {
	Reports  []models.Report `json:"reports"`
	Total    int64           `json:"total"`
	Page     int             `json:"page"`
	PageSize int             `json:"pageSize"`
}

// AdminReportService handles admin report management business logic
type AdminReportService struct {
	reportRepo *adminrepo.ReportRepository
}

// NewAdminReportService creates a new AdminReportService
func NewAdminReportService(reportRepo *adminrepo.ReportRepository) *AdminReportService {
	return &AdminReportService{reportRepo: reportRepo}
}

// GetReports retrieves reports with pagination and optional filter
func (s *AdminReportService) GetReports(page, pageSize int, handled *bool) (*ReportListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	reports, total, err := s.reportRepo.FindAll(page, pageSize, handled)
	if err != nil {
		return nil, err
	}

	return &ReportListResponse{
		Reports:  reports,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// MarkAsHandled marks a report as handled
func (s *AdminReportService) MarkAsHandled(id int) error {
	// Verify the report exists
	report, err := s.reportRepo.FindByID(id)
	if err != nil {
		return errors.New("report not found")
	}

	if report.ReportFlag {
		return errors.New("report is already handled")
	}

	return s.reportRepo.MarkAsHandled(id)
}
>>>>>>> origin/main
