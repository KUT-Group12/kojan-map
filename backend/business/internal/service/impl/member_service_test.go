package impl

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository/mock"
)

func TestMemberServiceImpl_GetBusinessDetails(t *testing.T) {
	type args struct {
		googleID string
	}

	tests := []struct {
		name          string
		args          args
		wantErr       bool
		checkResponse func(t *testing.T, result interface{})
	}{
		{
			name: "existing_member",
			args: args{
				googleID: "user-123",
			},
			wantErr: false,
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
			memberRepo := mock.NewMockBusinessMemberRepo()
			authRepo := mock.NewMockAuthRepo()

			// Create test member in mock repo for "existing_member" case
			if tt.name == "existing_member" {
				memberRepo.Members[1] = &domain.BusinessMember{
					ID:           1,
					BusinessName: "Test Business",
					UserID:       tt.args.googleID,
				}
				authRepo.Users[tt.args.googleID] = &domain.User{
					ID:    tt.args.googleID,
					Gmail: "test@example.com",
					Role:  "business",
				}
			}

			svc := &MemberServiceImpl{
				memberRepo: memberRepo,
				authRepo:   authRepo,
			}

			result, err := svc.GetBusinessDetails(context.Background(), tt.args.googleID)

			if tt.wantErr {
				assert.Error(t, err, "GetBusinessDetails should return error")
			} else {
				require.NoError(t, err, "GetBusinessDetails should not return error")
				if tt.checkResponse != nil {
					tt.checkResponse(t, result)
				}
			}
		})
	}
}

func TestMemberServiceImpl_UpdateBusinessName(t *testing.T) {
	type args struct {
		businessID int64
		name       string
	}

	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "valid_name_update",
			args: args{
				businessID: 1,
				name:       "New Business Name",
			},
			wantErr: false,
		},
		{
			name: "invalid_business_id",
			args: args{
				businessID: -1,
				name:       "New Name",
			},
			wantErr: true,
		},
		{
			name: "empty_name",
			args: args{
				businessID: 1,
				name:       "",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			memberRepo := mock.NewMockBusinessMemberRepo()

			svc := &MemberServiceImpl{
				memberRepo: memberRepo,
			}

			err := svc.UpdateBusinessName(context.Background(), tt.args.businessID, tt.args.name)

			if tt.wantErr {
				assert.Error(t, err, "UpdateBusinessName should return error")
			} else {
				require.NoError(t, err, "UpdateBusinessName should not return error")
			}
		})
	}
}

func TestMemberServiceImpl_UpdateBusinessIcon(t *testing.T) {
	type args struct {
		businessID int64
		icon       []byte
	}

	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "valid_icon_update",
			args: args{
				businessID: 1,
				icon:       []byte{0x89, 0x50, 0x4E, 0x47}, // PNG magic number
			},
			wantErr: false,
		},
		{
			name: "invalid_business_id",
			args: args{
				businessID: -1,
				icon:       []byte{0x89, 0x50, 0x4E, 0x47},
			},
			wantErr: true,
		},
		{
			name: "empty_icon",
			args: args{
				businessID: 1,
				icon:       []byte{},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			memberRepo := mock.NewMockBusinessMemberRepo()

			svc := &MemberServiceImpl{
				memberRepo: memberRepo,
			}

			err := svc.UpdateBusinessIcon(context.Background(), tt.args.businessID, tt.args.icon)

			if tt.wantErr {
				assert.Error(t, err, "UpdateBusinessIcon should return error")
			} else {
				require.NoError(t, err, "UpdateBusinessIcon should not return error")
			}
		})
	}
}

func TestMemberServiceImpl_AnonymizeMember(t *testing.T) {
	type args struct {
		businessID int64
	}

	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "valid_anonymize",
			args: args{
				businessID: 1,
			},
			wantErr: false,
		},
		{
			name: "invalid_business_id",
			args: args{
				businessID: -1,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			memberRepo := mock.NewMockBusinessMemberRepo()

			svc := &MemberServiceImpl{
				memberRepo: memberRepo,
			}

			err := svc.AnonymizeMember(context.Background(), tt.args.businessID)

			if tt.wantErr {
				assert.Error(t, err, "AnonymizeMember should return error")
			} else {
				require.NoError(t, err, "AnonymizeMember should not return error")
			}
		})
	}
}
