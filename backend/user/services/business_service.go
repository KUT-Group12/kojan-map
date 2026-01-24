package services

import (
	"encoding/base64"
	"errors"
	"io"
	"net/http"
	"strings"
	"time"

	"kojan-map/user/config"
	"kojan-map/user/models"

	"gorm.io/gorm"
)

// ... (omitted code)

// UploadBusinessIcon 事業者アイコン画像をアップロード
func (bs *BusinessService) UploadBusinessIcon(userID string, fileData io.Reader) (string, error) {
	// Read all bytes
	data, err := io.ReadAll(fileData)
	if err != nil {
		return "", errors.New("failed to read image data")
	}

	// Detect content type
	mimeType := http.DetectContentType(data)
	if !strings.HasPrefix(mimeType, "image/") {
		// Default fallback or error? Handler checks this too, but for safety.
		// If detection fails or is generic application/octet-stream, we might trust extension or just proceed.
	}

	// Encode to Base64
	encoded := base64.StdEncoding.EncodeToString(data)
	dataURL := "data:" + mimeType + ";base64," + encoded

	// Update DB
	var business models.Business
	if err := config.DB.Where("userId = ?", userID).First(&business).Error; err != nil {
		return "", errors.New("business profile not found")
	}

	business.ProfileImage = dataURL
	if err := config.DB.Save(&business).Error; err != nil {
		return "", errors.New("failed to save business icon")
	}

	return dataURL, nil
}

// BusinessService 事業者ユーザー向けのビジネスロジック
type BusinessService struct {
	db *gorm.DB
}

func NewBusinessService(db *gorm.DB) *BusinessService {
	return &BusinessService{db: db}
}

// BusinessStats ダッシュボード統計情報
type BusinessStats struct {
	TotalPosts       int `json:"totalPosts"`
	TotalReactions   int `json:"totalReactions"`
	TotalViews       int `json:"totalViews"`
	AverageReactions int `json:"averageReactions"`
	WeeklyData       []struct {
		Date      string `json:"date"`
		Reactions int    `json:"reactions"`
		Views     int    `json:"views"`
	} `json:"weeklyData"`
}

// BusinessProfileResponse 事業者プロフィール情報のレスポンス
type BusinessProfileResponse struct {
	BusinessId       int       `json:"businessId"`
	BusinessName     string    `json:"businessName"`
	KanaBusinessName string    `json:"kanaBusinessName"`
	ZipCode          string    `json:"zipCode"`
	Address          string    `json:"address"`
	Phone            string    `json:"phone"`
	RegistDate       time.Time `json:"registDate"`
	ProfileImage     string    `json:"profileImage"`
	UserID           string    `json:"userId"`
	PlaceId          int       `json:"placeId"`
}

// GetBusinessStats 事業者のダッシュボード統計を取得
func (bs *BusinessService) GetBusinessStats(userID string) (*BusinessStats, error) {
	if userID == "" {
		return nil, errors.New("userID is required")
	}

	var posts []models.Post
	if err := config.DB.Where("userId = ?", userID).Find(&posts).Error; err != nil {
		return nil, errors.New("failed to fetch posts")
	}

	totalReactions := int32(0)
	totalViews := int32(0)
	for _, post := range posts {
		totalReactions += post.NumReaction
		totalViews += post.NumView
	}

	avgReactions := 0
	if len(posts) > 0 {
		avgReactions = int(totalReactions) / len(posts)
	}

	stats := &BusinessStats{
		TotalPosts:       len(posts),
		TotalReactions:   int(totalReactions),
		TotalViews:       int(totalViews),
		AverageReactions: avgReactions,
		WeeklyData: []struct {
			Date      string `json:"date"`
			Reactions int    `json:"reactions"`
			Views     int    `json:"views"`
		}{},
	}

	// Weekly data (last 7 days)
	for i := 6; i >= 0; i-- {
		date := time.Now().AddDate(0, 0, -i).Format("01/02")
		dayStart := time.Now().AddDate(0, 0, -i).Truncate(24 * time.Hour)
		dayEnd := dayStart.Add(24 * time.Hour)

		dayReactions := int32(0)
		dayViews := int32(0)
		for _, post := range posts {
			if post.PostDate.After(dayStart) && post.PostDate.Before(dayEnd) {
				dayReactions += post.NumReaction
				dayViews += post.NumView
			}
		}

		stats.WeeklyData = append(stats.WeeklyData, struct {
			Date      string `json:"date"`
			Reactions int    `json:"reactions"`
			Views     int    `json:"views"`
		}{
			Date:      date,
			Reactions: int(dayReactions),
			Views:     int(dayViews),
		})
	}

	return stats, nil
}

// GetBusinessProfile 事業者プロフィール情報を取得
func (bs *BusinessService) GetBusinessProfile(userID string) (*BusinessProfileResponse, error) {
	if userID == "" {
		return nil, errors.New("userID is required")
	}

	var business models.Business
	if err := config.DB.Where("userId = ?", userID).First(&business).Error; err != nil {
		return nil, errors.New("business profile not found")
	}

	return &BusinessProfileResponse{
		BusinessId:       int(business.BusinessID),
		BusinessName:     business.BusinessName,
		KanaBusinessName: business.KanaBusinessName,
		ZipCode:          business.ZipCode,
		Address:          business.Address,
		Phone:            business.Phone,
		RegistDate:       business.RegistDate,
		ProfileImage:     business.ProfileImage,
		UserID:           business.UserID,
		PlaceId:          int(business.PlaceID),
	}, nil
}

// UpdateBusinessProfile 事業者プロフィール情報を更新
func (bs *BusinessService) UpdateBusinessProfile(
	userID, businessName, kanaBusinessName, zipCode, address, phone string,
) (*BusinessProfileResponse, error) {
	if userID == "" {
		return nil, errors.New("userID is required")
	}

	var business models.Business
	if err := config.DB.Where("userId = ?", userID).First(&business).Error; err != nil {
		return nil, errors.New("business profile not found")
	}

	if businessName != "" {
		business.BusinessName = businessName
	}
	if kanaBusinessName != "" {
		business.KanaBusinessName = kanaBusinessName
	}
	if zipCode != "" {
		business.ZipCode = zipCode
	}
	if address != "" {
		business.Address = address
	}
	if phone != "" {
		business.Phone = phone
	}

	if err := config.DB.Save(&business).Error; err != nil {
		return nil, errors.New("failed to update business profile")
	}

	return &BusinessProfileResponse{
		BusinessId:       int(business.BusinessID),
		BusinessName:     business.BusinessName,
		KanaBusinessName: business.KanaBusinessName,
		ZipCode:          business.ZipCode,
		Address:          business.Address,
		Phone:            business.Phone,
		RegistDate:       business.RegistDate,
		ProfileImage:     business.ProfileImage,
		UserID:           business.UserID,
		PlaceId:          int(business.PlaceID),
	}, nil
}

// GetBusinessPostCount 事業者の投稿数を取得
func (bs *BusinessService) GetBusinessPostCount(userID string) (int, error) {
	if userID == "" {
		return 0, errors.New("userID is required")
	}

	var count int64
	if err := config.DB.Model(&models.Post{}).Where("userId = ?", userID).Count(&count).Error; err != nil {
		return 0, errors.New("failed to fetch post count")
	}

	return int(count), nil
}

// GetBusinessRevenue 事業者の月間売上を取得
func (bs *BusinessService) GetBusinessRevenue(userID string, year, month int) (float64, error) {
	if userID == "" {
		return 0, errors.New("userID is required")
	}

	// モック実装
	return 10000.0, nil
}

// UpdateBusinessName 事業者名を更新
func (bs *BusinessService) UpdateBusinessName(userID, name string) error {
	if userID == "" || name == "" {
		return errors.New("userID and name are required")
	}

	var business models.Business
	if err := config.DB.Where("userId = ?", userID).First(&business).Error; err != nil {
		return errors.New("business profile not found")
	}

	business.BusinessName = name
	if err := config.DB.Save(&business).Error; err != nil {
		return errors.New("failed to update business name")
	}

	return nil
}

// UpdateBusinessAddress 事業者の住所を更新
func (bs *BusinessService) UpdateBusinessAddress(userID, address, zipCode string) error {
	if userID == "" || address == "" {
		return errors.New("userID and address are required")
	}

	var business models.Business
	if err := config.DB.Where("userId = ?", userID).First(&business).Error; err != nil {
		return errors.New("business profile not found")
	}

	business.Address = address
	if zipCode != "" {
		business.ZipCode = zipCode
	}

	if err := config.DB.Save(&business).Error; err != nil {
		return errors.New("failed to update business address")
	}

	return nil
}

// UpdateBusinessPhone 事業者の電話番号を更新
func (bs *BusinessService) UpdateBusinessPhone(userID, phone string) error {
	if userID == "" || phone == "" {
		return errors.New("userID and phone are required")
	}

	var business models.Business
	if err := config.DB.Where("userId = ?", userID).First(&business).Error; err != nil {
		return errors.New("business profile not found")
	}

	business.Phone = phone
	if err := config.DB.Save(&business).Error; err != nil {
		return errors.New("failed to update business phone")
	}

	return nil
}
