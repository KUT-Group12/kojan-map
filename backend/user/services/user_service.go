package services

import (
	"errors"
	"fmt"
	"time"

	shared "kojan-map/shared/models"
	"kojan-map/user/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserService ユーザー関連のビジネスロジック
type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

// CreateTestUser テスト用ユーザーを直接登録
func (us *UserService) CreateTestUser(googleID, gmail, role string) error {
	if googleID == "" || gmail == "" || role == "" {
		return errors.New("all fields are required")
	}
	user := models.User{
		GoogleID:         googleID,
		Gmail:            gmail,
		Role:             shared.Role(role),
		RegistrationDate: time.Now(),
	}
	return us.db.Create(&user).Error
}

// RegisterOrLogin Google認証でユーザーを登録またはログイン（role指定対応）
func (us *UserService) RegisterOrLogin(googleID, email, role string) (*models.Session, error) {
	if googleID == "" {
		return nil, errors.New("googleID is required")
	}
	if email == "" {
		return nil, errors.New("email is required")
	}
	if role == "" {
		role = string(shared.RoleUser)
	}

	// Validate Role
	r := shared.Role(role)
	if r != shared.RoleUser && r != shared.RoleBusiness && r != shared.RoleAdmin {
		return nil, errors.New("invalid role: must be user, business, or admin")
	}

	var user models.User

	// ユーザーが既に存在するか確認
	result := us.db.Where("googleId = ?", googleID).First(&user)

	if result.Error != nil {
		if result.Error != gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("failed to check user: %w", result.Error)
		}
		// 新規ユーザーの登録
		user = models.User{
			GoogleID:         googleID,
			Gmail:            email,
			Role:             r,
			RegistrationDate: time.Now(),
		}
		if err := us.db.Create(&user).Error; err != nil {
			return nil, fmt.Errorf("failed to create user: %w", err)
		}
	}

	// 既存の有効なセッションを確認
	var existingSession models.Session
	if err := us.db.Where("googleId = ? AND expiry > ?", user.GoogleID, time.Now()).First(&existingSession).Error; err == nil {
		// 有効なセッションが存在する場合は延長
		existingSession.Expiry = time.Now().Add(24 * time.Hour)
		if err := us.db.Save(&existingSession).Error; err != nil {
			return nil, fmt.Errorf("failed to update session: %w", err)
		}
		return &existingSession, nil
	}

	// 新しいセッションIDを生成
	session := models.Session{
		SessionID: uuid.New().String(),
		GoogleID:  user.GoogleID,
		Expiry:    time.Now().Add(24 * time.Hour),
	}

	if err := us.db.Create(&session).Error; err != nil {
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
	if err := us.db.Where("googleId = ?", googleID).First(&user).Error; err != nil {
		return nil, us.handleDBError(err)
	}

	return &models.UserInfo{
		UserID:           user.GoogleID,
		Gmail:            user.Gmail,
		Role:             string(user.Role),
		RegistrationDate: user.RegistrationDate,
	}, nil
}

// GetUserByID ユーザーIDからユーザー情報を取得
func (us *UserService) GetUserByID(userID string) (*models.User, error) {
	if userID == "" {
		return nil, errors.New("userID is required")
	}

	var user models.User
	if err := us.db.Where("googleId = ?", userID).First(&user).Error; err != nil {
		return nil, us.handleDBError(err)
	}

	return &user, nil
}

// Logout ログアウト処理
func (us *UserService) Logout(sessionID string) error {
	if sessionID == "" {
		return errors.New("sessionID is required")
	}

	// セッションの有効期限を現在時刻に更新（無効化）
	now := time.Now()
	result := us.db.Model(&models.Session{}).
		Where("sessionId = ?", sessionID).
		Update("expiry", now)

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
	return us.db.Transaction(func(tx *gorm.DB) error {
		var user models.User
		if err := tx.Where("googleId = ?", googleID).First(&user).Error; err != nil {
			return us.handleDBError(err)
		}

		// 関連するセッションを無効化
		now := time.Now()
		if err := tx.Model(&models.Session{}).
			Where("googleId = ?", googleID).
			Update("expiry", now).Error; err != nil {
			return fmt.Errorf("failed to revoke sessions: %w", err)
		}

		// ユーザーを削除
		if err := tx.Delete(&user).Error; err != nil {
			return fmt.Errorf("failed to delete user: %w", err)
		}

		return nil
	})
}
