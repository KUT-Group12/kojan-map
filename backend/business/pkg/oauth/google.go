package oauth

import (
	"context"
	"fmt"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/idtoken"
)

// TokenVerifier defines the interface for verifying OAuth tokens.
type TokenVerifier interface {
	VerifyToken(ctx context.Context, token string) (*TokenClaims, error)
}

// GoogleTokenVerifier はGoogle OAuthトークン検証を処理します
type GoogleTokenVerifier struct {
	clientID string
}

// NewGoogleTokenVerifier はGoogleトークン検証器を生成します
func NewGoogleTokenVerifier(clientID string) *GoogleTokenVerifier {
	return &GoogleTokenVerifier{clientID: clientID}
}

// VerifyToken はGoogle OAuthトークンを検証し、クレームを返します
// トークンはフロントエンドのGoogle認証からのIDトークンである必要があります
func (v *GoogleTokenVerifier) VerifyToken(ctx context.Context, token string) (*TokenClaims, error) {
	if token == "" {
		return nil, fmt.Errorf("token is required")
	}

	// Googleの公式idtokenパッケージを使用してIDトークンを検証
	// これにより署名、期限、発行者、対象者が検証されます
	payload, err := idtoken.Validate(ctx, token, v.clientID)
	if err != nil {
		return nil, fmt.Errorf("failed to validate token: %w", err)
	}

	// 検証済みペイロードからクレームを抽出
	claims := &TokenClaims{
		Sub:        payload.Subject,
		Issuer:     payload.Issuer,
		AUD:        payload.Audience,
		Expiration: payload.Expires,
		IssuedAt:   payload.IssuedAt,
	}

	// Extract email (required claim)
	if email, ok := payload.Claims["email"].(string); ok {
		claims.Email = email
	} else {
		return nil, fmt.Errorf("email claim not found in token")
	}

	// オプション: 存在する場合は追加のクレームを抽出
	if name, ok := payload.Claims["name"].(string); ok {
		claims.Name = name
	}
	if picture, ok := payload.Claims["picture"].(string); ok {
		claims.Picture = picture
	}

	return claims, nil
}

// TokenClaims はGoogle IDトークンのクレームを表します
type TokenClaims struct {
	Sub        string `json:"sub"`     // Subject (unique user ID)
	Email      string `json:"email"`   // Email address
	Name       string `json:"name"`    // User's name
	Picture    string `json:"picture"` // Profile picture URL
	Issuer     string `json:"iss"`     // Issuer (should be accounts.google.com)
	AUD        string `json:"aud"`     // Audience (client ID)
	Expiration int64  `json:"exp"`     // Expiration time
	IssuedAt   int64  `json:"iat"`     // Issued at time
}

// GetGoogleConfig はGoogle用のOAuth2設定を返します
// 認証URLの生成やコードとトークンの交換に使用されます
func GetGoogleConfig(clientID, clientSecret, redirectURL string) *oauth2.Config {
	return &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
}
