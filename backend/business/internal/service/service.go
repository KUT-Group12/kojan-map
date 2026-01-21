package service

import "context"

// AuthService は認証フローを処理します。
type AuthService interface {
	GoogleAuth(ctx context.Context, payload interface{}) (interface{}, error)
	BusinessLogin(ctx context.Context, sessionID, gmail, mfaCode string) (interface{}, error)
	Logout(ctx context.Context, session interface{}) error
	RefreshToken(ctx context.Context, refreshTokenString string) (interface{}, error)
}

// MemberService は事業者メンバーの操作を処理します。
type MemberService interface {
	GetBusinessDetails(ctx context.Context, googleID string) (interface{}, error)
	UpdateBusinessName(ctx context.Context, businessID int32, name string) error
	UpdateBusinessIcon(ctx context.Context, businessID int32, icon []byte) error
	AnonymizeMember(ctx context.Context, businessID int32) error
}

// StatsService はダッシュボードの統計情報を処理します。
type StatsService interface {
	GetTotalPosts(ctx context.Context, businessID int32) (interface{}, error)
	GetTotalReactions(ctx context.Context, businessID int32) (interface{}, error)
	GetTotalViews(ctx context.Context, businessID int32) (interface{}, error)
	GetEngagementRate(ctx context.Context, businessID int32) (interface{}, error)
}

// PostService は投稿を処理します。
type PostService interface {
	List(ctx context.Context, businessID int32) (interface{}, error)
	Get(ctx context.Context, postID int32) (interface{}, error)
	Create(ctx context.Context, businessID int32, placeID int32, genreIDs []int32, payload interface{}) (int32, error)
	SetGenres(ctx context.Context, postID int32, genreIDs []int32) error
	Anonymize(ctx context.Context, postID int32) error
	History(ctx context.Context, googleID string) (interface{}, error)
}

// BlockService はブロック操作を処理します。
type BlockService interface {
	Block(ctx context.Context, blockerID, blockedID string) error
	Unblock(ctx context.Context, blockerID, blockedID string) error
}

// ReportService は通報を処理します。
type ReportService interface {
	CreateReport(ctx context.Context, reporterID string, payload interface{}) error
}

// ContactService はお問い合わせを処理します。
type ContactService interface {
	CreateContact(ctx context.Context, googleID, subject, message string) error
}

// PaymentService はStripe/決済フローを処理します。
type PaymentService interface {
	CreateRedirect(ctx context.Context, businessID int32) (string, error)
}
