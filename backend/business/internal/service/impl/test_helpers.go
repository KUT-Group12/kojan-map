package impl

import (
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository/mock"
	"kojan-map/business/pkg/jwt"
	"time"
)

// TestFixtures は各テストで使用する共通フィクスチャを管理します
type TestFixtures struct {
	AuthRepo       *mock.MockAuthRepo
	MemberRepo     *mock.MockBusinessMemberRepo
	PostRepo       *mock.MockPostRepo
	StatsRepo      *mock.MockStatsRepo
	BlockRepo      *mock.MockBlockRepo
	ReportRepo     *mock.MockReportRepo
	ContactRepo    *mock.MockContactRepo
	PaymentRepo    *mock.MockPaymentRepo
	AuthService    *AuthServiceImpl
	MemberService  *MemberServiceImpl
	PostService    *PostServiceImpl
	StatsService   *StatsServiceImpl
	BlockService   *BlockServiceImpl
	ReportService  *ReportServiceImpl
	ContactService *ContactServiceImpl
	PaymentService *PaymentServiceImpl
}

// NewTestFixtures は初期化されたテストフィクスチャを生成します
func NewTestFixtures() *TestFixtures {
	authRepo := mock.NewMockAuthRepo()
	memberRepo := mock.NewMockBusinessMemberRepo()
	postRepo := mock.NewMockPostRepo()
	statsRepo := mock.NewMockStatsRepo()
	blockRepo := mock.NewMockBlockRepo()
	reportRepo := mock.NewMockReportRepo()
	contactRepo := mock.NewMockContactRepo()
	paymentRepo := mock.NewMockPaymentRepo()

	return &TestFixtures{
		AuthRepo:       authRepo,
		MemberRepo:     memberRepo,
		PostRepo:       postRepo,
		StatsRepo:      statsRepo,
		BlockRepo:      blockRepo,
		ReportRepo:     reportRepo,
		ContactRepo:    contactRepo,
		PaymentRepo:    paymentRepo,
		AuthService:    NewAuthServiceImpl(authRepo, jwt.NewTokenManager()),
		MemberService:  NewMemberServiceImpl(memberRepo, authRepo),
		PostService:    NewPostServiceImpl(postRepo),
		StatsService:   NewStatsServiceImpl(statsRepo),
		BlockService:   NewBlockServiceImpl(blockRepo),
		ReportService:  NewReportServiceImpl(reportRepo),
		ContactService: NewContactServiceImpl(contactRepo),
		PaymentService: NewPaymentServiceImpl(paymentRepo),
	}
}

// SetupUser はモックリポジトリにテストユーザーを登録します
func (f *TestFixtures) SetupUser(googleID, gmail string) *domain.User {
	user := &domain.User{
		ID:    googleID,
		Gmail: gmail,
		Role:  "business",
	}
	f.AuthRepo.Users[googleID] = user
	return user
}

// SetupBusinessMember はモックリポジトリにビジネス会員を登録します
func (f *TestFixtures) SetupBusinessMember(
	businessID int32,
	googleID string,
	businessName string,
	profileImage []byte,
) *domain.BusinessMember {
	member := &domain.BusinessMember{
		ID:           int32(businessID),
		BusinessName: businessName,
		UserID:       googleID,
		ProfileImage: profileImage,
	}
	f.MemberRepo.Members[businessID] = member
	f.AuthRepo.BusinessMembers[googleID] = member
	return member
}

// SetupPost はモックリポジトリにテスト投稿を登録します
func (f *TestFixtures) SetupPost(
	postID int32,
	authorID string,
	title string,
	description string,
	viewCount int32,
) *domain.Post {
	post := &domain.Post{
		ID:       int32(postID),
		UserID:   authorID,
		Title:    title,
		Text:     description,
		NumView:  viewCount,
		PostDate: time.Now(),
	}
	f.PostRepo.Posts[postID] = post
	return post
}

// SetupStatsValue はモック統計リポジトリに集計値を設定します
func (f *TestFixtures) SetupStatsValue(
	totalPosts int32,
	totalReactions int32,
	totalViews int32,
) {
	f.StatsRepo.TotalPostsVal = totalPosts
	f.StatsRepo.TotalReactionsVal = totalReactions
	f.StatsRepo.TotalViewsVal = totalViews
}

// Helper functions for validation

// validateBusinessID はビジネスIDの妥当性を検証します
func validateBusinessID(businessID int32) bool {
	return businessID > 0
}

// validatePostID は投稿IDの妥当性を検証します
func validatePostID(postID int32) bool {
	return postID > 0
}

// validateGoogleID はGoogle IDの妥当性を検証します
func validateGoogleID(googleID string) bool {
	return googleID != ""
}

// validateBusinessName はビジネス名の妥当性を検証します
func validateBusinessName(name string) bool {
	return name != "" && len(name) <= 255
}

// validateImageData は画像データの妥当性を検証します
func validateImageData(data []byte) bool {
	return len(data) > 0
}

// validateEmail はメールアドレスの妥当性を検証します（簡易版）
func validateEmail(email string) bool {
	return email != "" && len(email) <= 255
}

// GenerateTestJWT はテスト用の有効なJWTトークンを生成します
func GenerateTestJWT(userID, gmail, role string) string {
	tokenManager := jwt.NewTokenManager()
	token, _ := tokenManager.GenerateToken(userID, gmail, role)
	return token
}

// GenerateExpiredTestJWT はテスト用の有効期限切れJWTトークンを生成します
func GenerateExpiredTestJWT() string {
	return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNjAwMDAwMDAwfQ.expired"
}
