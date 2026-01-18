package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/business/pkg/errors"
)

// SuccessResponse はサクセスレスポンス
type SuccessResponse struct {
	Data interface{} `json:"data,omitempty"`
}

// ProblemDetail はRFC 7807準拠のエラーレスポンス
type ProblemDetail struct {
	Type     string `json:"type"`
	Title    string `json:"title"`
	Status   int    `json:"status"`
	Detail   string `json:"detail"`
	Instance string `json:"instance"`
}

// SendSuccess は成功レスポンスを送信
func SendSuccess(c *gin.Context, statusCode int, data interface{}) {
	if data == nil {
		c.JSON(statusCode, gin.H{})
		return
	}
	c.JSON(statusCode, data)
}

// SendProblem はRFC 7807準拠のエラーレスポンスを送信
func SendProblem(c *gin.Context, status int, title, detail, instance string) {
	problem := ProblemDetail{
		Type:     "https://api.kojanmap.example.com/errors/" + title,
		Title:    title,
		Status:   status,
		Detail:   detail,
		Instance: instance,
	}
	c.Header("Content-Type", "application/problem+json")
	c.JSON(status, problem)
}

// SendError はエラーレスポンスを送信
func SendError(c *gin.Context, err *errors.APIError) {
	c.JSON(err.StatusCode, gin.H{
		"errorCode": err.ErrorCode,
		"message":   err.Message,
	})
}

// SendCreated は201 Createdレスポンスを送信
func SendCreated(c *gin.Context, data interface{}) {
	SendSuccess(c, http.StatusCreated, data)
}

// SendOK は200 OKレスポンスを送信
func SendOK(c *gin.Context, data interface{}) {
	SendSuccess(c, http.StatusOK, data)
}

// SendNoContent は204 No Contentレスポンスを送信
func SendNoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// SendBadRequest は400 Bad Requestレスポンスを送信
func SendBadRequest(c *gin.Context, message string) {
	SendProblem(c, http.StatusBadRequest, "bad-request", message, c.Request.URL.Path)
}

// SendUnauthorized は401 Unauthorizedレスポンスを送信
func SendUnauthorized(c *gin.Context, message string) {
	SendProblem(c, http.StatusUnauthorized, "unauthorized", message, c.Request.URL.Path)
}

// SendForbidden は403 Forbiddenレスポンスを送信
func SendForbidden(c *gin.Context, message string) {
	SendProblem(c, http.StatusForbidden, "forbidden", message, c.Request.URL.Path)
}

// SendNotFound は404 Not Foundレスポンスを送信
func SendNotFound(c *gin.Context, message string) {
	SendProblem(c, http.StatusNotFound, "not-found", message, c.Request.URL.Path)
}

// SendInternalServerError は500 Internal Server Errorレスポンスを送信
func SendInternalServerError(c *gin.Context, message string) {
	SendProblem(c, http.StatusInternalServerError, "internal-server-error", message, c.Request.URL.Path)
}
