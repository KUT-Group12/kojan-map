package handler

import (
	"net/http"
	"strconv"

	"kojan-map/admin/service"

	"github.com/gin-gonic/gin"
)

// AdminBusinessHandlerは，事業者に関してのリクエストを処理するハンドラです．
// 依存するサービス層のインスタンスを保持します．
type AdminBusinessHandler struct {
	service *service.AdminBusinessService
}

// AdminBusinessHandlerを新しく作成するためのコンストラクタ関数です．
// 引数 : s ビジネスロジックを担当するAdminBusinessHandlerへのポインタです．
func NewAdminBusinessHandler(s *service.AdminBusinessService) *AdminBusinessHandler {
	return &AdminBusinessHandler{service: s}
}

// GetApplicationsは未処理の事業者申請一覧を取得する機能です．
// Method : GET, path = /api/admin/request
// Response =
// 200 OK: { "applications": []Application}
// 500 Internal Server: {"error": string}
func (h *AdminBusinessHandler) GetApplications(c *gin.Context) {
	applications, err := h.service.GetApplications()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"applications": applications})
}

// ApproveApplicationは指定されたIDを持つ申請を承認します．
// Method = PUT Path = /api/applications/:id/approve
// id(path) : 申請ID(整数)
// Response =
// 200 OK: {"success": true}
// 400 Bad Request: ID不正 またはロジックエラー
func (h *AdminBusinessHandler) ApproveApplication(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid application ID"})
		return
	}

	err = h.service.ApproveApplication(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// RejextApplicationは指定されたIDを持つ申請を却下します．
// Method = PUT Path = /api/applications/:id/reject
// id(path) : 申請ID (整数)
// Response:
// 200 OK: {"success": true}
// 400 Bad Request: ID不正またはロジックエラー
func (h *AdminBusinessHandler) RejectApplication(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid application ID"})
		return
	}

	err = h.service.RejectApplication(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
