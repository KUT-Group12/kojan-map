package impl

import (
	"context"
	"fmt"

	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/errors"
)

// PostServiceImpl implements the PostService interface.
type PostServiceImpl struct {
	postRepo repository.PostRepo
}

// NewPostServiceImpl creates a new post service.
func NewPostServiceImpl(postRepo repository.PostRepo) *PostServiceImpl {
	return &PostServiceImpl{
		postRepo: postRepo,
	}
}

// List retrieves all posts for a business (M1-6-1).
func (s *PostServiceImpl) List(ctx context.Context, businessID int64) (interface{}, error) {
	if businessID <= 0 {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "businessId must be greater than 0")
	}

	posts, err := s.postRepo.ListByBusiness(ctx, businessID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to list posts: %v", err))
	}

	return posts, nil
}

// Get retrieves a post by ID (M1-7-2).
func (s *PostServiceImpl) Get(ctx context.Context, postID int64) (interface{}, error) {
	if postID <= 0 {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "postId must be greater than 0")
	}

	// Increment view count before returning the post
	// If increment fails, still return the post content
	if err := s.postRepo.IncrementViewCount(ctx, postID); err != nil {
		// Do not fail the entire request; continue to fetch the post
		// In production, consider logging this error
		_ = err
	}

	post, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, fmt.Sprintf("post not found: %v", err))
	}

	return post, nil
}

// Create creates a new post (M1-8-4).
// SSOT Rules: 画像は PNG または JPEG のみ、5MB以下
func (s *PostServiceImpl) Create(ctx context.Context, businessID int64, placeID int64, genreIDs []int64, payload interface{}) (int64, error) {
	if businessID <= 0 {
		return 0, errors.NewAPIError(errors.ErrInvalidInput, "businessId must be greater than 0")
	}

	req := payload.(*domain.CreatePostRequest)

	// TODO: Validate MIME type (PNG or JPEG only)
	// TODO: Validate image size (5MB limit) - done in handler

	postID, err := s.postRepo.Create(ctx, businessID, placeID, genreIDs, req)
	if err != nil {
		return 0, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to create post: %v", err))
	}

	return postID, nil
}

// SetGenres sets genres for a post (M1-8-4).
func (s *PostServiceImpl) SetGenres(ctx context.Context, postID int64, genreIDs []int64) error {
	if postID <= 0 {
		return errors.NewAPIError(errors.ErrInvalidInput, "postId must be greater than 0")
	}

	if len(genreIDs) == 0 {
		return errors.NewAPIError(errors.ErrInvalidInput, "at least one genre must be specified")
	}

	err := s.postRepo.SetGenres(ctx, postID, genreIDs)
	if err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to set genres: %v", err))
	}

	return nil
}

// Anonymize anonymizes a post (M1-13-2).
func (s *PostServiceImpl) Anonymize(ctx context.Context, postID int64) error {
	if postID <= 0 {
		return errors.NewAPIError(errors.ErrInvalidInput, "postId must be greater than 0")
	}

	// TODO: Check if user is authenticated and owns this post

	err := s.postRepo.Anonymize(ctx, postID)
	if err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to anonymize post: %v", err))
	}

	return nil
}

// History retrieves post history for a user (M1-14-2).
func (s *PostServiceImpl) History(ctx context.Context, googleID string) (interface{}, error) {
	if googleID == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "googleId is required")
	}

	history, err := s.postRepo.History(ctx, googleID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to get post history: %v", err))
	}

	return history, nil
}
