package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"kojan-map/user/config"
	"kojan-map/user/models"
)

// UserService ユーザー関連のビジネスロジック
type UserService struct{}

// RegisterOrLogin Google認証でユーザーを登録またはログイン
func (us *UserService) RegisterOrLogin(googleID, email string) (*models.Session, error) {
	if googleID == "" {
		return nil, errors.New("googleID is required")
	}
	if email == "" {
		return nil, errors.New("email is required")
	}

	var user models.User

	// ユーザーが既に存在するか確認
	result := config.DB.Where("google_id = ?", googleID).First(&user)

	if result.Error != nil {
		if result.Error != gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("failed to check user: %w", result.Error)
		}
		// 新規ユーザーの登録
		user = models.User{
			ID:               uuid.New().String(),
			GoogleID:         googleID,
			Email:            email,
			Role:             "user",
			RegistrationDate: time.Now(),
		}
		if err := config.DB.Create(&user).Error; err != nil {
			return nil, fmt.Errorf("failed to create user: %w", err)
		}
	}

	// 既存の有効なセッションを確認
	var existingSession models.Session
	if err := config.DB.Where("user_id = ? AND expires_at > ?", user.ID, time.Now()).First(&existingSession).Error; err == nil {
		// 有効なセッションが存在する場合は延長
		existingSession.ExpiresAt = time.Now().Add(24 * time.Hour)
		if err := config.DB.Save(&existingSession).Error; err != nil {
			return nil, fmt.Errorf("failed to update session: %w", err)
		}
		return &existingSession, nil
	}

	// 新しいセッションIDを生成
	session := models.Session{
		ID:        uuid.New().String(),
		UserID:    user.ID,
		SessionID: uuid.New().String(),
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	if err := config.DB.Create(&session).Error; err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	return &session, nil
}

// GetUserInfo ユーザー情報を取得
func (us *UserService) GetUserInfo(googleID string) (*models.UserInfo, error) {
	if googleID == "" {
		return nil, errors.New("googleID is required")
	}

	var user models.User
	if err := config.DB.Where("google_id = ?", googleID).First(&user).Error; err != nil {
		return nil, us.handleDBError(err)
	}

	return &models.UserInfo{
		UserID:           user.ID,
		Email:            user.Email,
		Role:             user.Role,
		RegistrationDate: user.RegistrationDate,
	}, nil
}

// GetUserByID ユーザーIDからユーザー情報を取得
func (us *UserService) GetUserByID(userID string) (*models.User, error) {
	if userID == "" {
		return nil, errors.New("userID is required")
	}

	var user models.User
	if err := config.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, us.handleDBError(err)
	}

	return &user, nil
}

// Logout ログアウト処理
func (us *UserService) Logout(sessionID string) error {
	if sessionID == "" {
		return errors.New("sessionID is required")
	}

	result := config.DB.Where("session_id = ?", sessionID).Delete(&models.Session{})
	if result.Error != nil {
		return fmt.Errorf("failed to logout: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return errors.New("session not found")
	}

	return nil
}

// handleDBError DB エラーを統一フォーマットで処理
func (us *UserService) handleDBError(err error) error {
	if err == gorm.ErrRecordNotFound {
		return errors.New("user not found")
	}
	return fmt.Errorf("database error: %w", err)
}

// DeleteUser ユーザーを削除（退会）
func (us *UserService) DeleteUser(googleID string) error {
	if googleID == "" {
		return errors.New("googleID is required")
	}

	// トランザクション処理
	return config.DB.Transaction(func(tx *gorm.DB) error {
		var user models.User
		if err := tx.Where("google_id = ?", googleID).First(&user).Error; err != nil {
			return us.handleDBError(err)
		}

		// 関連するセッションを削除
		if err := tx.Where("user_id = ?", user.ID).Delete(&models.Session{}).Error; err != nil {
			return fmt.Errorf("failed to delete sessions: %w", err)
		}

		// ユーザーを削除（ソフトデリート）
		if err := tx.Delete(&user).Error; err != nil {
			return fmt.Errorf("failed to delete user: %w", err)
		}

		return nil
	})
}
