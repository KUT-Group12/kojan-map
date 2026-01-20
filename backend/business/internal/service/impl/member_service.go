package impl

import (
	"context"
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/repository"
	"kojan-map/business/pkg/contextkeys"
	"kojan-map/business/pkg/errors"
)

// MemberServiceImpl はMemberServiceインターフェースを実装します。
type MemberServiceImpl struct {
	memberRepo repository.BusinessMemberRepo
	authRepo   repository.AuthRepo
}

// NewMemberServiceImpl は新しいメンバーサービスを作成します。
func NewMemberServiceImpl(memberRepo repository.BusinessMemberRepo, authRepo repository.AuthRepo) *MemberServiceImpl {
	return &MemberServiceImpl{
		memberRepo: memberRepo,
		authRepo:   authRepo,
	}
}

// GetBusinessDetails は事業者メンバーの詳細情報を取得します（M3-2-2）。
// 存在しないGoogle IDが指定された場合はエラーを返す
func (s *MemberServiceImpl) GetBusinessDetails(ctx context.Context, googleID string) (interface{}, error) {
	if googleID == "" {
		return nil, errors.NewAPIError(errors.ErrInvalidInput, "googleId is required")
	}

	member, err := s.memberRepo.GetByGoogleID(ctx, googleID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, fmt.Sprintf("business member not found: %v", err))
	}

	// メールアドレスのためにユーザー情報を取得
	user, err := s.authRepo.GetUserByID(ctx, googleID)
	if err != nil {
		return nil, errors.NewAPIError(errors.ErrNotFound, "user not found")
	}

	memberData, ok := member.(*domain.BusinessMember)
	if !ok || memberData == nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, "invalid business member type")
	}
	userData, ok := user.(*domain.User)
	if !ok || userData == nil {
		return nil, errors.NewAPIError(errors.ErrOperationFailed, "invalid user type")
	}

	// アイコン画像URLの生成（BLOBデータをbase64エンコードしてdata URIとして返す）
	var iconImageURL string
	if len(memberData.ProfileImage) > 0 {
		// 画像のMIMEタイプを検出
		contentType := http.DetectContentType(memberData.ProfileImage)
		if contentType == "image/png" || contentType == "image/jpeg" {
			imageBase64 := base64.StdEncoding.EncodeToString(memberData.ProfileImage)
			iconImageURL = fmt.Sprintf("data:%s;base64,%s", contentType, imageBase64)
		}
	}

	return &domain.BusinessMemberResponse{
		ID:           memberData.ID,
		BusinessName: memberData.BusinessName,
		Gmail:        userData.Gmail,
		RegistDate:   memberData.RegistDate.Format(time.RFC3339),
		IconImageURL: iconImageURL,
	}, nil
}

// UpdateBusinessName は事業者名を更新します（M3-4-2）。
// 事業者名の更新は永続ストレージに反映する、空文字や不正な形式のエラーとする
func (s *MemberServiceImpl) UpdateBusinessName(ctx context.Context, businessID int64, name string) error {
	if strings.TrimSpace(name) == "" || utf8.RuneCountInString(name) > 50 {
		return errors.NewAPIError(errors.ErrValidationFailed, "business name must be between 1 and 50 characters")
	}

	// 事業者の所有権チェック
	ctxBusinessID, ok := contextkeys.GetBusinessID(ctx)
	if !ok {
		return errors.NewAPIError(errors.ErrUnauthorized, "business ID not found in context")
	}

	if ctxBusinessID != businessID {
		return errors.NewAPIError(errors.ErrForbidden, "you are not authorized to update this business")
	}

	err := s.memberRepo.UpdateName(ctx, businessID, name)
	if err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to update business name: %v", err))
	}

	return nil
}

// UpdateBusinessIcon は事業者アイコンを更新します（M3-5-2）。
// 画像は PNG または JPEG のみ、5MB以下、ログイン済みかつ本人のみ更新可能
func (s *MemberServiceImpl) UpdateBusinessIcon(ctx context.Context, businessID int64, icon []byte) error {
	if len(icon) == 0 {
		return errors.NewAPIError(errors.ErrInvalidInput, "icon data is required")
	}

	if len(icon) > 5*1024*1024 { // 5MB
		return errors.NewAPIError(errors.ErrImageTooLarge, "image size must not exceed 5MB")
	}

	// 事業者の所有権チェック
	ctxBusinessID, ok := contextkeys.GetBusinessID(ctx)
	if !ok {
		return errors.NewAPIError(errors.ErrUnauthorized, "business ID not found in context")
	}

	if ctxBusinessID != businessID {
		return errors.NewAPIError(errors.ErrForbidden, "you are not authorized to update this business icon")
	}

	contentType := http.DetectContentType(icon)
	if contentType != "image/png" && contentType != "image/jpeg" {
		return errors.NewAPIError(errors.ErrInvalidInput, "icon must be PNG or JPEG")
	}

	err := s.memberRepo.UpdateIcon(ctx, businessID, icon)
	if err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to update business icon: %v", err))
	}

	return nil
}

// AnonymizeMember はメンバー情報を匿名化します（M3-3）。
// 識別可能な個人情報は復元不能な値に置き換える
func (s *MemberServiceImpl) AnonymizeMember(ctx context.Context, businessID int64) error {
	// 権限チェック: 管理者または本人のみ匿名化可能
	ctxBusinessID, ok := contextkeys.GetBusinessID(ctx)
	if !ok {
		return errors.NewAPIError(errors.ErrUnauthorized, "business ID not found in context")
	}

	role, _ := contextkeys.GetRole(ctx)
	// 本人または管理者権限を持つ場合のみ許可
	if ctxBusinessID != businessID && role != "admin" {
		return errors.NewAPIError(errors.ErrForbidden, "you are not authorized to anonymize this member")
	}

	err := s.memberRepo.Anonymize(ctx, businessID)
	if err != nil {
		return errors.NewAPIError(errors.ErrOperationFailed, fmt.Sprintf("failed to anonymize member: %v", err))
	}

	return nil
}
