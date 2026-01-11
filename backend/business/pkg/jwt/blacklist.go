package jwt

import (
	"sync"
	"time"
)

// TokenBlacklist manages revoked JWT tokens
type TokenBlacklist struct {
	mu       sync.RWMutex
	tokens   map[string]time.Time // token -> revocation time
	ticker   *time.Ticker
	stopChan chan struct{}
}

// NewTokenBlacklist creates a new token blacklist manager
func NewTokenBlacklist() *TokenBlacklist {
	tb := &TokenBlacklist{
		tokens:   make(map[string]time.Time),
		ticker:   time.NewTicker(1 * time.Hour), // Cleanup every hour
		stopChan: make(chan struct{}),
	}

	// Start cleanup goroutine
	go tb.cleanupExpiredTokens()

	return tb
}

// RevokeToken adds a token to the blacklist
// expiresAt: the time when the token expires (no need to keep it in blacklist after expiry)
func (tb *TokenBlacklist) RevokeToken(token string, expiresAt time.Time) {
	tb.mu.Lock()
	defer tb.mu.Unlock()
	tb.tokens[token] = expiresAt
}

// IsRevoked checks if a token is revoked
func (tb *TokenBlacklist) IsRevoked(token string) bool {
	tb.mu.RLock()
	defer tb.mu.RUnlock()

	expiresAt, exists := tb.tokens[token]
	if !exists {
		return false
	}

	// If token is still in map, it's revoked
	// (expired tokens will be cleaned up by cleanup goroutine)
	return expiresAt.After(time.Now())
}

// cleanupExpiredTokens periodically removes expired tokens from blacklist
func (tb *TokenBlacklist) cleanupExpiredTokens() {
	for {
		select {
		case <-tb.ticker.C:
			tb.mu.Lock()
			now := time.Now()
			for token, expiresAt := range tb.tokens {
				if expiresAt.Before(now) {
					delete(tb.tokens, token)
				}
			}
			tb.mu.Unlock()

		case <-tb.stopChan:
			tb.ticker.Stop()
			return
		}
	}
}

// Stop stops the cleanup goroutine
func (tb *TokenBlacklist) Stop() {
	close(tb.stopChan)
}
