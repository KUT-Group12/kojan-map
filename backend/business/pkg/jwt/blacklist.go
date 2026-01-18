package jwt

import (
	"sync"
	"time"
)

// TokenBlacklist は失効したJWTトークンを管理します
type TokenBlacklist struct {
	mu       sync.RWMutex
	tokens   map[string]time.Time // token -> revocation time
	ticker   *time.Ticker
	stopChan chan struct{}
}

// NewTokenBlacklist はトークンブラックリストマネージャーを生成します
func NewTokenBlacklist() *TokenBlacklist {
	tb := &TokenBlacklist{
		tokens:   make(map[string]time.Time),
		ticker:   time.NewTicker(1 * time.Hour), // 1時間ごとにクリーンアップ
		stopChan: make(chan struct{}),
	}

	// クリーンアップゴルーチンを起動
	go tb.cleanupExpiredTokens()

	return tb
}

// RevokeToken はトークンをブラックリストに追加します
// expiresAt: トークンが期限切れになる時刻（期限後はブラックリストに保持する必要なし）
func (tb *TokenBlacklist) RevokeToken(token string, expiresAt time.Time) {
	tb.mu.Lock()
	defer tb.mu.Unlock()
	tb.tokens[token] = expiresAt
}

// IsRevoked はトークンが失効されているか確認します
func (tb *TokenBlacklist) IsRevoked(token string) bool {
	tb.mu.RLock()
	defer tb.mu.RUnlock()

	expiresAt, exists := tb.tokens[token]
	if !exists {
		return false
	}

	// トークンがまだマップにある場合、失効されている
	// （期限切れトークンはクリーンアップゴルーチンによって削除される）
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
