package repository

import "context"

// AuthRepo は認証に関するデータアクセスメソッドを定義します。
type AuthRepo interface {
	GetOrCreateUser(ctx context.Context, googleID, gmail, role string) (interface{}, error)
	GetUserByID(ctx context.Context, googleID string) (interface{}, error)
	GetUserByGmail(ctx context.Context, gmail string) (interface{}, error)
	GetBusinessMemberByUserID(ctx context.Context, userID string) (interface{}, error)
}

// BusinessMemberRepo は事業者メンバーに関するデータアクセスメソッドを定義します。
type BusinessMemberRepo interface {
	GetByGoogleID(ctx context.Context, googleID string) (interface{}, error)
	UpdateName(ctx context.Context, businessID int, name string) error
	UpdateIcon(ctx context.Context, businessID int, icon []byte) error
	Anonymize(ctx context.Context, businessID int) error
}

// PostRepo は投稿に関するデータアクセスメソッドを定義します。
type PostRepo interface {
	ListByBusiness(ctx context.Context, businessID int) (interface{}, error)
	GetByID(ctx context.Context, postID int) (interface{}, error)
	Create(ctx context.Context, businessID int, placeID int, genreIDs []int, payload interface{}) (int, error)
	SetGenres(ctx context.Context, postID int, genreIDs []int) error
	// IncrementViewCount は投稿の閲覧数を1増やします
	IncrementViewCount(ctx context.Context, postID int) error
	Anonymize(ctx context.Context, postID int) error
	History(ctx context.Context, googleID string) (interface{}, error)
}

// BlockRepo はブロックに関するデータアクセスメソッドを定義します。
type BlockRepo interface {
	Create(ctx context.Context, blockerID, blockedID string) error
	Delete(ctx context.Context, blockerID, blockedID string) error
}

// ReportRepo は通報に関するデータアクセスメソッドを定義します。
type ReportRepo interface {
	Create(ctx context.Context, reporterID string, payload interface{}) error
}

// ContactRepo はお問い合わせに関するデータアクセスメソッドを定義します。
type ContactRepo interface {
	Create(ctx context.Context, googleID string, subject, message string) error
}

// StatsRepo はダッシュボード統計に関するデータアクセスメソッドを定義します。
type StatsRepo interface {
	TotalPosts(ctx context.Context, businessID int) (int, error)
	TotalReactions(ctx context.Context, businessID int) (int, error)
	TotalViews(ctx context.Context, businessID int) (int, error)
	EngagementStats(ctx context.Context, businessID int) (int, int, int, error)
}

// PaymentRepo は支払いに関するデータアクセスメソッドを定義します。
type PaymentRepo interface {
	CreatePayment(ctx context.Context, businessID int, amount int, payFlag bool) (int, error)
}

// ReactionRepo はリアクションに関するデータアクセスメソッドを定義します。
type ReactionRepo interface {
	CreateUnique(ctx context.Context, userID string, postID int) error // (userId, postId) の組み合わせが一意であることを保証する必要があります
	CountByPostIDs(ctx context.Context, postIDs []int) (map[int]int, error)
}

// PlaceRepo は場所に関するデータアクセスメソッドを定義します。
type PlaceRepo interface {
	GetByID(ctx context.Context, placeID int) (interface{}, error)
}

// GenreRepo はジャンルに関するデータアクセスメソッドを定義します。
type GenreRepo interface {
	GetByID(ctx context.Context, genreID int) (interface{}, error)
	ListByPostID(ctx context.Context, postID int) ([]int, error)
}
