package impl

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"kojan-map/business/internal/domain"
)

// TestPostServiceImpl_List tests retrieving posts by business ID.
// Test cases cover valid business IDs and error conditions like negative or zero IDs.
func TestPostServiceImpl_List(t *testing.T) {
	type args struct {
		businessID int64
	}

	tests := []struct {
		name         string
		args         args
		wantErr      bool
		setupFixture func(f *TestFixtures)
	}{
		{
			name: "valid_list",
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
		{
			name: "zero_business_id",
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

			// Apply custom setup if provided
			if tt.setupFixture != nil {
				tt.setupFixture(fixtures)
			}

			// Create service
			svc := &PostServiceImpl{
				postRepo: fixtures.PostRepo,
			}

			// Execute and verify
			result, err := svc.List(context.Background(), tt.args.businessID)

			if tt.wantErr {
				assert.Error(t, err, "List should return error for invalid input")
			} else {
				require.NoError(t, err, "List should not return error for valid input")
				// List returns an empty slice when no posts exist, which is valid
				assert.NotNil(t, result, "result should not be nil (even if empty)")
			}
		})
	}
}

// TestPostServiceImpl_Get tests retrieving a post by ID with view count increment.
// Test cases cover valid post IDs and error conditions.
func TestPostServiceImpl_Get(t *testing.T) {
	type args struct {
		postID int64
	}

	tests := []struct {
		name         string
		args         args
		wantErr      bool
		setupFixture func(f *TestFixtures)
	}{
		{
			name: "valid_post_get",
			args: args{
				postID: 1,
			},
			wantErr: false,
			setupFixture: func(f *TestFixtures) {
				// Setup existing post for retrieval
				f.SetupPost(1, "author-1", "Test Post", "Test Content", 0)
			},
		},
		{
			name: "invalid_post_id",
			args: args{
				postID: -1,
			},
			wantErr: true,
		},
		{
			name: "zero_post_id",
			args: args{
				postID: 0,
			},
			wantErr: true,
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
			svc := &PostServiceImpl{
				postRepo: fixtures.PostRepo,
			}

			// Execute and verify
			result, err := svc.Get(context.Background(), tt.args.postID)

			if tt.wantErr {
				assert.Error(t, err, "Get should return error for invalid input")
			} else {
				require.NoError(t, err, "Get should not return error for valid input")
				// Note: IncrementViewCount error is silently ignored in service
				assert.NotNil(t, result, "result should not be nil")
			}
		})
	}
}

// TestPostServiceImpl_Create tests creating a new post with genre associations.
// Test cases cover successful creation and error conditions.
func TestPostServiceImpl_Create(t *testing.T) {
	type args struct {
		businessID int64
		placeID    int64
		genreIDs   []int64
		payload    interface{}
	}

	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "valid_post_create",
			args: args{
				businessID: 1,
				placeID:    10,
				genreIDs:   []int64{1, 2},
				payload: &domain.CreatePostRequest{
					LocationID:  "loc-123",
					GenreID:     "genre-1",
					Title:       "Test Post",
					Description: "Test Description",
					Images:      []string{"img1.png"},
				},
			},
			wantErr: false,
		},
		{
			name: "invalid_business_id",
			args: args{
				businessID: -1,
				placeID:    10,
				genreIDs:   []int64{1},
				payload: &domain.CreatePostRequest{
					LocationID:  "loc-123",
					GenreID:     "genre-1",
					Title:       "Test Post",
					Description: "Test Description",
				},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Initialize fixtures
			fixtures := NewTestFixtures()

			// Create service
			svc := &PostServiceImpl{
				postRepo: fixtures.PostRepo,
			}

			// Execute and verify
			postID, err := svc.Create(context.Background(), tt.args.businessID, tt.args.placeID, tt.args.genreIDs, tt.args.payload)

			if tt.wantErr {
				assert.Error(t, err, "Create should return error for invalid input")
			} else {
				require.NoError(t, err, "Create should not return error for valid input")
				assert.Greater(t, postID, int64(0), "postID should be greater than 0")
			}
		})
	}
}

// TestPostServiceImpl_SetGenres tests associating genres with a post.
// Test cases cover valid genre lists and error conditions.
func TestPostServiceImpl_SetGenres(t *testing.T) {
	type args struct {
		postID   int64
		genreIDs []int64
	}

	tests := []struct {
		name         string
		args         args
		wantErr      bool
		setupFixture func(f *TestFixtures)
	}{
		{
			name: "valid_genres",
			args: args{
				postID:   1,
				genreIDs: []int64{1, 2, 3},
			},
			wantErr: false,
			setupFixture: func(f *TestFixtures) {
				// Setup existing post for genre association
				f.SetupPost(1, "author-1", "Test Post", "Test Content", 0)
			},
		},
		{
			name: "invalid_post_id",
			args: args{
				postID:   -1,
				genreIDs: []int64{1},
			},
			wantErr: true,
		},
		{
			name: "empty_genres",
			args: args{
				postID:   1,
				genreIDs: []int64{},
			},
			wantErr: true,
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
			svc := &PostServiceImpl{
				postRepo: fixtures.PostRepo,
			}

			// Execute and verify
			err := svc.SetGenres(context.Background(), tt.args.postID, tt.args.genreIDs)

			if tt.wantErr {
				assert.Error(t, err, "SetGenres should return error for invalid input")
			} else {
				require.NoError(t, err, "SetGenres should not return error for valid input")
			}
		})
	}
}

// TestPostServiceImpl_Anonymize tests anonymizing a post by ID.
// Test cases cover successful anonymization and error conditions.
func TestPostServiceImpl_Anonymize(t *testing.T) {
	type args struct {
		postID int64
	}

	tests := []struct {
		name         string
		args         args
		wantErr      bool
		setupFixture func(f *TestFixtures)
	}{
		{
			name: "valid_anonymize",
			args: args{
				postID: 1,
			},
			wantErr: false,
			setupFixture: func(f *TestFixtures) {
				// Setup existing post for anonymization
				f.SetupPost(1, "author-1", "Original Title", "Original Content", 10)
			},
		},
		{
			name: "invalid_post_id",
			args: args{
				postID: -1,
			},
			wantErr: true,
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
			svc := &PostServiceImpl{
				postRepo: fixtures.PostRepo,
			}

			// Execute and verify
			err := svc.Anonymize(context.Background(), tt.args.postID)

			if tt.wantErr {
				assert.Error(t, err, "Anonymize should return error for invalid input")
			} else {
				require.NoError(t, err, "Anonymize should not return error for valid input")
			}
		})
	}
}

// TestPostServiceImpl_History tests retrieving post history for a user by Google ID.
// Test cases cover valid user IDs and error conditions.
func TestPostServiceImpl_History(t *testing.T) {
	type args struct {
		googleID string
	}

	tests := []struct {
		name         string
		args         args
		wantErr      bool
		setupFixture func(f *TestFixtures)
	}{
		{
			name: "valid_history",
			args: args{
				googleID: "user-123",
			},
			wantErr: false,
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
			// Initialize fixtures
			fixtures := NewTestFixtures()

			// Apply custom setup if provided
			if tt.setupFixture != nil {
				tt.setupFixture(fixtures)
			}

			// Create service
			svc := &PostServiceImpl{
				postRepo: fixtures.PostRepo,
			}

			// Execute and verify
			result, err := svc.History(context.Background(), tt.args.googleID)

			if tt.wantErr {
				assert.Error(t, err, "History should return error for invalid input")
			} else {
				require.NoError(t, err, "History should not return error for valid input")
				assert.NotNil(t, result, "result should not be nil")
			}
		})
	}
}

