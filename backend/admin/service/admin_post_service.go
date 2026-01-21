package service

import (
	"errors"
	"fmt"

	"kojan-map/shared/models"

	"gorm.io/gorm"
)

// カスタムエラー定義
var (
	// ErrPostNotFound は投稿が見つからない場合に返されるエラー
	ErrPostNotFound = errors.New("post not found")
)

// PostDetailResponse represents detailed post information for admin.
type PostDetailResponse struct {
	PostID      int    `json:"postId"`
	PlaceID     int    `json:"placeId"`
	UserID      string `json:"userId"`
	PostDate    string `json:"postDate"`
	Title       string `json:"title"`
	Text        string `json:"text"`
	NumReaction int    `json:"numReaction"`
	NumView     int    `json:"numView"`
	GenreID     int    `json:"genreId"`
}

// AdminPostService handles admin post management business logic.
type AdminPostService struct {
	db *gorm.DB
}

// NewAdminPostService creates a new AdminPostService.
//
// Parameters:
//   - db: データベース接続インスタンス
//
// Returns:
//   - *AdminPostService: 新しいサービスインスタンス
func NewAdminPostService(db *gorm.DB) *AdminPostService {
	return &AdminPostService{db: db}
}

// GetPostByID retrieves a post by ID.
//
// Parameters:
//   - postID: 取得する投稿のID
//
// Returns:
//   - *PostDetailResponse: 投稿詳細情報
//   - error: ErrPostNotFound（投稿が存在しない場合）またはDBエラー
func (s *AdminPostService) GetPostByID(postID int) (*PostDetailResponse, error) {
	var post models.Post
	result := s.db.Where("postId = ?", postID).First(&post)
	if result.Error != nil {
		// レコードが見つからない場合と他のエラーを区別
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrPostNotFound
		}
		// DB接続エラー等はそのまま返す
		return nil, fmt.Errorf("failed to get post: %w", result.Error)
	}

	return &PostDetailResponse{
		PostID:      int(post.PostID),
		PlaceID:     int(post.PlaceID),
		UserID:      post.UserID,
		PostDate:    post.PostDate.Format("2006-01-02T15:04:05Z07:00"),
		Title:       post.Title,
		Text:        post.Text,
		NumReaction: int(post.NumReaction),
		NumView:     int(post.NumView),
		GenreID:     int(post.GenreID),
	}, nil
}

// DeletePost deletes a post by ID (hard delete) with transaction.
// 関連する通報も同時に削除されます。
//
// Parameters:
//   - postID: 削除する投稿のID
//
// Returns:
//   - error: ErrPostNotFound（投稿が存在しない場合）またはDBエラー
func (s *AdminPostService) DeletePost(postID int) error {
	// トランザクションを使用して原子性を保証
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Check if post exists
		var post models.Post
		result := tx.Where("postId = ?", postID).First(&post)
		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				return ErrPostNotFound
			}
			return fmt.Errorf("failed to find post: %w", result.Error)
		}

		// Delete associated reports first
		if err := tx.Where("postId = ?", postID).Delete(&models.Report{}).Error; err != nil {
			return fmt.Errorf("failed to delete reports: %w", err)
		}

		// Delete the post
		if err := tx.Where("postId = ?", postID).Delete(&models.Post{}).Error; err != nil {
			return fmt.Errorf("failed to delete post: %w", err)
		}

		return nil
	})
}
