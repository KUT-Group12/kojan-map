package mfa

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMFAValidator_GenerateCode(t *testing.T) {
	v := NewMFAValidator()
	email := "test@example.com"

	code, err := v.GenerateCode(email)
	require.NoError(t, err)
	assert.Len(t, code, 6)
	assert.Regexp(t, "^[0-9]{6}$", code)

	// Verify code is stored
	v.mu.RLock()
	stored, exists := v.codes[email]
	v.mu.RUnlock()
	require.True(t, exists)
	assert.Equal(t, code, stored.Code)
	assert.Equal(t, 0, stored.Attempts)
}

func TestMFAValidator_VerifyCode(t *testing.T) {
	v := NewMFAValidator()
	email := "test@example.com"

	code, _ := v.GenerateCode(email)

	// テスト用のコード
	valid, err := v.VerifyCode(email, "000000")
	assert.Error(t, err)
	assert.False(t, valid)

	// 検証試行回数の増加
	v.mu.RLock()
	stored, exists := v.codes[email]
	v.mu.RUnlock()
	require.True(t, exists)
	assert.Equal(t, 1, stored.Attempts)

	// 有効なコードの検証
	valid, err = v.VerifyCode(email, code)
	assert.NoError(t, err)
	assert.True(t, valid)

	// 有効なコードの検証後、コードが削除されること
	v.mu.RLock()
	_, exists = v.codes[email]
	v.mu.RUnlock()
	assert.False(t, exists)
}

func TestMFAValidator_RateLimiting(t *testing.T) {
	v := NewMFAValidator()
	email := "test@example.com"

	code, _ := v.GenerateCode(email)

	// 5回失敗
	for i := 0; i < 5; i++ {
		valid, err := v.VerifyCode(email, "000000")
		assert.Error(t, err)
		assert.False(t, valid)
	}

	// 6回目の検証失敗
	valid, err := v.VerifyCode(email, code)
	assert.Error(t, err)
	assert.False(t, valid)
	assert.Contains(t, err.Error(), "invalid MFA code")

	v.mu.RLock()
	_, exists := v.codes[email]
	v.mu.RUnlock()
	assert.False(t, exists)
}

func TestMFAValidator_CleanupExpiredCodes(t *testing.T) {
	v := NewMFAValidator()
	email := "test@example.com"

	v.GenerateCode(email)

	// 手動でコードを期限切れにする
	v.mu.Lock()
	v.codes[email].ExpiresAt = time.Now().Add(-1 * time.Minute)
	v.mu.Unlock()

	v.CleanupExpiredCodes()

	v.mu.RLock()
	_, exists := v.codes[email]
	v.mu.RUnlock()
	assert.False(t, exists)
}
