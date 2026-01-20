package impl

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"time"

	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/errors"
	"kojan-map/business/pkg/jwt"
	"kojan-map/business/pkg/mfa"
	"kojan-map/business/pkg/notification"
	"kojan-map/business/pkg/oauth"
	"kojan-map/business/pkg/session"
)

// AuthServiceImpl はAuthServiceインターフェースを実装します。
type AuthServiceImpl struct {
	authRepo            repository.AuthRepo
	tokenVerifier       oauth.TokenVerifier
	tokenManager        *jwt.TokenManager
	mfaValidator        *mfa.MFAValidator
	notificationService notification.NotificationService
	sessionStore        *session.SessionStore
}

func generateSecureSessionID() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// NewAuthServiceImpl は新しい認証サービスを作成します。
// tokenManagerはブラックリストの同期を保証するため、ミドルウェアと共有する必要があります。
func NewAuthServiceImpl(authRepo repository.AuthRepo, tokenManager *jwt.TokenManager) *AuthServiceImpl {
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	if googleClientID == "" {
		if os.Getenv("GO_ENV") == "production" {
			panic("GOOGLE_CLIENT_ID environment variable is required in production")
		}
		googleClientID = "placeholder-client-id" // DEV ONLY
	}

	return &AuthServiceImpl{
		authRepo:            authRepo,
		tokenVerifier:       oauth.NewGoogleTokenVerifier(googleClientID),
		tokenManager:        tokenManager,
		mfaValidator:        mfa.NewMFAValidator(),
		notificationService: notification.NewEmailNotificationService(),
		sessionStore:        session.NewSessionStore(),
	}
}

// GoogleAuth はGoogle認証を処理します（M3-1）。
func (s *AuthServiceImpl) GoogleAuth(ctx context.Context, payload interface{}) (interface{}, error) {
	req, ok := payload.(*domain.GoogleAuthRequest)
	if !ok {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "invalid request payload")
	}

	if req.GoogleID == "" || req.Gmail == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "googleId and gmail are required")
	}

	// フロントエンドからのGoogle OAuthトークンを検証
	if req.IDToken == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "idToken is required")
	}

	claims, err := s.tokenVerifier.VerifyToken(ctx, req.IDToken)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, fmt.Sprintf("invalid OAuth token: %v", err))
	}

	// トークンのクレームがリクエストと一致するか検証
	if claims.Sub != req.GoogleID {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, "token subject does not match googleId")
	}

	if claims.Email != req.Gmail {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, "token email does not match gmail")
	}

	// MFA完了を検証 - MFAコードを生成
	mfaCode, err := s.mfaValidator.GenerateCode(req.Gmail)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to generate MFA code: %v", err))
	}

	// ユーザーを取得または作成
	user, err := s.authRepo.GetOrCreateUser(ctx, req.GoogleID, req.Gmail, "business")
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to get or create user: %v", err))
	}

	// 本番環境と開発環境で動作を分岐
	isProduction := os.Getenv("GO_ENV") == "production"
	var sessionID string

	if isProduction {
		// 本番環境: セッションIDを生成し、MFAコードは帯域外で送信
		var err error
		sessionID, err = generateSecureSessionID()
		if err != nil {
			return nil, errors.NewAPIError(errors.ErrOperationFailed, "failed to generate session ID")
		}

		// セッション情報を保存（5分間有効）
		s.sessionStore.CreateSession(sessionID, req.Gmail, mfaCode, req.GoogleID, 5*time.Minute)

		// MFAコードをメールで送信
		if err := s.notificationService.SendMFACode(req.Gmail, mfaCode); err != nil {
			return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to send MFA code: %v", err))
		}

		// セキュリティ: MFAコードはレスポンスに含めない
	} else {
		// 開発環境: MFAコードをセッションIDとして返却（テスト用）
		sessionID = mfaCode
	}

	// MFAチャレンジを返却 - ユーザーは次のステップでコードを検証する必要がある
	return &domain.GoogleAuthResponse{
		SessionID: sessionID,
		UserID:    user.(*domain.User).ID,
		Role:      user.(*domain.User).Role,
	}, nil
}

// BusinessLogin は事業者メンバーのログインを処理します（M1-1）。
func (s *AuthServiceImpl) BusinessLogin(ctx context.Context, sessionID, gmail, mfaCode string) (interface{}, error) {
	if sessionID == "" || gmail == "" || mfaCode == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "sessionId, gmail and mfaCode are required")
	}

	// 本番環境: sessionStoreで検証
	// 開発環境: mfaValidatorで検証（後方互換性）
	isProduction := os.Getenv("GO_ENV") == "production"

	if isProduction {
		// sessionStoreを使用してMFAコードを検証
		session, err := s.sessionStore.ValidateMFACode(sessionID, mfaCode)
		if err != nil {
			// 詳細なエラー内容はログに出力し、APIレスポンスには汎用メッセージを返す
			return nil, errors.NewAPIError(errors.ErrMissingMFA, "MFA verification failed")
		}

		// セッションのgmailと一致するか確認
		if session.Gmail != gmail {
			return nil, errors.NewAPIError(errors.ErrUnauthorized, "gmail mismatch")
		}

		// 検証成功後、セッションを削除
		s.sessionStore.DeleteSession(sessionID)
	} else {
		// 開発環境: 従来のmfaValidatorを使用
		valid, err := s.mfaValidator.VerifyCode(gmail, mfaCode)
		if err != nil || !valid {
			// 詳細なエラー内容はログに出力し、APIレスポンスには汎用メッセージを返す
			return nil, errors.NewAPIError(errors.ErrMissingMFA, "MFA verification failed")
		}
	}

	// gmailでユーザーを取得し、ロールが'business'であることを確認
	user, err := s.authRepo.GetUserByGmail(ctx, gmail)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, "user not found")
	}

	userData := user.(*domain.User)
	if userData.Role != "business" {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, "user is not a business member")
	}

	// JWTトークンを生成
	token, err := s.tokenManager.GenerateToken(userData.ID, userData.Gmail, userData.Role)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to generate JWT token: %v", err))
	}

	// ビジネスメンバーテーブルから実際の事業者IDを取得
	businessMember, err := s.authRepo.GetBusinessMemberByUserID(ctx, userData.ID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, fmt.Sprintf("business member not found for user: %v", err))
	}
	if businessMember == nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, "business member not found for user")
	}

	member := businessMember.(*domain.BusinessMember)

	response := &domain.BusinessLoginResponse{
		Token: token,
	}
	response.Business.ID = member.ID
	response.Business.Role = userData.Role

	return response, nil
}

// RefreshToken はトークンのリフレッシュを処理します（新規エンドポイント）。
func (s *AuthServiceImpl) RefreshToken(ctx context.Context, refreshTokenString string) (interface{}, error) {
	if refreshTokenString == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "refreshToken is required")
	}

	// リフレッシュトークンを検証
	claims, err := s.tokenManager.VerifyTokenWithType(refreshTokenString, "refresh")
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, fmt.Sprintf("invalid refresh token: %v", err))
	}

	// ユーザーがまだ存在し、正しいロールを持っているか確認
	user, err := s.authRepo.GetUserByID(ctx, claims.UserID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, "user not found")
	}

	userData := user.(*domain.User)
	if userData.Role != "business" {
		return nil, errors.NewAPIError(errors.ErrUnauthorized, "user is not a business member")
	}

	// 新しいアクセストークンを生成（リフレッシュトークンは同じものを維持）
	newAccessToken, err := s.tokenManager.GenerateToken(userData.ID, userData.Gmail, userData.Role)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to generate new access token: %v", err))
	}

	return &domain.RefreshTokenResponse{
		AccessToken: newAccessToken,
	}, nil
}

// Logout はログアウトを処理します（M1-3-3）。
// sessionパラメータはJWTトークン文字列であることを期待しています。
func (s *AuthServiceImpl) Logout(ctx context.Context, session interface{}) error {
	tokenString, ok := session.(string)
	if !ok {
		return errors.NewAPIError(errors.ErrUnauthorized, "invalid session format")
	}

	if tokenString == "" {
		return errors.NewAPIError(errors.ErrUnauthorized, "token is required")
	}

	// トークンを無効化（ブラックリストに追加）
	if err := s.tokenManager.RevokeToken(tokenString); err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to revoke token: %v", err))
	}

	// 期限切れのMFAコードを定期的にクリーンアップ
	s.mfaValidator.CleanupExpiredCodes()

	return nil
}

// Close はAuthServiceのリソースをクリーンアップします（グレースフルシャットダウン用）
func (s *AuthServiceImpl) Close() {
	if s.sessionStore != nil {
		s.sessionStore.Stop()
	}
	if s.tokenManager != nil {
		s.tokenManager.Stop()
	}
}
