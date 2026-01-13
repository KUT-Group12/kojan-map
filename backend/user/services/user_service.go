package services

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"kojan-map/user/config"
	"kojan-map/user/models"
)

// UserService ユーザー関連のビジネスロジック
type UserService struct{}

// RegisterOrLogin Google認証でユーザーを登録またはログイン
func (us *UserService) RegisterOrLogin(googleID, email string) (*models.Session, error) {
	user := models.User{}

	// ユーザーが既に存在するか確認
	result := config.DB.Where("google_id = ?", googleID).First(&user)

	if result.Error != nil {
		// 新規ユーザーの登録
		user = models.User{
			ID:               uuid.New().String(),
			GoogleID:         googleID,
			Email:            email,
			Role:             "user",
			RegistrationDate: time.Now(),
		}

		if err := config.DB.Create(&user).Error; err != nil {
			return nil, err
		}
	}

	// セッションIDを生成
	session := models.Session{
		ID:        uuid.New().String(),
		UserID:    user.ID,
		SessionID: uuid.New().String(),
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	if err := config.DB.Create(&session).Error; err != nil {
		return nil, err
	}

	return &session, nil
}

// GetUserInfo ユーザー情報を取得
func (us *UserService) GetUserInfo(googleID string) (*models.UserInfo, error) {
	user := models.User{}

	if err := config.DB.Where("google_id = ?", googleID).First(&user).Error; err != nil {
		return nil, errors.New("user not found")
	}

	return &models.UserInfo{
		Email:            user.Email,
		Role:             user.Role,
		RegistrationDate: user.RegistrationDate,
	}, nil
}

// Logout ログアウト処理
func (us *UserService) Logout(sessionID string) error {
	return config.DB.Where("session_id = ?", sessionID).Delete(&models.Session{}).Error
}

// DeleteUser ユーザーを削除（退会）
func (us *UserService) DeleteUser(googleID string) error {
	return config.DB.Where("google_id = ?", googleID).Delete(&models.User{}).Error
}
