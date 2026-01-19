package impl

import (
	"context"
	"fmt"
	"strconv"

	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/contextkeys"
	"kojan-map/business/pkg/errors"
)

// PostServiceImpl はPostServiceインターフェースを実装します。
type PostServiceImpl struct {
	postRepo repository.PostRepo
}

// NewPostServiceImpl は新しい投稿サービスを作成します。
func NewPostServiceImpl(postRepo repository.PostRepo) *PostServiceImpl {
	return &PostServiceImpl{
		postRepo: postRepo,
	}
}

// List は事業者の全投稿を取得します（M1-6-1）。
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

// Get はIDで投稿を取得します（M1-7-2）。
func (s *PostServiceImpl) Get(ctx context.Context, postID int64) (interface{}, error) {
	if postID <= 0 {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "postId must be greater than 0")
	}

	// 投稿を返す前に閲覧数をインクリメント
	// インクリメントが失敗しても、投稿内容は返す
	if err := s.postRepo.IncrementViewCount(ctx, postID); err != nil {
		// リクエスト全体を失敗させない。投稿の取得を続行
		// 本番環境では、このエラーをログに記録することを検討
		_ = err
	}

	post, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, fmt.Sprintf("post not found: %v", err))
	}

	return post, nil
}

// Create は新しい投稿を作成します（M1-8-4）。
// 画像は PNG または JPEG のみ、5MB以下
func (s *PostServiceImpl) Create(ctx context.Context, businessID int64, placeID int64, genreIDs []int64, payload interface{}) (int64, error) {
	if businessID <= 0 {
		return 0, errors.NewAPIError(errors.ErrInvalidInput, "businessId must be greater than 0")
	}

	req, ok := payload.(*domain.CreatePostRequest)
	if !ok {
		return 0, errors.NewAPIError(errors.ErrInvalidInput, "invalid payload type")
	}

	// 画像URLの検証は省略（クライアントまたは画像アップロードエンドポイントで実施）
	// 本番環境では、画像は事前にS3などにアップロードされ、URLが渡される想定

	postID, err := s.postRepo.Create(ctx, businessID, placeID, genreIDs, req)
	if err != nil {
		return 0, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to create post: %v", err))
	}

	return postID, nil
}

// SetGenres は投稿のジャンルを設定します（M1-8-4）。
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

// Anonymize は投稿を匿名化します（M1-13-2）。
func (s *PostServiceImpl) Anonymize(ctx context.Context, postID int64) error {
	if postID <= 0 {
		return errors.NewAPIError(errors.ErrInvalidInput, "postId must be greater than 0")
	}

	// 投稿の所有者チェック
	businessID, ok := contextkeys.GetBusinessID(ctx)
	if !ok {
		return errors.NewAPIError(errors.ErrUnauthorized, "business ID not found in context")
	}

	post, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return errors.NewAPIError(errors.ErrNotFound, fmt.Sprintf("post not found: %v", err))
	}

	// 投稿の作成者とログインユーザーが一致するか確認
	authorID, _ := strconv.ParseInt(post.AuthorID, 10, 64)
	if authorID != businessID {
		return errors.NewAPIError(errors.ErrForbidden, "you are not authorized to anonymize this post")
	}

	err = s.postRepo.Anonymize(ctx, postID)
	if err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to anonymize post: %v", err))
	}

	return nil
}

// History はユーザーの投稿履歴を取得します（M1-14-2）。
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
