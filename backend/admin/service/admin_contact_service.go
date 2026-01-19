package service

import (
	"errors"

	adminrepo "kojan-map/admin/repository"
	"kojan-map/shared/models"
)

// AdminContactService handles admin contact/inquiry management business logic
type AdminContactService struct {
	askRepo *adminrepo.AskRepository
}

// NewAdminContactService creates a new AdminContactService
func NewAdminContactService(askRepo *adminrepo.AskRepository) *AdminContactService {
	return &AdminContactService{askRepo: askRepo}
}

// GetInquiries retrieves all contact inquiries
func (s *AdminContactService) GetInquiries() ([]models.Ask, error) {
	return s.askRepo.FindAll()
}

// ApproveInquiry marks an inquiry as handled
func (s *AdminContactService) ApproveInquiry(id int) error {
	// Verify the inquiry exists
	ask, err := s.askRepo.FindByID(id)
	if err != nil {
		return errors.New("inquiry not found")
	}

	if ask.AskFlag {
		return errors.New("inquiry is already handled")
	}

	return s.askRepo.MarkAsHandled(id)
}

// RejectInquiry marks an inquiry as rejected
func (s *AdminContactService) RejectInquiry(id int) error {
	// Verify the inquiry exists
	_, err := s.askRepo.FindByID(id)
	if err != nil {
		return errors.New("inquiry not found")
	}

	return s.askRepo.MarkAsRejected(id)
}
