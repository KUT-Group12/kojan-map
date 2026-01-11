package impl

import (
	"context"
	"fmt"
	"time"

	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/errors"
)

// MemberServiceImpl implements the MemberService interface.
type MemberServiceImpl struct {
	memberRepo repository.BusinessMemberRepo
	authRepo   repository.AuthRepo
}

// NewMemberServiceImpl creates a new member service.
func NewMemberServiceImpl(memberRepo repository.BusinessMemberRepo, authRepo repository.AuthRepo) *MemberServiceImpl {
	return &MemberServiceImpl{
		memberRepo: memberRepo,
		authRepo:   authRepo,
	}
}

// GetBusinessDetails retrieves business member details (M3-2-2).
// SSOT Rules: 存在しないGoogle IDが指定された場合はエラーを返す
func (s *MemberServiceImpl) GetBusinessDetails(ctx context.Context, googleID string) (interface{}, error) {
	if googleID == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "googleId is required")
	}

	member, err := s.memberRepo.GetByGoogleID(ctx, googleID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, fmt.Sprintf("business member not found: %v", err))
	}

	// Get user info for email
	user, err := s.authRepo.GetUserByID(ctx, googleID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, "user not found")
	}

	memberData := member.(*domain.BusinessMember)
	userData := user.(*domain.User)

	return &domain.BusinessMemberResponse{
		ID:           memberData.ID,
		BusinessName: memberData.BusinessName,
		Gmail:        userData.Gmail,
		RegistDate:   memberData.RegistDate.Format(time.RFC3339),
		IconImageURL: "", // TODO: generate signed URL or base64 from BLOB if needed
	}, nil
}

// UpdateBusinessName updates the business name (M3-4-2).
// SSOT Rules: 事業者名の更新は永続ストレージに反映する、空文字や不正な形式のエラーとする
func (s *MemberServiceImpl) UpdateBusinessName(ctx context.Context, businessID int64, name string) error {
	if name == "" || len(name) > 50 {
		return errors.NewAPIError(errors.ErrValidationFailed, "business name must be between 1 and 50 characters")
	}

	// TODO: Check if user is authenticated and owns this business

	err := s.memberRepo.UpdateName(ctx, businessID, name)
	if err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to update business name: %v", err))
	}

	return nil
}

// UpdateBusinessIcon updates the business icon (M3-5-2).
// SSOT Rules: 画像は PNG または JPEG のみ、5MB以下、ログイン済みかつ本人のみ更新可能
func (s *MemberServiceImpl) UpdateBusinessIcon(ctx context.Context, businessID int64, icon []byte) error {
	if len(icon) == 0 {
		return errors.NewAPIError(errors.ErrInvalidInput, "icon data is required")
	}

	if len(icon) > 5*1024*1024 { // 5MB
		return errors.NewAPIError(errors.ErrImageTooLarge, "image size must not exceed 5MB")
	}

	// TODO: Validate MIME type (PNG or JPEG only)

	err := s.memberRepo.UpdateIcon(ctx, businessID, icon)
	if err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to update business icon: %v", err))
	}

	return nil
}

// AnonymizeMember anonymizes member info (M3-3).
// SSOT Rules: 識別可能な個人情報は復元不能な値に置き換える
func (s *MemberServiceImpl) AnonymizeMember(ctx context.Context, businessID int64) error {
	// TODO: Check if user is authenticated and is admin or own account

	err := s.memberRepo.Anonymize(ctx, businessID)
	if err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to anonymize member: %v", err))
	}

	return nil
}
