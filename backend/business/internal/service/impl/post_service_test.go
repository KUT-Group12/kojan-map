package impl

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository/mock"
)

func TestPostServiceImpl_List(t *testing.T) {
	type args struct {
		businessID int64
	}

	tests := []struct {
		name    string
		args    args
		wantErr bool
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
			postRepo := mock.NewMockPostRepo()

			svc := &PostServiceImpl{
				postRepo: postRepo,
			}

			result, err := svc.List(context.Background(), tt.args.businessID)

			if tt.wantErr {
				assert.Error(t, err, "List should return error")
			} else {
				require.NoError(t, err, "List should not return error")
				assert.NotNil(t, result, "result should not be nil")
			}
		})
	}
}

func TestPostServiceImpl_Get(t *testing.T) {
	type args struct {
		postID int64
	}

	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "valid_post_get",
			args: args{
				postID: 1,
			},
			wantErr: false,
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
			postRepo := mock.NewMockPostRepo()

			svc := &PostServiceImpl{
				postRepo: postRepo,
			}

			result, err := svc.Get(context.Background(), tt.args.postID)

			if tt.wantErr {
				assert.Error(t, err, "Get should return error")
			} else {
				require.NoError(t, err, "Get should not return error")
				// Note: IncrementViewCount error is silently ignored in service
				assert.NotNil(t, result, "result should not be nil")
			}
		})
	}
}

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
			postRepo := mock.NewMockPostRepo()

			svc := &PostServiceImpl{
				postRepo: postRepo,
			}

			postID, err := svc.Create(context.Background(), tt.args.businessID, tt.args.placeID, tt.args.genreIDs, tt.args.payload)

			if tt.wantErr {
				assert.Error(t, err, "Create should return error")
			} else {
				require.NoError(t, err, "Create should not return error")
				assert.Greater(t, postID, int64(0), "postID should be greater than 0")
			}
		})
	}
}

func TestPostServiceImpl_SetGenres(t *testing.T) {
	type args struct {
		postID   int64
		genreIDs []int64
	}

	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "valid_genres",
			args: args{
				postID:   1,
				genreIDs: []int64{1, 2, 3},
			},
			wantErr: false,
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
			postRepo := mock.NewMockPostRepo()

			svc := &PostServiceImpl{
				postRepo: postRepo,
			}

			err := svc.SetGenres(context.Background(), tt.args.postID, tt.args.genreIDs)

			if tt.wantErr {
				assert.Error(t, err, "SetGenres should return error")
			} else {
				require.NoError(t, err, "SetGenres should not return error")
			}
		})
	}
}

func TestPostServiceImpl_Anonymize(t *testing.T) {
	type args struct {
		postID int64
	}

	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "valid_anonymize",
			args: args{
				postID: 1,
			},
			wantErr: false,
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
			postRepo := mock.NewMockPostRepo()

			svc := &PostServiceImpl{
				postRepo: postRepo,
			}

			err := svc.Anonymize(context.Background(), tt.args.postID)

			if tt.wantErr {
				assert.Error(t, err, "Anonymize should return error")
			} else {
				require.NoError(t, err, "Anonymize should not return error")
			}
		})
	}
}

func TestPostServiceImpl_History(t *testing.T) {
	type args struct {
		googleID string
	}

	tests := []struct {
		name    string
		args    args
		wantErr bool
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
			postRepo := mock.NewMockPostRepo()

			svc := &PostServiceImpl{
				postRepo: postRepo,
			}

			result, err := svc.History(context.Background(), tt.args.googleID)

			if tt.wantErr {
				assert.Error(t, err, "History should return error")
			} else {
				require.NoError(t, err, "History should not return error")
				assert.NotNil(t, result, "result should not be nil")
			}
		})
	}
}
