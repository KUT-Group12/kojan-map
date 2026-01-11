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

// SendSuccess は成功レスポンスを送信
func SendSuccess(c *gin.Context, statusCode int, data interface{}) {
	if data == nil {
		c.JSON(statusCode, gin.H{})
		return
	}
	c.JSON(statusCode, data)
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
	err := errors.NewAPIError(errors.ErrInvalidInput, message)
	SendError(c, err)
}

// SendUnauthorized は401 Unauthorizedレスポンスを送信
func SendUnauthorized(c *gin.Context, message string) {
	err := errors.NewAPIError(errors.ErrUnauthorized, message)
	SendError(c, err)
}

// SendNotFound は404 Not Foundレスポンスを送信
func SendNotFound(c *gin.Context, message string) {
	err := errors.NewAPIError(errors.ErrNotFound, message)
	SendError(c, err)
}

// SendInternalServerError は500 Internal Server Errorレスポンスを送信
func SendInternalServerError(c *gin.Context, message string) {
	err := errors.NewAPIError(errors.ErrInternalServer, message)
	SendError(c, err)
}
