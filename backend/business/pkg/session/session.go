package session

import (
	"crypto/subtle"
	"fmt"
	"sync"
	"time"
)

// MFASession はMFA認証セッション情報を保持します
type MFASession struct {
	SessionID string
	Gmail     string
	MFACode   string
	GoogleID  string
	ExpiresAt time.Time
}

// SessionStore はMFAセッションを管理します
type SessionStore struct {
	mu       sync.RWMutex
	sessions map[string]*MFASession
	ticker   *time.Ticker
	stopChan chan struct{}
	stopOnce sync.Once
}

// NewSessionStore はセッションストアを生成します
func NewSessionStore() *SessionStore {
	store := &SessionStore{
		sessions: make(map[string]*MFASession),
		ticker:   time.NewTicker(1 * time.Minute), // 1分ごとにクリーンアップ
		stopChan: make(chan struct{}),
	}

	// 期限切れセッションの自動削除
	go store.cleanupExpiredSessions()

	return store
}

// CreateSession は新しいMFAセッションを作成します
func (s *SessionStore) CreateSession(sessionID, gmail, mfaCode, googleID string, ttl time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.sessions[sessionID] = &MFASession{
		SessionID: sessionID,
		Gmail:     gmail,
		MFACode:   mfaCode,
		GoogleID:  googleID,
		ExpiresAt: time.Now().Add(ttl),
	}
}

// GetSession はセッションIDからセッション情報を取得します
func (s *SessionStore) GetSession(sessionID string) (*MFASession, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	session, exists := s.sessions[sessionID]
	if !exists {
		return nil, fmt.Errorf("セッションが見つかりません")
	}

	if time.Now().After(session.ExpiresAt) {
		return nil, fmt.Errorf("セッションの有効期限が切れています")
	}

	return session, nil
}

// DeleteSession はセッションを削除します
func (s *SessionStore) DeleteSession(sessionID string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, sessionID)
}

// ValidateMFACode はMFAコードを検証します
func (s *SessionStore) ValidateMFACode(sessionID, mfaCode string) (*MFASession, error) {
	session, err := s.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	if subtle.ConstantTimeCompare([]byte(session.MFACode), []byte(mfaCode)) != 1 {
		return nil, fmt.Errorf("MFAコードが一致しません")
	}

	return session, nil
}

// cleanupExpiredSessions は期限切れセッションを定期的に削除します
func (s *SessionStore) cleanupExpiredSessions() {
	for {
		select {
		case <-s.ticker.C:
			s.mu.Lock()
			now := time.Now()
			for id, session := range s.sessions {
				if now.After(session.ExpiresAt) {
					delete(s.sessions, id)
				}
			}
			s.mu.Unlock()
		case <-s.stopChan:
			return
		}
	}
}

// Stop はセッションストアを停止します
func (s *SessionStore) Stop() {
	s.stopOnce.Do(func() {
		s.ticker.Stop()
		close(s.stopChan)
	})
}
