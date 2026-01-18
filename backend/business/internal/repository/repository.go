package repository

import "context"

// AuthRepo defines data access methods for authentication.
type AuthRepo interface {
	GetOrCreateUser(ctx context.Context, googleID, gmail, role string) (interface{}, error)
	GetUserByID(ctx context.Context, googleID string) (interface{}, error)
	GetUserByGmail(ctx context.Context, gmail string) (interface{}, error)
	GetBusinessMemberByUserID(ctx context.Context, userID string) (interface{}, error)
}

// BusinessMemberRepo defines data access methods for business members.
type BusinessMemberRepo interface {
	GetByGoogleID(ctx context.Context, googleID string) (interface{}, error)
	UpdateName(ctx context.Context, businessID int64, name string) error
	UpdateIcon(ctx context.Context, businessID int64, icon []byte) error
	Anonymize(ctx context.Context, businessID int64) error
}

// PostRepo defines data access methods for posts.
type PostRepo interface {
	ListByBusiness(ctx context.Context, businessID int64) (interface{}, error)
	GetByID(ctx context.Context, postID int64) (interface{}, error)
	Create(ctx context.Context, businessID int64, placeID int64, genreIDs []int64, payload interface{}) (int64, error)
	SetGenres(ctx context.Context, postID int64, genreIDs []int64) error
	// IncrementViewCount increments the view count for a post by 1
	IncrementViewCount(ctx context.Context, postID int64) error
	Anonymize(ctx context.Context, postID int64) error
	History(ctx context.Context, googleID string) (interface{}, error)
}

// BlockRepo defines data access methods for blocks.
type BlockRepo interface {
	Create(ctx context.Context, blockerID, blockedID string) error
	Delete(ctx context.Context, blockerID, blockedID string) error
}

// ReportRepo defines data access methods for reports.
type ReportRepo interface {
	Create(ctx context.Context, reporterID string, payload interface{}) error
}

// ContactRepo defines data access methods for contacts.
type ContactRepo interface {
	Create(ctx context.Context, googleID string, subject, message string) error
}

// StatsRepo defines data access methods for dashboard stats.
type StatsRepo interface {
	TotalPosts(ctx context.Context, businessID int64) (int64, error)
	TotalReactions(ctx context.Context, businessID int64) (int64, error)
	TotalViews(ctx context.Context, businessID int64) (int64, error)
	EngagementStats(ctx context.Context, businessID int64) (int64, int64, int64, error)
}

// PaymentRepo defines data access methods for payments.
type PaymentRepo interface {
	CreatePayment(ctx context.Context, businessID int64, amount int64, payFlag bool) (int64, error)
}

// ReactionRepo defines data access methods for reactions.
type ReactionRepo interface {
	CreateUnique(ctx context.Context, userID string, postID int64) error // must enforce (userId, postId) unique
	CountByPostIDs(ctx context.Context, postIDs []int64) (map[int64]int64, error)
}

// PlaceRepo defines data access methods for places.
type PlaceRepo interface {
	GetByID(ctx context.Context, placeID int64) (interface{}, error)
}

// GenreRepo defines data access methods for genres.
type GenreRepo interface {
	GetByID(ctx context.Context, genreID int64) (interface{}, error)
	ListByPostID(ctx context.Context, postID int64) ([]int64, error)
}
