package service

import (
	"errors"
	"time"

	adminrepo "kojan-map/admin/repository"
	"kojan-map/shared/models"
	sharedrepo "kojan-map/shared/repository"

	"gorm.io/gorm"
)

// BusinessApplicationResponse represents a business application with user info
type BusinessApplicationResponse struct {
	RequestID      int    `json:"requestId"`
	BusinessName   string `json:"businessName"`
	ApplicantName  string `json:"applicantName"`
	ApplicantEmail string `json:"applicantEmail"`
	Status         string `json:"status"`
	Address        string `json:"address"`
	Phone          string `json:"phone"`
	CreatedAt      string `json:"createdAt"`
}

// AdminBusinessService handles admin business application management
type AdminBusinessService struct {
	db                 *gorm.DB
	requestRepo        *adminrepo.BusinessRequestRepository
	userRepo           *sharedrepo.UserRepository
	businessMemberRepo *adminrepo.BusinessMemberRepository
}

// NewAdminBusinessService creates a new AdminBusinessService
func NewAdminBusinessService(
	db *gorm.DB,
	requestRepo *adminrepo.BusinessRequestRepository,
	userRepo *sharedrepo.UserRepository,
	businessMemberRepo *adminrepo.BusinessMemberRepository,
) *AdminBusinessService {
	return &AdminBusinessService{
		db:                 db,
		requestRepo:        requestRepo,
		userRepo:           userRepo,
		businessMemberRepo: businessMemberRepo,
	}
}

// GetApplications retrieves all business applications
func (s *AdminBusinessService) GetApplications() ([]BusinessApplicationResponse, error) {
	requests, err := s.requestRepo.FindAll()
	if err != nil {
		return nil, err
	}

	var responses []BusinessApplicationResponse
	for _, req := range requests {
		user, err := s.userRepo.FindByGoogleID(req.UserID)

		if err != nil {
			// Log error but continue processing other requests
			// In production, use proper logging: log.Printf("Failed to find user %s: %v", req.UserID, err)
		}
		applicantName := ""
		applicantEmail := ""
		if user != nil {
			applicantEmail = user.Gmail
			// Gmail prefix as name (簡易的な実装)
			applicantName = user.Gmail
		}

		responses = append(responses, BusinessApplicationResponse{
			RequestID:      req.RequestID,
			BusinessName:   req.Name,
			ApplicantName:  applicantName,
			ApplicantEmail: applicantEmail,
			Status:         req.Status,
			Address:        req.Address,
			Phone:          req.Phone,
			CreatedAt:      req.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	return responses, nil
}

// ApproveApplication approves a business application
func (s *AdminBusinessService) ApproveApplication(id int) error {
	request, err := s.requestRepo.FindByID(id)
	if err != nil {
		return errors.New("application not found")
	}

	if request.Status != "pending" {
		return errors.New("application is already processed")
	}

	// Verify user exists before creating business member
	_, err = s.userRepo.FindByGoogleID(request.UserID)
	if err != nil {
		return err
	}

	// Use transaction to ensure data consistency
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Update request status to approved
		if err := s.requestRepo.UpdateStatus(id, "approved"); err != nil {
			return err
		}

		// Create business member entry
		businessMember := &models.BusinessMember{
			BusinessName:     request.Name,
			KanaBusinessName: request.Name, // Simplified
			Address:          request.Address,
			Phone:            request.Phone,
			UserID:           request.UserID,
			PlaceID:          nil, // To be set later when place is created
			RegistDate:       time.Now(),
		}

		if err := s.businessMemberRepo.Create(businessMember); err != nil {
			return err
		}

		return nil
	})
}

// RejectApplication rejects a business application
func (s *AdminBusinessService) RejectApplication(id int) error {
	request, err := s.requestRepo.FindByID(id)
	if err != nil {
		return errors.New("application not found")
	}

	if request.Status != "pending" {
		return errors.New("application is already processed")
	}

	return s.requestRepo.UpdateStatus(id, "rejected")
}
