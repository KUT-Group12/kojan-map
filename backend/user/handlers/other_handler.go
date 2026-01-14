package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/user/services"
)

// BlockHandler ブロック関連のハンドラー
type BlockHandler struct {
	blockService *services.BlockService
}

// NewBlockHandler ブロックハンドラーを初期化
func NewBlockHandler(blockService *services.BlockService) *BlockHandler {
	return &BlockHandler{blockService: blockService}
}

// BlockUser ユーザーをブロック
// POST /api/users/block
func (bh *BlockHandler) BlockUser(c *gin.Context) {
	var req struct {
		UserID    string `json:"userId" binding:"required"`
		BlockerID string `json:"blockerId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request format"})
		return
	}

	if err := bh.blockService.BlockUser(req.UserID, req.BlockerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "user blocked successfully",
	})
}

// UnblockUser ブロック解除
// DELETE /api/users/block
func (bh *BlockHandler) UnblockUser(c *gin.Context) {
	var req struct {
		UserID    string `json:"userId" binding:"required"`
		BlockerID string `json:"blockerId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := bh.blockService.UnblockUser(req.UserID, req.BlockerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "user unblocked"})
}

// GetBlockList ブロックリストを取得
// GET /api/users/block/list
func (bh *BlockHandler) GetBlockList(c *gin.Context) {
	userID := c.Query("googleId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "googleId required"})
		return
	}

	blocks, err := bh.blockService.GetBlockList(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"blocks": blocks})
}

// ReportHandler 通報関連のハンドラー
type ReportHandler struct {
	reportService *services.ReportService
}

// NewReportHandler 通報ハンドラーを初期化
func NewReportHandler(reportService *services.ReportService) *ReportHandler {
	return &ReportHandler{reportService: reportService}
}

// CreateReport 通報を作成
// POST /api/report
func (rh *ReportHandler) CreateReport(c *gin.Context) {
	var req struct {
		UserID string `json:"userId" binding:"required"`
		PostID int    `json:"postId" binding:"required"`
		Reason string `json:"reason" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := rh.reportService.CreateReport(req.UserID, req.PostID, req.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "report created"})
}

// ContactHandler 問い合わせ関連のハンドラー
type ContactHandler struct {
	contactService *services.ContactService
}

// NewContactHandler 問い合わせハンドラーを初期化
func NewContactHandler(contactService *services.ContactService) *ContactHandler {
	return &ContactHandler{contactService: contactService}
}

// CreateContact 問い合わせを作成
// POST /api/contact/validate
func (ch *ContactHandler) CreateContact(c *gin.Context) {
	var req struct {
		UserID  string `json:"userId"`
		Subject string `json:"subject" binding:"required"`
		Text    string `json:"text" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ch.contactService.CreateContact(req.UserID, req.Subject, req.Text); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "contact created"})
}

// BusinessApplicationHandler 事業者申請関連のハンドラー
type BusinessApplicationHandler struct {
	businessApplicationService *services.BusinessApplicationService
}

// NewBusinessApplicationHandler 事業者申請ハンドラーを初期化
func NewBusinessApplicationHandler(businessApplicationService *services.BusinessApplicationService) *BusinessApplicationHandler {
	return &BusinessApplicationHandler{businessApplicationService: businessApplicationService}
}

// CreateBusinessApplication 事業者申請を作成
// POST /api/business/application
func (bah *BusinessApplicationHandler) CreateBusinessApplication(c *gin.Context) {
	var req struct {
		UserID           string `json:"userId" binding:"required"`
		BusinessName     string `json:"businessName" binding:"required"`
		KanaBusinessName string `json:"kanaBusinessName" binding:"required"`
		ZipCode          int    `json:"zipCode" binding:"required"`
		Address          string `json:"address" binding:"required"`
		Phone            int    `json:"phone" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := bah.businessApplicationService.CreateBusinessApplication(
		req.UserID,
		req.BusinessName,
		req.KanaBusinessName,
		req.Address,
		req.ZipCode,
		req.Phone,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "business application created"})
}
