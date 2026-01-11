package mock

import (
	"context"
	"sync"

	"kojan-map/business/internal/domain"
)

// MockAuthRepo mocks AuthRepo interface
type MockAuthRepo struct {
	mu sync.Mutex
	Users map[string]*domain.User
}

func NewMockAuthRepo() *MockAuthRepo {
	return &MockAuthRepo{
		Users: make(map[string]*domain.User),
	}
}

func (m *MockAuthRepo) GetOrCreateUser(ctx context.Context, googleID, gmail, role string) (interface{}, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if user, exists := m.Users[googleID]; exists {
		return user, nil
	}
	
	user := &domain.User{
		ID:    googleID,
		Gmail: gmail,
		Role:  role,
	}
	m.Users[googleID] = user
	return user, nil
}

func (m *MockAuthRepo) GetUserByID(ctx context.Context, googleID string) (interface{}, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if user, exists := m.Users[googleID]; exists {
		return user, nil
	}
	return nil, nil
}

func (m *MockAuthRepo) GetBusinessMemberByUserID(ctx context.Context, userID string) (interface{}, error) {
	return nil, nil
}

// MockBusinessMemberRepo mocks BusinessMemberRepo interface
type MockBusinessMemberRepo struct {
	mu sync.Mutex
	Members map[int64]*domain.BusinessMember
}

func NewMockBusinessMemberRepo() *MockBusinessMemberRepo {
	return &MockBusinessMemberRepo{
		Members: make(map[int64]*domain.BusinessMember),
	}
}

func (m *MockBusinessMemberRepo) GetByGoogleID(ctx context.Context, googleID string) (interface{}, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	for _, member := range m.Members {
		if member.UserID == googleID {
			return member, nil
		}
	}
	return nil, nil
}

func (m *MockBusinessMemberRepo) UpdateName(ctx context.Context, businessID int64, name string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if member, exists := m.Members[businessID]; exists {
		member.BusinessName = name
		return nil
	}
	return nil
}

func (m *MockBusinessMemberRepo) UpdateIcon(ctx context.Context, businessID int64, icon []byte) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if member, exists := m.Members[businessID]; exists {
		member.ProfileImage = icon
		return nil
	}
	return nil
}

func (m *MockBusinessMemberRepo) Anonymize(ctx context.Context, businessID int64) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if member, exists := m.Members[businessID]; exists {
		member.BusinessName = "[Anonymized]"
		return nil
	}
	return nil
}

// MockPostRepo mocks PostRepo interface
type MockPostRepo struct {
	mu sync.Mutex
	Posts map[int64]*domain.Post
	NextID int64
}

func NewMockPostRepo() *MockPostRepo {
	return &MockPostRepo{
		Posts: make(map[int64]*domain.Post),
		NextID: 1,
	}
}

func (m *MockPostRepo) ListByBusiness(ctx context.Context, businessID int64) (interface{}, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	var posts []domain.Post
	for _, post := range m.Posts {
		posts = append(posts, *post)
	}
	return posts, nil
}

func (m *MockPostRepo) GetByID(ctx context.Context, postID int64) (interface{}, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if post, exists := m.Posts[postID]; exists {
		return post, nil
	}
	return nil, nil
}

func (m *MockPostRepo) IncrementViewCount(ctx context.Context, postID int64) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if post, exists := m.Posts[postID]; exists {
		post.ViewCount++
		return nil
	}
	return nil
}

func (m *MockPostRepo) Create(ctx context.Context, businessID int64, placeID int64, genreIDs []int64, payload interface{}) (int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	req := payload.(*domain.CreatePostRequest)
	postID := m.NextID
	m.NextID++
	
	post := &domain.Post{
		ID:            string(rune(postID)),
		Title:         req.Title,
		Description:   req.Description,
		LocationID:    req.LocationID,
		ViewCount:     0,
		ReactionCount: 0,
		IsActive:      true,
	}
	m.Posts[postID] = post
	return postID, nil
}

func (m *MockPostRepo) SetGenres(ctx context.Context, postID int64, genreIDs []int64) error {
	return nil
}

func (m *MockPostRepo) Anonymize(ctx context.Context, postID int64) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if post, exists := m.Posts[postID]; exists {
		post.Title = "[Anonymized]"
		post.Description = "[Anonymized]"
		return nil
	}
	return nil
}

func (m *MockPostRepo) History(ctx context.Context, googleID string) (interface{}, error) {
	return []domain.Post{}, nil
}

// MockStatsRepo mocks StatsRepo interface
type MockStatsRepo struct {
	TotalPostsVal     int64
	TotalReactionsVal int64
	TotalViewsVal     int64
}

func NewMockStatsRepo() *MockStatsRepo {
	return &MockStatsRepo{}
}

func (m *MockStatsRepo) TotalPosts(ctx context.Context, businessID int64) (int64, error) {
	return m.TotalPostsVal, nil
}

func (m *MockStatsRepo) TotalReactions(ctx context.Context, businessID int64) (int64, error) {
	return m.TotalReactionsVal, nil
}

func (m *MockStatsRepo) TotalViews(ctx context.Context, businessID int64) (int64, error) {
	return m.TotalViewsVal, nil
}

func (m *MockStatsRepo) EngagementStats(ctx context.Context, businessID int64) (int64, int64, int64, error) {
	return m.TotalPostsVal, m.TotalReactionsVal, m.TotalViewsVal, nil
}

// MockBlockRepo mocks BlockRepo interface
type MockBlockRepo struct {
	mu sync.Mutex
	Blocks map[string]bool // "blocker:blocked" -> true
}

func NewMockBlockRepo() *MockBlockRepo {
	return &MockBlockRepo{
		Blocks: make(map[string]bool),
	}
}

func (m *MockBlockRepo) Create(ctx context.Context, blockerID, blockedID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.Blocks[blockerID+":"+blockedID] = true
	return nil
}

func (m *MockBlockRepo) Delete(ctx context.Context, blockerID, blockedID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.Blocks, blockerID+":"+blockedID)
	return nil
}

// MockReportRepo mocks ReportRepo interface
type MockReportRepo struct {
	mu sync.Mutex
	Reports []interface{}
}

func NewMockReportRepo() *MockReportRepo {
	return &MockReportRepo{
		Reports: []interface{}{},
	}
}

func (m *MockReportRepo) Create(ctx context.Context, reporterID string, payload interface{}) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.Reports = append(m.Reports, payload)
	return nil
}

// MockContactRepo mocks ContactRepo interface
type MockContactRepo struct {
	mu sync.Mutex
	Contacts []interface{}
}

func NewMockContactRepo() *MockContactRepo {
	return &MockContactRepo{
		Contacts: []interface{}{},
	}
}

func (m *MockContactRepo) Create(ctx context.Context, googleID string, subject, message string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.Contacts = append(m.Contacts, map[string]string{
		"googleId": googleID,
		"subject":  subject,
		"message":  message,
	})
	return nil
}

// MockPaymentRepo mocks PaymentRepo interface
type MockPaymentRepo struct {}

func NewMockPaymentRepo() *MockPaymentRepo {
	return &MockPaymentRepo{}
}

func (m *MockPaymentRepo) CreatePayment(ctx context.Context, businessID int64, amount int64, payFlag bool) (int64, error) {
	return 1, nil
}
