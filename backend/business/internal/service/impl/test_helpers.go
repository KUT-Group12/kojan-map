package impl

import (
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository/mock"
)

// TestFixtures は各テストで使用する共通フィクスチャを管理します
type TestFixtures struct {
	AuthRepo    *mock.MockAuthRepo
	MemberRepo  *mock.MockBusinessMemberRepo
	PostRepo    *mock.MockPostRepo
	StatsRepo   *mock.MockStatsRepo
	BlockRepo   *mock.MockBlockRepo
	ReportRepo  *mock.MockReportRepo
}

// NewTestFixtures は初期化されたテストフィクスチャを生成します
func NewTestFixtures() *TestFixtures {
	return &TestFixtures{
		AuthRepo:    mock.NewMockAuthRepo(),
		MemberRepo:  mock.NewMockBusinessMemberRepo(),
		PostRepo:    mock.NewMockPostRepo(),
		StatsRepo:   mock.NewMockStatsRepo(),
		BlockRepo:   mock.NewMockBlockRepo(),
		ReportRepo:  mock.NewMockReportRepo(),
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
	businessID int64,
	googleID string,
	businessName string,
	profileImage []byte,
) *domain.BusinessMember {
	member := &domain.BusinessMember{
		ID:           businessID,
		BusinessName: businessName,
		UserID:       googleID,
		ProfileImage: profileImage,
	}
	f.MemberRepo.Members[businessID] = member
	return member
}

// SetupPost はモックリポジトリにテスト投稿を登録します
func (f *TestFixtures) SetupPost(
	postID int64,
	authorID string,
	title string,
	description string,
	viewCount int64,
) *domain.Post {
	post := &domain.Post{
		ID:          string(rune(postID)),
		AuthorID:    authorID,
		Title:       title,
		Description: description,
		ViewCount:   viewCount,
		IsActive:    true,
	}
	f.PostRepo.Posts[postID] = post
	return post
}

// SetupStatsValue はモック統計リポジトリに集計値を設定します
func (f *TestFixtures) SetupStatsValue(
	totalPosts int64,
	totalReactions int64,
	totalViews int64,
) {
	f.StatsRepo.TotalPostsVal = totalPosts
	f.StatsRepo.TotalReactionsVal = totalReactions
	f.StatsRepo.TotalViewsVal = totalViews
}

// Helper functions for validation

// validateBusinessID はビジネスIDの妥当性を検証します
func validateBusinessID(businessID int64) bool {
	return businessID > 0
}

// validatePostID は投稿IDの妥当性を検証します
func validatePostID(postID int64) bool {
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
