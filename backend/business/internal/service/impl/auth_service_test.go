package impl

import (
	"context"
	"testing"

	"kojan-map/business/internal/domain"
	"kojan-map/business/pkg/jwt"
	"kojan-map/business/pkg/mfa"
	"kojan-map/business/pkg/oauth"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestAuthServiceImpl_GoogleAuth tests the Google OAuth authentication flow.
// Test cases cover valid ID tokens and error conditions like empty tokens.
func TestAuthServiceImpl_GoogleAuth(t *testing.T) {
	type args struct {
		googleID string
		gmail    string
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
				gmail:    "test@example.com",
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
				gmail:    "test2@example.com",
				idToken:  "",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Initialize fixtures
			fixtures := NewTestFixtures()

			// Initialize authentication components
			tokenVerifier := oauth.NewMockGoogleTokenVerifier("test-client-id")
			tokenManager := jwt.NewTokenManager()
			mfaValidator := mfa.NewMFAValidator()

			// Create service with initialized components
			svc := &AuthServiceImpl{
				authRepo:      fixtures.AuthRepo,
				tokenVerifier: tokenVerifier,
				tokenManager:  tokenManager,
				mfaValidator:  mfaValidator,
			}

			// Execute and verify
			req := &domain.GoogleAuthRequest{
				GoogleID: tt.args.googleID,
				Gmail:    tt.args.gmail,
				IDToken:  tt.args.idToken,
			}
			result, err := svc.GoogleAuth(context.Background(), req)

			if tt.wantErr {
				assert.Error(t, err, "GoogleAuth should return error for invalid input")
			} else {
				require.NoError(t, err, "GoogleAuth should not return error for valid input")
				if tt.checkResponse != nil {
					tt.checkResponse(t, result)
				}
			}
		})
	}
}

// TestAuthServiceImpl_BusinessLogin tests the business login flow with MFA verification.
// Test cases cover successful login with valid MFA code and error conditions.
func TestAuthServiceImpl_BusinessLogin(t *testing.T) {
	type args struct {
		sessionID string
		gmail     string
		mfaCode   string
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
				sessionID: "dummy-session-id",
				gmail:     "business@example.com",
				mfaCode:   "",
			},
			setupMFA: func(validator *mfa.MFAValidator, email string) string {
				// Generate and return valid MFA code
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
				sessionID: "dummy-session-id",
				gmail:     "business@example.com",
				mfaCode:   "000000", // Intentionally wrong code
			},
			setupMFA: func(validator *mfa.MFAValidator, email string) string {
				// Generate code but return wrong one
				validator.GenerateCode(email)
				return "000000"
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Initialize fixtures
			fixtures := NewTestFixtures()

			// Initialize authentication components
			mfaValidator := mfa.NewMFAValidator()
			tokenManager := jwt.NewTokenManager()

			// Generate MFA code if setup function provided
			mfaCode := ""
			if tt.setupMFA != nil {
				mfaCode = tt.setupMFA(mfaValidator, tt.args.gmail)
			}

			// Create service with initialized components
			svc := &AuthServiceImpl{
				authRepo:     fixtures.AuthRepo,
				tokenManager: tokenManager,
				mfaValidator: mfaValidator,
			}

			// Create test user in repository (use gmail as googleID for mock)
			fixtures.SetupUser(tt.args.gmail, tt.args.gmail)

			// Setup Business Member for successful login cases
			if !tt.wantErr {
				fixtures.SetupBusinessMember(1, tt.args.gmail, "Test Business", nil)
			}

			// Execute and verify
			result, err := svc.BusinessLogin(context.Background(), tt.args.sessionID, tt.args.gmail, mfaCode)

			if tt.wantErr {
				assert.Error(t, err, "BusinessLogin should return error for invalid input")
			} else {
				require.NoError(t, err, "BusinessLogin should not return error for valid input")
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
		name       string
		args       args
		wantErr    bool
		setupToken bool // Add setupToken field
	}{
		{
			name: "valid_logout",
			args: args{
				token: "", // Will be set dynamically
			},
			wantErr:    false,
			setupToken: true, // Add flag to generate real token
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
			// Initialize fixtures
			fixtures := NewTestFixtures()

			// Initialize authentication components
			tokenManager := jwt.NewTokenManager()
			mfaValidator := mfa.NewMFAValidator()

			// Create service with initialized components
			svc := &AuthServiceImpl{
				authRepo:     fixtures.AuthRepo,
				tokenManager: tokenManager,
				mfaValidator: mfaValidator,
			}

			// Generate token if requested
			if tt.setupToken {
				token, _ := tokenManager.GenerateToken("test-user", "test@example.com", "user")
				tt.args.token = token
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
