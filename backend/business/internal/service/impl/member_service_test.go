package impl

import (
	"context"
	"kojan-map/business/pkg/contextkeys"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestMemberServiceImpl_GetBusinessDetails tests retrieving business details by Google ID.
// Test cases cover both successful retrieval and error conditions.
func TestMemberServiceImpl_GetBusinessDetails(t *testing.T) {
	type args struct {
		googleID string
	}

	tests := []struct {
		name          string
		args          args
		wantErr       bool
		setupFixture  func(f *TestFixtures)
		checkResponse func(t *testing.T, result interface{})
	}{
		{
			name: "existing_member",
			args: args{
				googleID: "user-123",
			},
			wantErr: false,
			setupFixture: func(f *TestFixtures) {
				// Setup user and business member for successful retrieval
				f.SetupUser("user-123", "test@example.com")
				f.SetupBusinessMember(1, "user-123", "Test Business", nil)
			},
			checkResponse: func(t *testing.T, result interface{}) {
				assert.NotNil(t, result, "result should not be nil")
			},
		},
		{
			name: "empty_google_id",
			args: args{
				googleID: "",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Initialize fixtures with all required mocks
			fixtures := NewTestFixtures()

			// Apply custom setup if provided
			if tt.setupFixture != nil {
				tt.setupFixture(fixtures)
			}

			// Create service with mocks from fixtures
			svc := &MemberServiceImpl{
				memberRepo: fixtures.MemberRepo,
				authRepo:   fixtures.AuthRepo,
			}

			// Execute and verify
			result, err := svc.GetBusinessDetails(context.Background(), tt.args.googleID)

			if tt.wantErr {
				assert.Error(t, err, "GetBusinessDetails should return error for invalid input")
			} else {
				require.NoError(t, err, "GetBusinessDetails should not return error for valid input")
				if tt.checkResponse != nil {
					tt.checkResponse(t, result)
				}
			}
		})
	}
}

// TestMemberServiceImpl_UpdateBusinessName tests updating a business member's name.
// Test cases cover valid updates, invalid business IDs, and empty names.
func TestMemberServiceImpl_UpdateBusinessName(t *testing.T) {
	type args struct {
		businessID int
		name       string
	}

	tests := []struct {
		name         string
		args         args
		wantErr      bool
		setupFixture func(f *TestFixtures)
		setupContext func() context.Context
	}{
		{
			name: "valid_name_update",
			args: args{
				businessID: 1,
				name:       "New Business Name",
			},
			wantErr: false,
			setupFixture: func(f *TestFixtures) {
				// Setup existing member for update
				f.SetupBusinessMember(1, "user-123", "Old Business Name", nil)
			},
			setupContext: func() context.Context {
				ctx := context.Background()
				return contextkeys.WithBusinessID(ctx, 1)
			},
		},
		{
			name: "invalid_business_id",
			args: args{
				businessID: -1,
				name:       "New Name",
			},
			// businessIDの所有権チェックが実装済み、contextに認証情報が必要
			wantErr: true,
			setupFixture: func(f *TestFixtures) {
				f.SetupBusinessMember(1, "user-123", "Old Business Name", nil)
			},
			setupContext: func() context.Context {
				ctx := context.Background()
				return contextkeys.WithBusinessID(ctx, 1)
			},
		},
		{
			name: "empty_name",
			args: args{
				businessID: 1,
				name:       "",
			},
			wantErr: true,
			setupContext: func() context.Context {
				ctx := context.Background()
				return contextkeys.WithBusinessID(ctx, 1)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Initialize fixtures
			fixtures := NewTestFixtures()

			// Apply custom setup if provided
			if tt.setupFixture != nil {
				tt.setupFixture(fixtures)
			}

			// Create service
			svc := &MemberServiceImpl{
				memberRepo: fixtures.MemberRepo,
				authRepo:   fixtures.AuthRepo,
			}

			// Setup context
			ctx := context.Background()
			if tt.setupContext != nil {
				ctx = tt.setupContext()
			}

			// Execute and verify
			err := svc.UpdateBusinessName(ctx, tt.args.businessID, tt.args.name)

			if tt.wantErr {
				assert.Error(t, err, "UpdateBusinessName should return error for invalid input")
			} else {
				require.NoError(t, err, "UpdateBusinessName should not return error for valid input")
			}
		})
	}
}

// TestMemberServiceImpl_UpdateBusinessIcon tests updating a business member's profile icon.
// Test cases cover valid PNG/JPEG images, invalid business IDs, and empty images.
func TestMemberServiceImpl_UpdateBusinessIcon(t *testing.T) {
	type args struct {
		businessID int
		icon       []byte
	}

	tests := []struct {
		name         string
		args         args
		wantErr      bool
		setupFixture func(f *TestFixtures)
		setupContext func() context.Context
	}{
		{
			name: "valid_icon_update",
			args: args{
				businessID: 1,
				icon:       []byte{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}, // Valid PNG header
			},
			wantErr: false,
			setupFixture: func(f *TestFixtures) {
				// Setup existing member for icon update
				f.SetupBusinessMember(1, "user-123", "Test Business", nil)
			},
			setupContext: func() context.Context {
				ctx := context.Background()
				return contextkeys.WithBusinessID(ctx, 1)
			},
		},
		{
			name: "invalid_business_id",
			args: args{
				businessID: -1,
				icon:       []byte{0x89, 0x50, 0x4E, 0x47},
			},
			// businessIDの所有権チェックが実装済み、contextに認証情報が必要
			wantErr: true,
			setupFixture: func(f *TestFixtures) {
				f.SetupBusinessMember(1, "user-123", "Test Business", nil)
			},
			setupContext: func() context.Context {
				ctx := context.Background()
				return contextkeys.WithBusinessID(ctx, 1)
			},
		},
		{
			name: "empty_icon",
			args: args{
				businessID: 1,
				icon:       []byte{},
			},
			wantErr: true,
			setupContext: func() context.Context {
				ctx := context.Background()
				return contextkeys.WithBusinessID(ctx, 1)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Initialize fixtures
			fixtures := NewTestFixtures()

			// Apply custom setup if provided
			if tt.setupFixture != nil {
				tt.setupFixture(fixtures)
			}

			// Create service
			svc := &MemberServiceImpl{
				memberRepo: fixtures.MemberRepo,
				authRepo:   fixtures.AuthRepo,
			}

			// Setup context
			ctx := context.Background()
			if tt.setupContext != nil {
				ctx = tt.setupContext()
			}

			// Execute and verify
			err := svc.UpdateBusinessIcon(ctx, tt.args.businessID, tt.args.icon)

			if tt.wantErr {
				assert.Error(t, err, "UpdateBusinessIcon should return error for invalid input")
			} else {
				require.NoError(t, err, "UpdateBusinessIcon should not return error for valid input")
			}
		})
	}
}

// TestMemberServiceImpl_AnonymizeMember tests anonymizing a business member's information.
// Test cases cover successful anonymization and invalid business IDs.
func TestMemberServiceImpl_AnonymizeMember(t *testing.T) {
	type args struct {
		businessID int
	}

	tests := []struct {
		name         string
		args         args
		wantErr      bool
		setupFixture func(f *TestFixtures)
		setupContext func() context.Context
	}{
		{
			name: "valid_anonymize",
			args: args{
				businessID: 1,
			},
			wantErr: false,
			setupFixture: func(f *TestFixtures) {
				// Setup existing member for anonymization
				f.SetupBusinessMember(1, "user-123", "Test Business", nil)
			},
			setupContext: func() context.Context {
				ctx := context.Background()
				return contextkeys.WithBusinessID(ctx, 1)
			},
		},
		{
			name: "invalid_business_id",
			args: args{
				businessID: -1,
			},
			// businessIDの権限チェックが実装済み、contextに認証情報が必要
			wantErr: true,
			setupFixture: func(f *TestFixtures) {
				f.SetupBusinessMember(1, "user-123", "Test Business", nil)
			},
			setupContext: func() context.Context {
				ctx := context.Background()
				return contextkeys.WithBusinessID(ctx, 1)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Initialize fixtures
			fixtures := NewTestFixtures()

			// Apply custom setup if provided
			if tt.setupFixture != nil {
				tt.setupFixture(fixtures)
			}

			// Create service
			svc := &MemberServiceImpl{
				memberRepo: fixtures.MemberRepo,
				authRepo:   fixtures.AuthRepo,
			}

			// Setup context
			ctx := context.Background()
			if tt.setupContext != nil {
				ctx = tt.setupContext()
			}

			// Execute and verify
			err := svc.AnonymizeMember(ctx, tt.args.businessID)

			if tt.wantErr {
				assert.Error(t, err, "AnonymizeMember should return error for invalid input")
			} else {
				require.NoError(t, err, "AnonymizeMember should not return error for valid input")
			}
		})
	}
}
