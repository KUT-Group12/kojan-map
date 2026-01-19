package handlers

import (
	"net/http"
	"strconv"

	"kojan-map/user/services"

	"github.com/gin-gonic/gin"
)

// BusinessHandler 事業者ユーザー向けのハンドラー
type BusinessHandler struct {
	businessService *services.BusinessService
	postService     *services.PostService
}

// NewBusinessHandler 新しいBusinessHandlerを作成
func NewBusinessHandler(
	businessService *services.BusinessService,
	postService *services.PostService,
) *BusinessHandler {
	return &BusinessHandler{
		businessService: businessService,
		postService:     postService,
	}
}

// GetBusinessStats 事業者のダッシュボード統計を取得
// GET /api/business/stats
func (h *BusinessHandler) GetBusinessStats(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	stats, err := h.businessService.GetBusinessStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetBusinessProfile 事業者プロフィール情報を取得
// GET /api/business/profile
func (h *BusinessHandler) GetBusinessProfile(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	profile, err := h.businessService.GetBusinessProfile(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// UpdateBusinessProfile 事業者プロフィール情報を更新
// PUT /api/business/profile
func (h *BusinessHandler) UpdateBusinessProfile(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		BusinessName     string `json:"businessName"`
		KanaBusinessName string `json:"kanaBusinessName"`
		ZipCode          int    `json:"zipCode"`
		Address          string `json:"address"`
		Phone            string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profile, err := h.businessService.UpdateBusinessProfile(userID, req.BusinessName, req.KanaBusinessName, req.ZipCode, req.Address, req.Phone)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// UploadBusinessIcon 事業者アイコン画像をアップロード
// POST /api/business/icon
func (h *BusinessHandler) UploadBusinessIcon(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	// ファイルサイズ制限（5MB）
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file size exceeds 5MB limit"})
		return
	}

	// ファイル形式チェック
	contentType := file.Header.Get("Content-Type")
	if contentType == "" || (contentType[:6] != "image/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file must be an image"})
		return
	}

	imageData, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read file"})
		return
	}
	defer func() {
		_ = imageData.Close() // nolint:errcheck
	}()

	profileImage, err := h.businessService.UploadBusinessIcon(userID, imageData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"profileImage": profileImage,
	})
}

// GetBusinessPostCount 事業者の投稿数を取得
// GET /api/business/posts/count
func (h *BusinessHandler) GetBusinessPostCount(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	count, err := h.businessService.GetBusinessPostCount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

// GetBusinessRevenue 事業者の月間売上を取得
// GET /api/business/revenue
func (h *BusinessHandler) GetBusinessRevenue(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	year, err := strconv.Atoi(c.Query("year"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "year parameter is required"})
		return
	}

	month, err := strconv.Atoi(c.Query("month"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "month parameter is required"})
		return
	}

	revenue, err := h.businessService.GetBusinessRevenue(userID, year, month)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"revenue":  revenue,
		"currency": "JPY",
	})
}

// UpdateBusinessName 事業者名を更新
// PUT /api/business/name
func (h *BusinessHandler) UpdateBusinessName(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		BusinessName string `json:"businessName" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.businessService.UpdateBusinessName(userID, req.BusinessName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// UpdateBusinessAddress 事業者の住所を更新
// PUT /api/business/address
func (h *BusinessHandler) UpdateBusinessAddress(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Address string `json:"address" binding:"required"`
		ZipCode int    `json:"zipCode" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.businessService.UpdateBusinessAddress(userID, req.Address, req.ZipCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// UpdateBusinessPhone 事業者の電話番号を更新
// PUT /api/business/phone
func (h *BusinessHandler) UpdateBusinessPhone(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Phone string `json:"phone" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.businessService.UpdateBusinessPhone(userID, req.Phone)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
