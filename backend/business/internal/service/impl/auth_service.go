package impl

import (
	"context"
	"fmt"
	"time"

	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/errors"
)

// AuthServiceImpl implements the AuthService interface.
type AuthServiceImpl struct {
	authRepo repository.AuthRepo
}

// NewAuthServiceImpl creates a new auth service.
func NewAuthServiceImpl(authRepo repository.AuthRepo) *AuthServiceImpl {
	return &AuthServiceImpl{
		authRepo: authRepo,
	}
}

// GoogleAuth handles Google authentication (M3-1).
// SSOT Rule: Google OAuth 2.0を使用、MFA認証完了を必須とする
func (s *AuthServiceImpl) GoogleAuth(ctx context.Context, payload interface{}) (interface{}, error) {
	req, ok := payload.(*domain.GoogleAuthRequest)
	if !ok {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "invalid request payload")
	}

	// TODO: Verify Google OAuth token from frontend
	// TODO: Verify MFA completion
	if req.GoogleID == "" || req.Gmail == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "googleId and gmail are required")
	}

	// Get or create user
	user, err := s.authRepo.GetOrCreateUser(ctx, req.GoogleID, req.Gmail, "business")
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to get or create user: %v", err))
	}

	// Generate session ID
	sessionID := fmt.Sprintf("session_%d_%s", time.Now().Unix(), req.GoogleID)

	return &domain.GoogleAuthResponse{
		SessionID: sessionID,
		UserID:    user.(*domain.User).ID,
		Role:      user.(*domain.User).Role,
	}, nil
}

// BusinessLogin handles business member login (M1-1).
// SSOT Rule: MFA必須、パスワード12文字以上必須
func (s *AuthServiceImpl) BusinessLogin(ctx context.Context, gmail, mfaCode string) (interface{}, error) {
	if gmail == "" || mfaCode == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "gmail and mfaCode are required")
	}

	// TODO: Verify MFA code
	// TODO: Fetch user by gmail and verify role is 'business'
	// TODO: Generate JWT token
	// For now, placeholder
	return &domain.BusinessLoginResponse{
		Token: "TODO_JWT_TOKEN",
	}, nil
}

// Logout handles logout (M1-3-3).
func (s *AuthServiceImpl) Logout(ctx context.Context, session interface{}) error {
	// TODO: Invalidate session/token
	// TODO: Clear session from cache/DB
	return nil
}
