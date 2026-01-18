package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/contextkeys"
	"kojan-map/business/pkg/response"
)

// BlockHandler はブロック関連のエンドポイントを処理するハンドラーです。
type BlockHandler struct {
	blockService service.BlockService
}

// NewBlockHandler は新しいブロックハンドラーを作成します。
func NewBlockHandler(blockService service.BlockService) *BlockHandler {
	return &BlockHandler{
		blockService: blockService,
	}
}

// CreateBlock は POST /api/block (M1-9-2) を処理します。
func (h *BlockHandler) CreateBlock(c *gin.Context) {
	var req domain.CreateBlockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", err.Error(), c.Request.URL.Path)
		return
	}

	// Extract blockerID from authenticated context
	blockerID, ok := contextkeys.GetUserID(c.Request.Context())
	if !ok {
		response.SendProblem(c, http.StatusUnauthorized, "unauthorized", "user ID not found in context", c.Request.URL.Path)
		return
	}

	err := h.blockService.Block(c.Request.Context(), blockerID, req.BlockedGoogleID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusCreated, gin.H{
		"message": "user blocked successfully",
	})
}

// DeleteBlock は DELETE /api/block (M1-10-2) を処理します。
func (h *BlockHandler) DeleteBlock(c *gin.Context) {
	var req domain.DeleteBlockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", err.Error(), c.Request.URL.Path)
		return
	}

	// Extract blockerID from authenticated context
	blockerID, ok := contextkeys.GetUserID(c.Request.Context())
	if !ok {
		response.SendProblem(c, http.StatusUnauthorized, "unauthorized", "user ID not found in context", c.Request.URL.Path)
		return
	}

	err := h.blockService.Unblock(c.Request.Context(), blockerID, req.BlockedGoogleID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusOK, gin.H{
		"message": "user unblocked successfully",
	})
}

// ReportHandler は通報関連のエンドポイントを処理するハンドラーです。
type ReportHandler struct {
	reportService service.ReportService
}

// NewReportHandler は新しい通報ハンドラーを作成します。
func NewReportHandler(reportService service.ReportService) *ReportHandler {
	return &ReportHandler{
		reportService: reportService,
	}
}

// CreateReport は POST /api/report (M1-12-2) を処理します。
func (h *ReportHandler) CreateReport(c *gin.Context) {
	var req domain.CreateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendProblem(c, http.StatusBadRequest, "bad-request", err.Error(), c.Request.URL.Path)
		return
	}

	// Extract reporterID from authenticated context
	reporterID, ok := contextkeys.GetUserID(c.Request.Context())
	if !ok {
		response.SendProblem(c, http.StatusUnauthorized, "unauthorized", "user ID not found in context", c.Request.URL.Path)
		return
	}

	err := h.reportService.CreateReport(c.Request.Context(), reporterID, &req)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusCreated, gin.H{
		"message": "report submitted successfully",
	})
}
