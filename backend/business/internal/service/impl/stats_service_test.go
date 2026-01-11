package impl

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestStatsServiceImpl_GetTotalPosts tests retrieving the total number of posts for a business.
// Test cases cover valid business IDs and error conditions like negative IDs and zero posts.
func TestStatsServiceImpl_GetTotalPosts(t *testing.T) {
	type args struct {
		businessID int64
	}

	tests := []struct {
		name         string
		args         args
		mockValue    int64
		wantErr      bool
		checkResponse func(t *testing.T, result interface{})
	}{
		{
			name: "valid_total_posts",
			args: args{
				businessID: 1,
			},
			mockValue: 10,
			wantErr:   false,
			checkResponse: func(t *testing.T, result interface{}) {
				assert.NotNil(t, result, "result should not be nil")
			},
		},
		{
			name: "invalid_business_id",
			args: args{
				businessID: -1,
			},
			wantErr: true,
		},
		{
			name: "zero_posts",
			args: args{
				businessID: 2,
			},
			mockValue: 0,
			wantErr:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Initialize fixtures
			fixtures := NewTestFixtures()

			// Set mock stats value
			fixtures.SetupStatsValue(tt.mockValue, 0, 0)

			// Create service
			svc := &StatsServiceImpl{
				statsRepo: fixtures.StatsRepo,
			}

			// Execute and verify
			result, err := svc.GetTotalPosts(context.Background(), tt.args.businessID)

			if tt.wantErr {
				assert.Error(t, err, "GetTotalPosts should return error for invalid input")
			} else {
				require.NoError(t, err, "GetTotalPosts should not return error for valid input")
				if tt.checkResponse != nil {
					tt.checkResponse(t, result)
				}
			}
		})
	}
}

// TestStatsServiceImpl_GetTotalReactions tests retrieving the total number of reactions for a business.
// Test cases cover valid business IDs and error conditions.
func TestStatsServiceImpl_GetTotalReactions(t *testing.T) {
	type args struct {
		businessID int64
	}

	tests := []struct {
		name         string
		args         args
		mockValue    int64
		wantErr      bool
		checkResponse func(t *testing.T, result interface{})
	}{
		{
			name: "valid_total_reactions",
			args: args{
				businessID: 1,
			},
			mockValue: 50,
			wantErr:   false,
			checkResponse: func(t *testing.T, result interface{}) {
				assert.NotNil(t, result, "result should not be nil")
			},
		},
		{
			name: "invalid_business_id",
			args: args{
				businessID: 0,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Initialize fixtures
			fixtures := NewTestFixtures()

			// Set mock stats value
			fixtures.SetupStatsValue(0, tt.mockValue, 0)

			// Create service
			svc := &StatsServiceImpl{
				statsRepo: fixtures.StatsRepo,
			}

			// Execute and verify
			result, err := svc.GetTotalReactions(context.Background(), tt.args.businessID)

			if tt.wantErr {
				assert.Error(t, err, "GetTotalReactions should return error for invalid input")
			} else {
				require.NoError(t, err, "GetTotalReactions should not return error for valid input")
				if tt.checkResponse != nil {
					tt.checkResponse(t, result)
				}
			}
		})
	}
}

// TestStatsServiceImpl_GetTotalViews tests retrieving the total number of views for a business.
// Test cases cover valid business IDs and error conditions.
func TestStatsServiceImpl_GetTotalViews(t *testing.T) {
	type args struct {
		businessID int64
	}

	tests := []struct {
		name         string
		args         args
		mockValue    int64
		wantErr      bool
		checkResponse func(t *testing.T, result interface{})
	}{
		{
			name: "valid_total_views",
			args: args{
				businessID: 1,
			},
			mockValue: 500,
			wantErr:   false,
			checkResponse: func(t *testing.T, result interface{}) {
				assert.NotNil(t, result, "result should not be nil")
			},
		},
		{
			name: "invalid_business_id",
			args: args{
				businessID: -5,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Initialize fixtures
			fixtures := NewTestFixtures()

			// Set mock stats value
			fixtures.SetupStatsValue(0, 0, tt.mockValue)

			// Create service
			svc := &StatsServiceImpl{
				statsRepo: fixtures.StatsRepo,
			}

			// Execute and verify
			result, err := svc.GetTotalViews(context.Background(), tt.args.businessID)

			if tt.wantErr {
				assert.Error(t, err, "GetTotalViews should return error for invalid input")
			} else {
				require.NoError(t, err, "GetTotalViews should not return error for valid input")
				if tt.checkResponse != nil {
					tt.checkResponse(t, result)
				}
			}
		})
	}
}

// TestStatsServiceImpl_GetEngagementRate tests calculating the engagement rate for a business.
// Test cases cover valid business IDs, zero posts edge case, and error conditions.
func TestStatsServiceImpl_GetEngagementRate(t *testing.T) {
	type args struct {
		businessID int64
	}

	type mockStats struct {
		posts     int64
		reactions int64
		views     int64
	}

	tests := []struct {
		name         string
		args         args
		mockStats    mockStats
		wantErr      bool
		checkResponse func(t *testing.T, result interface{})
	}{
		{
			name: "valid_engagement_rate",
			args: args{
				businessID: 1,
			},
			mockStats: mockStats{
				posts:     10,
				reactions: 25,
				views:     100,
			},
			wantErr: false,
			checkResponse: func(t *testing.T, result interface{}) {
				assert.NotNil(t, result, "result should not be nil")
			},
		},
		{
			name: "zero_posts_engagement",
			args: args{
				businessID: 2,
			},
			mockStats: mockStats{
				posts:     0,
				reactions: 0,
				views:     0,
			},
			wantErr: false,
			checkResponse: func(t *testing.T, result interface{}) {
				assert.NotNil(t, result, "result should not be nil (handles zero division)")
			},
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
			// Initialize fixtures
			fixtures := NewTestFixtures()

			// Set mock stats values
			fixtures.SetupStatsValue(tt.mockStats.posts, tt.mockStats.reactions, tt.mockStats.views)

			// Create service
			svc := &StatsServiceImpl{
				statsRepo: fixtures.StatsRepo,
			}

			// Execute and verify
			result, err := svc.GetEngagementRate(context.Background(), tt.args.businessID)

			if tt.wantErr {
				assert.Error(t, err, "GetEngagementRate should return error for invalid input")
			} else {
				require.NoError(t, err, "GetEngagementRate should not return error for valid input")
				if tt.checkResponse != nil {
					tt.checkResponse(t, result)
				}
			}
		})
	}
}

