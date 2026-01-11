package service

import "context"

// AuthService handles authentication flows.
type AuthService interface {
	GoogleAuth(ctx context.Context, payload interface{}) (interface{}, error)
	BusinessLogin(ctx context.Context, gmail, mfaCode string) (interface{}, error)
	Logout(ctx context.Context, session interface{}) error
}

// MemberService handles business member operations.
type MemberService interface {
	GetBusinessDetails(ctx context.Context, googleID string) (interface{}, error)
	UpdateBusinessName(ctx context.Context, businessID int64, name string) error
	UpdateBusinessIcon(ctx context.Context, businessID int64, icon []byte) error
	AnonymizeMember(ctx context.Context, businessID int64) error
}

// StatsService handles dashboard stats.
type StatsService interface {
	GetTotalPosts(ctx context.Context, businessID int64) (interface{}, error)
	GetTotalReactions(ctx context.Context, businessID int64) (interface{}, error)
	GetTotalViews(ctx context.Context, businessID int64) (interface{}, error)
	GetEngagementRate(ctx context.Context, businessID int64) (interface{}, error)
}

// PostService handles posts.
type PostService interface {
	List(ctx context.Context, businessID int64) (interface{}, error)
	Get(ctx context.Context, postID int64) (interface{}, error)
	Create(ctx context.Context, businessID int64, placeID int64, genreIDs []int64, payload interface{}) (int64, error)
	SetGenres(ctx context.Context, postID int64, genreIDs []int64) error
	Anonymize(ctx context.Context, postID int64) error
	History(ctx context.Context, googleID string) (interface{}, error)
}

// BlockService handles block operations.
type BlockService interface {
	Block(ctx context.Context, blockerID, blockedID string) error
	Unblock(ctx context.Context, blockerID, blockedID string) error
}

// ReportService handles reports.
type ReportService interface {
	CreateReport(ctx context.Context, reporterID string, payload interface{}) error
}

// ContactService handles inquiries.
type ContactService interface {
	CreateContact(ctx context.Context, googleID, subject, message string) error
}

// PaymentService handles Stripe/Payment flows.
type PaymentService interface {
	CreateRedirect(ctx context.Context, businessID int64) (string, error)
}
