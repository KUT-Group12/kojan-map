package impl

import (
	"context"
	"fmt"
	"os"

	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/errors"
	"kojan-map/business/pkg/jwt"
	"kojan-map/business/pkg/mfa"
	"kojan-map/business/pkg/oauth"
)

// AuthServiceImpl implements the AuthService interface.
type AuthServiceImpl struct {
	authRepo      repository.AuthRepo
	tokenVerifier oauth.TokenVerifier
	tokenManager  *jwt.TokenManager
	mfaValidator  *mfa.MFAValidator
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
		tokenManager:  jwt.NewTokenManager(),
		mfaValidator:  mfa.NewMFAValidator(),
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

	// Verify MFA completion - generate MFA code
	mfaCode, err := s.mfaValidator.GenerateCode(req.Gmail)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to generate MFA code: %v", err))
	}

	// TODO: Send MFA code via SMS/Email in production
	// For development, code is returned in response

	// Get or create user
	user, err := s.authRepo.GetOrCreateUser(ctx, req.GoogleID, req.Gmail, "business")
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to get or create user: %v", err))
	}

	// Return MFA challenge - user needs to verify code in next step
	return &domain.GoogleAuthResponse{
		SessionID: mfaCode, // Temporarily store MFA code as session (DEV ONLY)
		UserID:    user.(*domain.User).ID,
		Role:      user.(*domain.User).Role,
	}, nil
}

// BusinessLogin handles business member login (M1-1).
// SSOT Rule: MFA必須、JWT トークン生成
func (s *AuthServiceImpl) BusinessLogin(ctx context.Context, gmail, mfaCode string) (interface{}, error) {
	if gmail == "" || mfaCode == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "gmail and mfaCode are required")
	}

	// Verify MFA code
	valid, err := s.mfaValidator.VerifyCode(gmail, mfaCode)
	if err != nil || !valid {
		return nil, errors.NewAPIError(errors.ErrMissingMFA, fmt.Sprintf("MFA verification failed: %v", err))
	}

	// TODO: Fetch user by gmail and verify role is 'business'
	// For now, query from database
	user, err := s.authRepo.GetUserByID(ctx, gmail)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, "user not found")
	}

	userData := user.(*domain.User)
	if userData.Role != "business" {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, "user is not a business member")
	}

	// Generate JWT token
	token, err := s.tokenManager.GenerateToken(userData.ID, userData.Gmail, userData.Role)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to generate JWT token: %v", err))
	}

	response := &domain.BusinessLoginResponse{
		Token: token,
	}
	response.Business.ID = 0 // TODO: Get actual business ID from business member table
	response.Business.Role = userData.Role

	return response, nil
}

// RefreshToken handles token refresh (new endpoint).
func (s *AuthServiceImpl) RefreshToken(ctx context.Context, refreshTokenString string) (interface{}, error) {
	if refreshTokenString == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "refreshToken is required")
	}

	// Verify refresh token
	claims, err := s.tokenManager.VerifyTokenWithType(refreshTokenString, "refresh")
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, fmt.Sprintf("invalid refresh token: %v", err))
	}

	// Verify user still exists and has correct role
	user, err := s.authRepo.GetUserByID(ctx, claims.UserID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, "user not found")
	}

	userData := user.(*domain.User)
	if userData.Role != "business" {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, "user is not a business member")
	}

	// Generate new access token (keep same refresh token)
	newAccessToken, err := s.tokenManager.GenerateToken(userData.ID, userData.Gmail, userData.Role)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to generate new access token: %v", err))
	}

	return &domain.RefreshTokenResponse{
		AccessToken: newAccessToken,
	}, nil
}

// RefreshToken handles token refresh (new endpoint).
func (s *AuthServiceImpl) RefreshToken(ctx context.Context, refreshTokenString string) (interface{}, error) {
	if refreshTokenString == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "refreshToken is required")
	}

	// Verify refresh token
	claims, err := s.tokenManager.VerifyTokenWithType(refreshTokenString, "refresh")
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, fmt.Sprintf("invalid refresh token: %v", err))
	}

	// Verify user still exists and has correct role
	user, err := s.authRepo.GetUserByID(ctx, claims.UserID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, "user not found")
	}

	userData := user.(*domain.User)
	if userData.Role != "business" {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, "user is not a business member")
	}

	// Generate new access token (keep same refresh token)
	newAccessToken, err := s.tokenManager.GenerateToken(userData.ID, userData.Gmail, userData.Role)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to generate new access token: %v", err))
	}

	return &domain.RefreshTokenResponse{
		AccessToken: newAccessToken,
	}, nil
}

// Logout handles logout (M1-3-3).
// Expects session parameter to be a JWT token string.
func (s *AuthServiceImpl) Logout(ctx context.Context, session interface{}) error {
	tokenString, ok := session.(string)
	if !ok {
		return errors.NewAPIError(errors.ErrUnauthorized, "invalid session format")
	}

	if tokenString == "" {
		return errors.NewAPIError(errors.ErrUnauthorized, "token is required")
	}

	// Revoke the token (add to blacklist)
	if err := s.tokenManager.RevokeToken(tokenString); err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to revoke token: %v", err))
	}

	// Cleanup expired MFA codes periodically
	s.mfaValidator.CleanupExpiredCodes()

	return nil
}
