package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/business/internal/domain"
	"kojan-map/business/internal/service"
	"kojan-map/business/pkg/response"
)

// BlockHandler handles block-related endpoints.
type BlockHandler struct {
	blockService service.BlockService
}

// NewBlockHandler creates a new block handler.
func NewBlockHandler(blockService service.BlockService) *BlockHandler {
	return &BlockHandler{
		blockService: blockService,
	}
}

// CreateBlock handles POST /api/block (M1-9-2).
// SSOT Endpoint: POST /api/block
func (h *BlockHandler) CreateBlock(c *gin.Context) {
	var req domain.CreateBlockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendBadRequest(c, err.Error())
		return
	}

	// TODO: Extract blockerID from authenticated session
	blockerID := "placeholder-user-id"

	err := h.blockService.Block(c.Request.Context(), blockerID, req.BlockedGoogleID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusCreated, gin.H{
		"message": "user blocked successfully",
	})
}

// DeleteBlock handles DELETE /api/block (M1-10-2).
// SSOT Endpoint: DELETE /api/block
func (h *BlockHandler) DeleteBlock(c *gin.Context) {
	var req domain.DeleteBlockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendBadRequest(c, err.Error())
		return
	}

	// TODO: Extract blockerID from authenticated session
	blockerID := "placeholder-user-id"

	err := h.blockService.Unblock(c.Request.Context(), blockerID, req.BlockedGoogleID)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusOK, gin.H{
		"message": "user unblocked successfully",
	})
}

// ReportHandler handles report-related endpoints.
type ReportHandler struct {
	reportService service.ReportService
}

// NewReportHandler creates a new report handler.
func NewReportHandler(reportService service.ReportService) *ReportHandler {
	return &ReportHandler{
		reportService: reportService,
	}
}

// CreateReport handles POST /api/report (M1-12-2).
// SSOT Endpoint: POST /api/report
func (h *ReportHandler) CreateReport(c *gin.Context) {
	var req domain.CreateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendBadRequest(c, err.Error())
		return
	}

	// TODO: Extract reporterID from authenticated session
	reporterID := "placeholder-user-id"

	err := h.reportService.CreateReport(c.Request.Context(), reporterID, &req)
	if err != nil {
		c.Error(err)
		return
	}

	response.SendSuccess(c, http.StatusCreated, gin.H{
		"message": "report submitted successfully",
	})
}
