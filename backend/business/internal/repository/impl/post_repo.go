package impl

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"
	"kojan-map/business/internal/domain"
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
func (r *PostRepoImpl) ListByBusiness(ctx context.Context, businessID string) (interface{}, error) {
	var posts []domain.Post
	if err := r.db.WithContext(ctx).
		Where("author_id = ? AND is_active = ?", businessID, true).
		Order("posted_at DESC").
		Find(&posts).Error; err != nil {
		return nil, fmt.Errorf("failed to list posts: %w", err)
	}
	return posts, nil
}

// GetByID は ID を使用して投稿を取得します（M1-7-2）。
func (r *PostRepoImpl) GetByID(ctx context.Context, postID string) (interface{}, error) {
	var post domain.Post
	if err := r.db.WithContext(ctx).Where("id = ?", postID).First(&post).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("post not found for id %d", postID)
		}
		return nil, err
	}
	return &post, nil
}

// IncrementViewCount は投稿の閲覧数を1増やします。
func (r *PostRepoImpl) IncrementViewCount(ctx context.Context, postID int64) error {
	result := r.db.WithContext(ctx).
		Model(&domain.Post{}).
		Where("id = ?", postID).
		UpdateColumn("view_count", gorm.Expr("view_count + 1"))

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
func (r *PostRepoImpl) Create(ctx context.Context, businessID int64, placeID int64, genreIDs []int64, payload interface{}) (int64, error) {
	req := payload.(*domain.CreatePostRequest)

	post := &domain.Post{
		AuthorID:      fmt.Sprintf("%d", businessID), // or use string businessID
		Title:         req.Title,
		Description:   req.Description,
		LocationID:    req.LocationID,
		ViewCount:     0,
		ReactionCount: 0,
		IsActive:      true,
		PostedAt:      time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := r.db.WithContext(ctx).Create(post).Error; err != nil {
		return 0, fmt.Errorf("failed to create post: %w", err)
	}

	// ジャンルを設定します（多対多）
	if len(genreIDs) > 0 {
		if err := r.SetGenres(ctx, post.ID, genreIDs); err != nil {
			return 0, err
		}
	}

	// Post.ID の型を int64 に統一した場合
	return post.ID, nil
}

// SetGenres は投稿に対してジャンルを設定します（多対多）（M1-8-4）。
func (r *PostRepoImpl) SetGenres(ctx context.Context, postID string, genreIDs []int64) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Delete existing genre associations
		if err := tx.Where("post_id = ?", postID).Delete(&domain.PostGenre{}).Error; err != nil {
			return fmt.Errorf("failed to delete existing genres: %w", err)
		}

		// Insert new genre associations
		for _, genreID := range genreIDs {
			postGenre := &domain.PostGenre{
				PostID:  postID,
				GenreID: genreID,
			}
			if err := tx.Create(postGenre).Error; err != nil {
				return fmt.Errorf("failed to create post_genre association: %w", err)
			}
		}
		return nil
	})
}

// Anonymize は投稿を匿名化します（M1-13-2）。
// 投稿内容は復元不能な値に置き換える、主キーおよび外部キーは変更しない
func (r *PostRepoImpl) Anonymize(ctx context.Context, postID int64) error {
	result := r.db.WithContext(ctx).Model(&domain.Post{}).
		Where("id = ?", postID).
		Updates(map[string]interface{}{
			"title":        "[Anonymized]",
			"description":  "[Anonymized]",
			"anonymizedAt": gorm.Expr("NOW()"),
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
		Where("author_id = ? AND is_active = ?", googleID, true).
		Order("posted_at DESC").
		Find(&posts).Error; err != nil {
		return nil, fmt.Errorf("failed to get post history: %w", err)
	}
	return posts, nil
}
