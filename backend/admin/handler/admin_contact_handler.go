package handler

import (
	"net/http"
	"strconv"

	"kojan-map/admin/service"

	"github.com/gin-gonic/gin"
)

// AdminContactHandlerはお問い合わせに関しての機能を処理するためのハンドラです．
type AdminContactHandler struct {
	service *service.AdminContactService
}

// NewAdminContactHandlerは新しくAdminContactHandlerを作成するためのコンストラクタ関数です．
func NewAdminContactHandler(s *service.AdminContactService) *AdminContactHandler {
	return &AdminContactHandler{service: s}
}

// GetInquiriesはお問い合わせ情報を取得します．
// Method = GET,  Path = /internal/asks
// Response =
// 200 OK: {"asks": []Inquiry}
// 500 Internal Server Error: {"error": string}
func (h *AdminContactHandler) GetInquiries(c *gin.Context) {
	asks, err := h.service.GetInquiries()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"asks": asks})
}

// ApproveInquiryはお問い合わせを承認する機能です．
// Method = POST, Path = /internal/requests/:requestId/approve
// requestId(path) = お問い合わせID(整数)
// Response =
// 200 OK: {"success": true}
// 400 Bad Request
func (h *AdminContactHandler) ApproveInquiry(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("requestId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request ID"})
		return
	}

	err = h.service.ApproveInquiry(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// RejectInquiryはお問い合わせを却下する機能です．
// Method = POST, path = /internal/requests/:requestId/reject
// Response =
// 200 OK: {"success": true}
// 400 Bad Request
func (h *AdminContactHandler) RejectInquiry(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("requestId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request ID"})
		return
	}

	err = h.service.RejectInquiry(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
