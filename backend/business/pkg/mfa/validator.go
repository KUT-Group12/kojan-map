package mfa

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"
)

// MFAValidator はMFAコード検証を処理します
type MFAValidator struct {
	// In production, store MFA codes in Redis or database with TTL
	// For now, using simple in-memory storage (not thread-safe; for dev only)
	codes map[string]*MFACode
}

// MFACode はメタデータ付きの生成されたMFAコードを表します
type MFACode struct {
	Code        string
	ExpiresAt   time.Time
	Attempts    int
	MaxAttempts int
}

// NewMFAValidator はMFA検証器を生成します
func NewMFAValidator() *MFAValidator {
	return &MFAValidator{
		codes: make(map[string]*MFACode),
	}
}

// GenerateCode generates a 6-digit MFA code for a user.
func (m *MFAValidator) GenerateCode(email string) (string, error) {
	if email == "" {
		return "", fmt.Errorf("email is required")
	}

	// ６桁のランダムコードを生成
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", fmt.Errorf("failed to generate MFA code: %w", err)
	}
	code := fmt.Sprintf("%06d", n.Int64())

	// Store code with 10-minute expiration
	m.codes[email] = &MFACode{
		Code:        code,
		ExpiresAt:   time.Now().Add(10 * time.Minute),
		Attempts:    0,
		MaxAttempts: 5,
	}

	// In production, send code via SMS or email
	// For now, just return the code (for testing)
	return code, nil
}

// VerifyCode verifies the MFA code provided by the user.
func (m *MFAValidator) VerifyCode(email, providedCode string) (bool, error) {
	if email == "" || providedCode == "" {
		return false, fmt.Errorf("email and code are required")
	}

	mfaCode, exists := m.codes[email]
	if !exists {
		return false, fmt.Errorf("no MFA code found for email: %s", email)
	}

	// Check if code expired
	if time.Now().After(mfaCode.ExpiresAt) {
		delete(m.codes, email)
		return false, fmt.Errorf("MFA code expired")
	}

	// Check if max attempts exceeded
	if mfaCode.Attempts >= mfaCode.MaxAttempts {
		delete(m.codes, email)
		return false, fmt.Errorf("max MFA attempts exceeded")
	}

	// Increment attempt count
	mfaCode.Attempts++

	// Verify code
	if mfaCode.Code == providedCode {
		delete(m.codes, email)
		return true, nil
	}

	return false, fmt.Errorf("invalid MFA code")
}

// CleanupExpiredCodes removes expired codes from storage.
func (m *MFAValidator) CleanupExpiredCodes() {
	now := time.Now()
	for email, code := range m.codes {
		if now.After(code.ExpiresAt) {
			delete(m.codes, email)
		}
	}
}
