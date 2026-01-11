package impl

import (
	"context"
	"fmt"
	"os"
	"time"

	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/errors"
	"kojan-map/business/pkg/oauth"
)

// AuthServiceImpl implements the AuthService interface.
type AuthServiceImpl struct {
	authRepo      repository.AuthRepo
	tokenVerifier *oauth.GoogleTokenVerifier
}

// NewAuthServiceImpl creates a new auth service.
func NewAuthServiceImpl(authRepo repository.AuthRepo) *AuthServiceImpl {
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	if googleClientID == "" {
		googleClientID = "placeholder-client-id"
	}

	return &AuthServiceImpl{
		authRepo:      authRepo,
		tokenVerifier: oauth.NewGoogleTokenVerifier(googleClientID),
	}
}

// GoogleAuth handles Google authentication (M3-1).
// SSOT Rule: Google OAuth 2.0を使用、MFA認証完了を必須とする
func (s *AuthServiceImpl) GoogleAuth(ctx context.Context, payload interface{}) (interface{}, error) {
	req, ok := payload.(*domain.GoogleAuthRequest)
	if !ok {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "invalid request payload")
	}

	if req.GoogleID == "" || req.Gmail == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "googleId and gmail are required")
	}

	// Verify Google OAuth token from frontend
	if req.IDToken == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "idToken is required")
	}

	claims, err := s.tokenVerifier.VerifyToken(ctx, req.IDToken)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, fmt.Sprintf("invalid OAuth token: %v", err))
	}

	// Verify token claims match request
	if claims.Sub != req.GoogleID {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, "token subject does not match googleId")
	}

	if claims.Email != req.Gmail {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, "token email does not match gmail")
	}

	// TODO: Verify MFA completion
	// For now, assume MFA verified

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
