package jwt

import (
	"fmt"
	"os"
	"time"

	jwtlib "github.com/golang-jwt/jwt/v5"
)

// TokenManager はJWTトークンの生成と検証を処理します
type TokenManager struct {
	secret    string
	blacklist *TokenBlacklist
}

// NewTokenManager はトークンマネージャーを生成します
func NewTokenManager() *TokenManager {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// 本番環境ではJWT_SECRETが未設定の場合は起動を中止
		if os.Getenv("GO_ENV") == "production" {
			panic("JWT_SECRET environment variable is required in production")
		}
		secret = "dev-secret-key-please-change-in-production"
		// 警告: 開発環境でデフォルトシークレットを使用中
	}
	return &TokenManager{
		secret:    secret,
		blacklist: NewTokenBlacklist(),
	}
}

// Claims はJWTカスタムクレームを表します
type Claims struct {
	UserID    string `json:"userId"`
	Gmail     string `json:"gmail"`
	Role      string `json:"role"`
	TokenType string `json:"tokenType"` // "access"または"refresh"
	jwtlib.RegisteredClaims
}

// GenerateToken はユーザー用のJWTトークンを生成します（アクセストークン、1時間有効）
func (tm *TokenManager) GenerateToken(userID, gmail, role string) (string, error) {
	if userID == "" || gmail == "" || role == "" {
		return "", fmt.Errorf("userId, gmail, and role are required")
	}

	expirationTime := time.Now().Add(1 * time.Hour) // アクセストークンは1時間
	claims := &Claims{
		UserID:    userID,
		Gmail:     gmail,
		Role:      role,
		TokenType: "access",
		RegisteredClaims: jwtlib.RegisteredClaims{
			ExpiresAt: jwtlib.NewNumericDate(expirationTime),
			IssuedAt:  jwtlib.NewNumericDate(time.Now()),
			Issuer:    "kojan-map-business",
		},
	}

	token := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(tm.secret))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

// GenerateTokenPair はアクセストークンとリフレッシュトークンの両方を生成します
func (tm *TokenManager) GenerateTokenPair(userID, gmail, role string) (accessToken, refreshToken string, err error) {
	if userID == "" || gmail == "" || role == "" {
		return "", "", fmt.Errorf("userId, gmail, and role are required")
	}

	// アクセストークン: 1時間
	accessExpiration := time.Now().Add(1 * time.Hour)
	accessClaims := &Claims{
		UserID:    userID,
		Gmail:     gmail,
		Role:      role,
		TokenType: "access",
		RegisteredClaims: jwtlib.RegisteredClaims{
			ExpiresAt: jwtlib.NewNumericDate(accessExpiration),
			IssuedAt:  jwtlib.NewNumericDate(time.Now()),
			Issuer:    "kojan-map-business",
		},
	}

	accessToken, err = jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, accessClaims).SignedString([]byte(tm.secret))
	if err != nil {
		return "", "", fmt.Errorf("failed to sign access token: %w", err)
	}

	// リフレッシュトークン: 7日間
	refreshExpiration := time.Now().Add(7 * 24 * time.Hour)
	refreshClaims := &Claims{
		UserID:    userID,
		Gmail:     gmail,
		Role:      role,
		TokenType: "refresh",
		RegisteredClaims: jwtlib.RegisteredClaims{
			ExpiresAt: jwtlib.NewNumericDate(refreshExpiration),
			IssuedAt:  jwtlib.NewNumericDate(time.Now()),
			Issuer:    "kojan-map-business",
		},
	}

	refreshToken, err = jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, refreshClaims).SignedString([]byte(tm.secret))
	if err != nil {
		return "", "", fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return accessToken, refreshToken, nil
}

// VerifyToken はJWTトークンを検証してパースします
func (tm *TokenManager) VerifyToken(tokenString string) (*Claims, error) {
	return tm.VerifyTokenWithType(tokenString, "")
}

// VerifyTokenWithType はトークンを検証し、オプションでタイプチェックを行います（"access"または"refresh"）
func (tm *TokenManager) VerifyTokenWithType(tokenString, expectedType string) (*Claims, error) {
	// まずトークンが失効されていないか確認
	if tm.blacklist.IsRevoked(tokenString) {
		return nil, fmt.Errorf("token has been revoked")
	}

	claims := &Claims{}
	token, err := jwtlib.ParseWithClaims(tokenString, claims, func(token *jwtlib.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwtlib.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(tm.secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("token is invalid")
	}

	// 指定された場合はトークンタイプを確認
	if expectedType != "" && claims.TokenType != expectedType {
		return nil, fmt.Errorf("token type mismatch: expected %s, got %s", expectedType, claims.TokenType)
	}

	return claims, nil
}

// RevokeToken はトークンをブラックリストに追加します（ログアウト用）
func (tm *TokenManager) RevokeToken(tokenString string) error {
	claims, err := tm.VerifyToken(tokenString)
	if err != nil {
		return fmt.Errorf("cannot revoke invalid token: %w", err)
	}

	// 有効期限と共にトークンをブラックリストに追加
	if claims.ExpiresAt != nil {
		tm.blacklist.RevokeToken(tokenString, claims.ExpiresAt.Time)
	} else {
		// フォールバック: 有効期限がない場合は合理的な未来時間で失効
		tm.blacklist.RevokeToken(tokenString, time.Now().Add(24*time.Hour))
	}

	return nil
}

// Stop はトークンマネージャーを停止します（ゴルーチンのクリーンアップ）
func (tm *TokenManager) Stop() {
	tm.blacklist.Stop()
}
