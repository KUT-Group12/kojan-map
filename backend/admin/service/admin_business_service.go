package service

import (
	"errors"

	adminrepo "kojan-map/admin/repository"
	"kojan-map/shared/models"
	sharedrepo "kojan-map/shared/repository"
)

// BusinessApplicationResponse represents a business application with user info
type BusinessApplicationResponse struct {
	RequestID      int    `json:"requestId"`
	BusinessName   string `json:"businessName"`
	ApplicantName  string `json:"applicantName"`
	ApplicantEmail string `json:"applicantEmail"`
	Status         string `json:"status"`
	CreatedAt      string `json:"createdAt"`
}

// AdminBusinessService handles admin business application management
type AdminBusinessService struct {
	requestRepo        *adminrepo.BusinessRequestRepository
	userRepo           *sharedrepo.UserRepository
	businessMemberRepo *adminrepo.BusinessMemberRepository
}

// NewAdminBusinessService creates a new AdminBusinessService
func NewAdminBusinessService(
	requestRepo *adminrepo.BusinessRequestRepository,
	userRepo *sharedrepo.UserRepository,
	businessMemberRepo *adminrepo.BusinessMemberRepository,
) *AdminBusinessService {
	return &AdminBusinessService{
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
		user, _ := s.userRepo.FindByGoogleID(req.UserID)
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

	// Update request status to approved
	err = s.requestRepo.UpdateStatus(id, "approved")
	if err != nil {
		return err
	}

	// Verify user exists before creating business member
	_, err = s.userRepo.FindByGoogleID(request.UserID)
	if err != nil {
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
	}

	return s.businessMemberRepo.Create(businessMember)
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
