package services

import (
	"encoding/base64"
	"errors"
	"io"
	"time"

	"kojan-map/user/config"
	"kojan-map/user/models"
)

// BusinessService 事業者ユーザー向けのビジネスロジック
type BusinessService struct{}

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
	BusinessID       int    `json:"businessId"`
	BusinessName     string `json:"businessName"`
	KanaBusinessName string `json:"kanaBusinessName"`
	ZipCode          string `json:"zipCode"`
	Address          string `json:"address"`
	Phone            string `json:"phone"`
	ProfileImage     string `json:"profileImage,omitempty"`
	UserID           string `json:"userId"`
	PlaceID          int    `json:"placeId,omitempty"`
	RegistDate       string `json:"registDate"`
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

	var app models.BusinessApplication
	if err := config.DB.Where("userId = ?", userID).First(&app).Error; err != nil {
		return nil, errors.New("business application not found")
	}

	return &BusinessProfileResponse{
		BusinessID:       int(app.ID),
		BusinessName:     app.BusinessName,
		KanaBusinessName: app.KanaBusinessName,
		ZipCode:          app.ZipCode,
		Address:          app.Address,
		Phone:            app.Phone,
		UserID:           app.UserID,
		PlaceID:          int(app.PlaceID),
		RegistDate:       app.RegistDate.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

// UpdateBusinessProfile 事業者プロフィール情報を更新
func (bs *BusinessService) UpdateBusinessProfile(
	userID, businessName, kanaBusinessName, zipCode, address, phone string,
) (*BusinessProfileResponse, error) {
	if userID == "" {
		return nil, errors.New("userID is required")
	}

	var app models.BusinessApplication
	if err := config.DB.Where("userId = ?", userID).First(&app).Error; err != nil {
		return nil, errors.New("business application not found")
	}

	if businessName != "" {
		app.BusinessName = businessName
	}
	if kanaBusinessName != "" {
		app.KanaBusinessName = kanaBusinessName
	}
	if zipCode != "" {
		app.ZipCode = zipCode
	}
	if address != "" {
		app.Address = address
	}
	if phone != "" {
		app.Phone = phone
	}

	if err := config.DB.Save(&app).Error; err != nil {
		return nil, errors.New("failed to update business profile")
	}

	return &BusinessProfileResponse{
		BusinessID:       int(app.ID),
		BusinessName:     app.BusinessName,
		KanaBusinessName: app.KanaBusinessName,
		ZipCode:          app.ZipCode,
		Address:          app.Address,
		Phone:            app.Phone,
		UserID:           app.UserID,
		PlaceID:          int(app.PlaceID),
		RegistDate:       app.RegistDate.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

// UploadBusinessIcon 事業者アイコン画像をアップロード
func (bs *BusinessService) UploadBusinessIcon(userID string, fileData io.Reader) (string, error) {
	if userID == "" {
		return "", errors.New("userID is required")
	}

	// ファイルをバイト列に変換
	imageBytes, err := io.ReadAll(fileData)
	if err != nil {
		return "", errors.New("failed to read file")
	}

	var app models.BusinessApplication
	if err := config.DB.Where("userId = ?", userID).First(&app).Error; err != nil {
		return "", errors.New("business application not found")
	}

	app.ProfileImage = imageBytes
	if err := config.DB.Save(&app).Error; err != nil {
		return "", errors.New("failed to save profile image")
	}

	// Base64エンコードして返す
	encodedImage := base64.StdEncoding.EncodeToString(imageBytes)
	return "data:image/jpeg;base64," + encodedImage, nil
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

	// モック実装（実装によっては支払い情報テーブルを参照）
	// 実際のビジネスロジックに応じて修正必要
	return 10000.0, nil
}

// UpdateBusinessName 事業者名を更新
func (bs *BusinessService) UpdateBusinessName(userID, businessName string) error {
	if userID == "" || businessName == "" {
		return errors.New("userID and businessName are required")
	}

	var app models.BusinessApplication
	if err := config.DB.Where("userId = ?", userID).First(&app).Error; err != nil {
		return errors.New("business application not found")
	}

	app.BusinessName = businessName
	if err := config.DB.Save(&app).Error; err != nil {
		return errors.New("failed to update business name")
	}

	return nil
}

// UpdateBusinessAddress 事業者の住所を更新
func (bs *BusinessService) UpdateBusinessAddress(userID, address, zipCode string) error {
	if userID == "" || address == "" {
		return errors.New("userID and address are required")
	}

	var app models.BusinessApplication
	if err := config.DB.Where("userId = ?", userID).First(&app).Error; err != nil {
		return errors.New("business application not found")
	}

	app.Address = address
	app.ZipCode = zipCode
	if err := config.DB.Save(&app).Error; err != nil {
		return errors.New("failed to update business address")
	}

	return nil
}

// UpdateBusinessPhone 事業者の電話番号を更新
func (bs *BusinessService) UpdateBusinessPhone(userID, phone string) error {
	if userID == "" || phone == "" {
		return errors.New("userID and phone are required")
	}

	// 電話番号の保存方法は、BusinessApplication テーブルのスキーマに依存
	// 実装例：ユーザー情報を更新する、または別テーブルを使用

	return nil
}
