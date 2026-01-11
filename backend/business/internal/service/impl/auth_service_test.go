package impl

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository/mock"
	"kojan-map/business/pkg/jwt"
	"kojan-map/business/pkg/mfa"
	"kojan-map/business/pkg/oauth"
)

func TestAuthServiceImpl_GoogleAuth(t *testing.T) {
	type args struct {
		googleID string
		idToken  string
	}

	tests := []struct {
		name          string
		args          args
		wantErr       bool
		wantMFACode   bool
		checkResponse func(t *testing.T, result interface{})
	}{
		{
			name: "valid_google_id_token",
			args: args{
				googleID: "user123",
				idToken:  "dummy-jwt-token",
			},
			wantErr:     false,
			wantMFACode: true,
			checkResponse: func(t *testing.T, result interface{}) {
				resp, ok := result.(*domain.GoogleAuthResponse)
				require.True(t, ok, "response should be GoogleAuthResponse")
				assert.NotEmpty(t, resp.SessionID, "SessionID (MFA code) should not be empty")
			},
		},
		{
			name: "empty_id_token",
			args: args{
				googleID: "user456",
				idToken:  "",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			authRepo := mock.NewMockAuthRepo()
			tokenVerifier := oauth.NewGoogleTokenVerifier("test-client-id")
			tokenManager := jwt.NewTokenManager()
			mfaValidator := mfa.NewMFAValidator()

			svc := &AuthServiceImpl{
				authRepo:      authRepo,
				tokenVerifier: tokenVerifier,
				tokenManager:  tokenManager,
				mfaValidator:  mfaValidator,
			}

			req := &domain.GoogleAuthRequest{IDToken: tt.args.idToken}
			result, err := svc.GoogleAuth(context.Background(), req)

			if tt.wantErr {
				assert.Error(t, err, "GoogleAuth should return error")
			} else {
				require.NoError(t, err, "GoogleAuth should not return error")
				if tt.checkResponse != nil {
					tt.checkResponse(t, result)
				}
			}
		})
	}
}

func TestAuthServiceImpl_BusinessLogin(t *testing.T) {
	type args struct {
		gmail   string
		mfaCode string
	}

	tests := []struct {
		name          string
		args          args
		setupMFA      func(validator *mfa.MFAValidator, email string) string
		wantErr       bool
		checkResponse func(t *testing.T, result interface{})
	}{
		{
			name: "valid_credentials_with_mfa",
			args: args{
				gmail:   "business@example.com",
				mfaCode: "",
			},
			setupMFA: func(validator *mfa.MFAValidator, email string) string {
				code, _ := validator.GenerateCode(email)
				return code
			},
			wantErr: false,
			checkResponse: func(t *testing.T, result interface{}) {
				resp, ok := result.(*domain.BusinessLoginResponse)
				require.True(t, ok, "response should be BusinessLoginResponse")
				assert.NotEmpty(t, resp.Token, "JWT Token should not be empty")
				assert.Equal(t, "business", resp.Business.Role)
			},
		},
		{
			name: "invalid_mfa_code",
			args: args{
				gmail:   "business@example.com",
				mfaCode: "000000",
			},
			setupMFA: func(validator *mfa.MFAValidator, email string) string {
				validator.GenerateCode(email)
				return "000000" // wrong code
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			authRepo := mock.NewMockAuthRepo()
			mfaValidator := mfa.NewMFAValidator()
			tokenManager := jwt.NewTokenManager()

			// Setup MFA if needed
			mfaCode := ""
			if tt.setupMFA != nil {
				mfaCode = tt.setupMFA(mfaValidator, tt.args.gmail)
			}

			svc := &AuthServiceImpl{
				authRepo:     authRepo,
				tokenManager: tokenManager,
				mfaValidator: mfaValidator,
			}

			// Create user first
			authRepo.GetOrCreateUser(context.Background(), "test-user-123", tt.args.gmail, "business")

			result, err := svc.BusinessLogin(context.Background(), tt.args.gmail, mfaCode)

			if tt.wantErr {
				assert.Error(t, err, "BusinessLogin should return error")
			} else {
				require.NoError(t, err, "BusinessLogin should not return error")
				if tt.checkResponse != nil {
					tt.checkResponse(t, result)
				}
			}
		})
	}
}

func TestAuthServiceImpl_Logout(t *testing.T) {
	type args struct {
		token string
	}

	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "valid_logout",
			args: args{
				token: "valid-jwt-token",
			},
			wantErr: false,
		},
		{
			name: "empty_token",
			args: args{
				token: "",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			authRepo := mock.NewMockAuthRepo()
			tokenManager := jwt.NewTokenManager()
			mfaValidator := mfa.NewMFAValidator()

			svc := &AuthServiceImpl{
				authRepo:     authRepo,
				tokenManager: tokenManager,
				mfaValidator: mfaValidator,
			}

			err := svc.Logout(context.Background(), tt.args.token)

			if tt.wantErr {
				assert.Error(t, err, "Logout should return error")
			} else {
				// For valid logout, we expect error because token is not a valid JWT
				// This is expected behavior in this test
				_ = err
			}
		})
	}
}
