// Package mock provides mock implementations of repository interfaces for testing purposes.
// These mocks use in-memory storage and are designed for unit testing the service layer
// without requiring a real database connection.
package mock

import (
	"context"
	"sync"

	"kojan-map/business/internal/domain"
)

// MockAuthRepo mocks AuthRepo interface for testing user authentication operations.
// It uses an in-memory map to store users, with thread-safety via sync.Mutex.
type MockAuthRepo struct {
	mu              sync.Mutex
	Users           map[string]*domain.User           // Key: googleID, Value: User
	BusinessMembers map[string]*domain.BusinessMember // Key: userID, Value: BusinessMember
}

// NewMockAuthRepo creates a new MockAuthRepo with an empty user map.
func NewMockAuthRepo() *MockAuthRepo {
	return &MockAuthRepo{
		Users:           make(map[string]*domain.User),
		BusinessMembers: make(map[string]*domain.BusinessMember),
	}
}

// GetOrCreateUser retrieves an existing user or creates a new one if not found.
// Thread-safe operation with mutex locking.
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

// GetUserByID retrieves a user by Google ID.
// Returns nil if user is not found.
func (m *MockAuthRepo) GetUserByID(ctx context.Context, googleID string) (interface{}, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if user, exists := m.Users[googleID]; exists {
		return user, nil
	}
	return nil, nil
}

// GetUserByGmail retrieves a user by Gmail.
// Iterates through map to find match.
func (m *MockAuthRepo) GetUserByGmail(ctx context.Context, gmail string) (interface{}, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, user := range m.Users {
		if user.Gmail == gmail {
			return user, nil
		}
	}
	return nil, nil
}

// GetBusinessMemberByUserID retrieves a business member by user ID.
func (m *MockAuthRepo) GetBusinessMemberByUserID(ctx context.Context, userID string) (interface{}, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if member, exists := m.BusinessMembers[userID]; exists {
		return member, nil
	}
	return nil, nil
}

// MockBusinessMemberRepo mocks BusinessMemberRepo interface for testing business member operations.
// It uses an in-memory map to store members, indexed by business ID.
type MockBusinessMemberRepo struct {
	mu      sync.Mutex
	Members map[int64]*domain.BusinessMember // Key: businessID, Value: BusinessMember
}

// NewMockBusinessMemberRepo creates a new MockBusinessMemberRepo with an empty members map.
func NewMockBusinessMemberRepo() *MockBusinessMemberRepo {
	return &MockBusinessMemberRepo{
		Members: make(map[int64]*domain.BusinessMember),
	}
}

// GetByGoogleID retrieves a business member by Google ID.
// Iterates through all members to find a match on UserID field.
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

// UpdateName updates the business name of a member.
// Returns nil if member is not found.
func (m *MockBusinessMemberRepo) UpdateName(ctx context.Context, businessID int64, name string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if member, exists := m.Members[businessID]; exists {
		member.BusinessName = name
		return nil
	}
	return nil
}

// UpdateIcon updates the profile image of a member.
// Returns nil if member is not found.
func (m *MockBusinessMemberRepo) UpdateIcon(ctx context.Context, businessID int64, icon []byte) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if member, exists := m.Members[businessID]; exists {
		member.ProfileImage = icon
		return nil
	}
	return nil
}

// Anonymize anonymizes a business member by setting their name to "[Anonymized]".
// Returns nil if member is not found.
func (m *MockBusinessMemberRepo) Anonymize(ctx context.Context, businessID int64) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if member, exists := m.Members[businessID]; exists {
		member.BusinessName = "[Anonymized]"
		return nil
	}
	return nil
}

// MockPostRepo mocks PostRepo interface for testing post CRUD operations.
// It uses an in-memory map to store posts and maintains an auto-incrementing ID counter.
type MockPostRepo struct {
	mu     sync.Mutex
	Posts  map[int64]*domain.Post // Key: postID, Value: Post
	NextID int64                  // Auto-increment counter
}

// NewMockPostRepo creates a new MockPostRepo with an empty posts map and NextID initialized to 1.
func NewMockPostRepo() *MockPostRepo {
	return &MockPostRepo{
		Posts:  make(map[int64]*domain.Post),
		NextID: 1,
	}
}

// ListByBusiness retrieves all posts from the mock repository.
// (In a real implementation, this would filter by businessID)
// Returns an empty slice (not nil) when no posts exist.
func (m *MockPostRepo) ListByBusiness(ctx context.Context, businessID int64) (interface{}, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	posts := make([]domain.Post, 0)
	for _, post := range m.Posts {
		posts = append(posts, *post)
	}
	return posts, nil
}

// GetByID retrieves a post by its ID.
// Returns nil if post is not found.
func (m *MockPostRepo) GetByID(ctx context.Context, postID int64) (interface{}, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if post, exists := m.Posts[postID]; exists {
		return post, nil
	}
	return nil, nil
}

// IncrementViewCount increments the view count of a post.
// Returns nil if post is not found.
func (m *MockPostRepo) IncrementViewCount(ctx context.Context, postID int64) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if post, exists := m.Posts[postID]; exists {
		post.ViewCount++
		return nil
	}
	return nil
}

// Create creates a new post and returns its auto-incremented ID.
// Accepts a payload interface (typically *domain.CreatePostRequest).
func (m *MockPostRepo) Create(ctx context.Context, businessID int64, placeID int64, genreIDs []int64, payload interface{}) (int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	req := payload.(*domain.CreatePostRequest)
	postID := m.NextID
	m.NextID++

	post := &domain.Post{
		ID:            postID,
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

// SetGenres associates genres with a post.
// This is a stub implementation for the mock.
func (m *MockPostRepo) SetGenres(ctx context.Context, postID int64, genreIDs []int64) error {
	return nil
}

// Anonymize anonymizes a post by setting its title and description to "[Anonymized]".
// Returns nil if post is not found.
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

// History retrieves the post history for a user.
// This is a stub implementation for the mock.
func (m *MockPostRepo) History(ctx context.Context, googleID string) (interface{}, error) {
	return []domain.Post{}, nil
}

// MockStatsRepo mocks StatsRepo interface for testing statistics aggregation operations.
// It uses simple fields to store configurable return values for testing various scenarios.
type MockStatsRepo struct {
	TotalPostsVal     int64 // Configurable return value for TotalPosts
	TotalReactionsVal int64 // Configurable return value for TotalReactions
	TotalViewsVal     int64 // Configurable return value for TotalViews
}

// NewMockStatsRepo creates a new MockStatsRepo with zero-initialized values.
func NewMockStatsRepo() *MockStatsRepo {
	return &MockStatsRepo{}
}

// TotalPosts returns the configured total posts value.
func (m *MockStatsRepo) TotalPosts(ctx context.Context, businessID int64) (int64, error) {
	return m.TotalPostsVal, nil
}

// TotalReactions returns the configured total reactions value.
func (m *MockStatsRepo) TotalReactions(ctx context.Context, businessID int64) (int64, error) {
	return m.TotalReactionsVal, nil
}

// TotalViews returns the configured total views value.
func (m *MockStatsRepo) TotalViews(ctx context.Context, businessID int64) (int64, error) {
	return m.TotalViewsVal, nil
}

// EngagementStats returns all configured statistics values as a tuple.
func (m *MockStatsRepo) EngagementStats(ctx context.Context, businessID int64) (int64, int64, int64, error) {
	return m.TotalPostsVal, m.TotalReactionsVal, m.TotalViewsVal, nil
}

// MockBlockRepo mocks BlockRepo interface for testing block/unblock operations.
// It uses an in-memory map to store block relationships as strings in "blocker:blocked" format.
type MockBlockRepo struct {
	mu     sync.Mutex
	Blocks map[string]bool // Key: "blockerID:blockedID", Value: true if blocked
}

// NewMockBlockRepo creates a new MockBlockRepo with an empty blocks map.
func NewMockBlockRepo() *MockBlockRepo {
	return &MockBlockRepo{
		Blocks: make(map[string]bool),
	}
}

// Create registers a block relationship between two users.
func (m *MockBlockRepo) Create(ctx context.Context, blockerID, blockedID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.Blocks[blockerID+":"+blockedID] = true
	return nil
}

// Delete removes a block relationship between two users.
func (m *MockBlockRepo) Delete(ctx context.Context, blockerID, blockedID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.Blocks, blockerID+":"+blockedID)
	return nil
}

// MockReportRepo mocks ReportRepo interface for testing violation report operations.
// It uses a slice to store report payloads.
type MockReportRepo struct {
	mu      sync.Mutex
	Reports []interface{} // Stores report payloads
}

// NewMockReportRepo creates a new MockReportRepo with an empty reports slice.
func NewMockReportRepo() *MockReportRepo {
	return &MockReportRepo{
		Reports: []interface{}{},
	}
}

// Create appends a report payload to the reports slice.
func (m *MockReportRepo) Create(ctx context.Context, reporterID string, payload interface{}) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.Reports = append(m.Reports, payload)
	return nil
}

// MockContactRepo mocks ContactRepo interface for testing contact form operations.
// It uses a slice to store contact payloads.
type MockContactRepo struct {
	mu       sync.Mutex
	Contacts []interface{} // Stores contact payloads
}

// NewMockContactRepo creates a new MockContactRepo with an empty contacts slice.
func NewMockContactRepo() *MockContactRepo {
	return &MockContactRepo{
		Contacts: []interface{}{},
	}
}

// Create appends a contact form entry to the contacts slice.
// Stores googleID, subject, and message in a map format.
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

// MockPaymentRepo mocks PaymentRepo interface for testing payment operations.
// This is a minimal stub implementation for testing purposes.
type MockPaymentRepo struct{}

// NewMockPaymentRepo creates a new MockPaymentRepo.
func NewMockPaymentRepo() *MockPaymentRepo {
	return &MockPaymentRepo{}
}

// CreatePayment creates a payment record and returns a payment ID.
// This is a stub implementation that always returns ID 1.
func (m *MockPaymentRepo) CreatePayment(ctx context.Context, businessID int64, amount int64, payFlag bool) (int64, error) {
	return 1, nil
}
