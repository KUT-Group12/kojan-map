package service

import (
	"errors"
	"log"

	adminrepo "kojan-map/admin/repository"
	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// ReportListResponse represents the paginated report list response
type ReportListResponse struct {
	Reports  []models.Report `json:"reports"`
	Total    int             `json:"total"`
	Page     int             `json:"page"`
	PageSize int             `json:"pageSize"`
}

// ReportDetailResponse represents detailed report information with target post
type ReportDetailResponse struct {
	ReportID     int    `json:"reportId"`
	ReporterID   string `json:"reporterGoogleId"`
	TargetPostID int    `json:"targetPostId"`
	Reason       string `json:"reason"`
	ReportedAt   string `json:"reportedAt"`
	Handled      bool   `json:"handled"`
	Deleted      bool   `json:"deleted"`
	// Target post details
	Post *PostInfo `json:"post,omitempty"`
}

// PostInfo represents basic post information for report detail
type PostInfo struct {
	PostID   int    `json:"postId"`
	Title    string `json:"title"`
	Text     string `json:"text"`
	UserID   string `json:"userId"`
	PostDate string `json:"postDate"`
}

// AdminReportService handles admin report management business logic
type AdminReportService struct {
	reportRepo *adminrepo.ReportRepository
	db         *gorm.DB
}

// NewAdminReportService creates a new AdminReportService
func NewAdminReportService(reportRepo *adminrepo.ReportRepository, db *gorm.DB) *AdminReportService {
	return &AdminReportService{
		reportRepo: reportRepo,
		db:         db,
	}
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

// GetReportDetail retrieves a report with target post information
func (s *AdminReportService) GetReportDetail(reportID int32) (*ReportDetailResponse, error) {
	report, err := s.reportRepo.FindByID(reportID)
	if err != nil {
		return nil, errors.New("report not found")
	}

	response := &ReportDetailResponse{
		ReportID:     int(report.ReportID),
		ReporterID:   report.UserID,
		TargetPostID: int(report.PostID),
		Reason:       report.Reason,
		ReportedAt:   report.Date.Format("2006-01-02T15:04:05Z07:00"),
		Handled:      report.ReportFlag,
		Deleted:      report.RemoveFlag,
	}

	// Get target post information
	var post models.Post
	if err := s.db.Where("postId = ?", report.PostID).First(&post).Error; err == nil {
		response.Post = &PostInfo{
			PostID:   int(post.PostID),
			Title:    post.Title,
			Text:     post.Text,
			UserID:   post.UserID,
			PostDate: post.PostDate.Format("2006-01-02T15:04:05Z07:00"),
		}
	} else {
		// 投稿が見つからない場合はログ出力（削除済みの可能性あり）
		log.Printf("Warning: Post not found for report %d (postId: %d): %v", reportID, report.PostID, err)
	}

	return response, nil
}

// MarkAsHandled marks a report as handled
func (s *AdminReportService) MarkAsHandled(id int32) error {
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
