package impl

import (
	"context"
	"errors"
	"fmt"
	"time"

	"kojan-map/business/internal/domain"

	"gorm.io/gorm"
)

// PostRepoImpl は GORM を使用して PostRepo インターフェースを実装します。
type PostRepoImpl struct {
	db *gorm.DB
}

// NewPostRepoImpl は新しい投稿リポジトリを作成します。
func NewPostRepoImpl(db *gorm.DB) *PostRepoImpl {
	return &PostRepoImpl{db: db}
}

// ListByBusiness は事業者のすべての投稿を取得します（M1-6-1）。
func (r *PostRepoImpl) ListByBusiness(ctx context.Context, businessID int) (interface{}, error) {
	var posts []domain.Post
	if err := r.db.WithContext(ctx).
		Where("userId = (SELECT userId FROM business WHERE businessId = ?)", businessID).
		Order("postDate DESC").
		Find(&posts).Error; err != nil {
		return nil, fmt.Errorf("failed to list posts: %w", err)
	}
	return posts, nil
}

// GetByID は ID を使用して投稿を取得します（M1-7-2）。
func (r *PostRepoImpl) GetByID(ctx context.Context, postID int) (interface{}, error) {
	var post domain.Post
	if err := r.db.WithContext(ctx).Where("postId = ?", postID).First(&post).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("post not found for id %d", postID)
		}
		return nil, err
	}
	return &post, nil
}

// IncrementViewCount は投稿の閲覧数を1増やします。
func (r *PostRepoImpl) IncrementViewCount(ctx context.Context, postID int) error {
	result := r.db.WithContext(ctx).
		Model(&domain.Post{}).
		Where("postId = ?", postID).
		UpdateColumn("numView", gorm.Expr("numView + 1"))

	if result.Error != nil {
		return fmt.Errorf("failed to increment view count for post %d: %w", postID, result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("post not found for id %d", postID)
	}

	return nil
}

// Create は新しい投稿を作成します（M1-8-4）。
// 投稿はビジネスメンバーのみ作成可能、画像は5MB以下、ジャンルは複数指定可能
func (r *PostRepoImpl) Create(ctx context.Context, businessID int, placeID int, genreIDs []int, payload interface{}) (int, error) {
	req, ok := payload.(*domain.CreatePostRequest)
	if !ok {
		return 0, fmt.Errorf("invalid payload type: expected *domain.CreatePostRequest")
	}

	// ビジネスメンバーのUserIDを取得
	var business domain.BusinessMember
	if err := r.db.WithContext(ctx).Where("businessId = ?", businessID).First(&business).Error; err != nil {
		return 0, fmt.Errorf("failed to find business member: %w", err)
	}

	genreID := int(0)
	if len(genreIDs) > 0 {
		genreID = int(genreIDs[0])
	}

	post := &domain.Post{
		UserID:      business.UserID,
		Title:       req.Title,
		Text:        req.Description,
		PlaceID:     int(placeID),
		NumView:     0,
		NumReaction: 0,
		PostDate:    time.Now(),
		GenreID:     genreID,
	}

	if err := r.db.WithContext(ctx).Create(post).Error; err != nil {
		return 0, fmt.Errorf("failed to create post: %w", err)
	}

	return post.ID, nil
}

// SetGenres は投稿に対してジャンルを設定します（M1-8-4）。
// 注意: このスキーマでは投稿に対して1つのジャンルのみ設定可能です。genreIDsの最初の要素を使用します。
func (r *PostRepoImpl) SetGenres(ctx context.Context, postID int, genreIDs []int) error {
	if len(genreIDs) == 0 {
		return nil
	}

	result := r.db.WithContext(ctx).Model(&domain.Post{}).
		Where("postId = ?", postID).
		Update("genreId", genreIDs[0])

	if result.Error != nil {
		return fmt.Errorf("failed to set genre for post %d: %w", postID, result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("post not found for id %d", postID)
	}

	return nil
}

// Anonymize は投稿を匿名化します（M1-13-2）。
// 投稿内容は復元不能な値に置き換える、主キーおよび外部キーは変更しない
func (r *PostRepoImpl) Anonymize(ctx context.Context, postID int) error {
	result := r.db.WithContext(ctx).Model(&domain.Post{}).
		Where("postId = ?", postID).
		Updates(map[string]interface{}{
			"title": "[Anonymized]",
			"text":  "[Anonymized]",
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("post not found for id %d", postID)
	}

	return nil
}

// History はユーザーの投稿履歴を取得します（M1-14-2）。
func (r *PostRepoImpl) History(ctx context.Context, googleID string) (interface{}, error) {
	var posts []domain.Post
	if err := r.db.WithContext(ctx).
		Where("userId = ?", googleID).
		Order("postDate DESC").
		Find(&posts).Error; err != nil {
		return nil, fmt.Errorf("failed to get post history: %w", err)
	}
	return posts, nil
}
