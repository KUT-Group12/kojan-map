package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"kojan-map/business/pkg/contextkeys"
	"kojan-map/business/pkg/response"
)

// BusinessRoleRequired はJWTクレームのroleがbusinessであることを要求します
func BusinessRoleRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, ok := contextkeys.GetRole(c.Request.Context())
		if !ok {
			response.SendProblem(c, http.StatusUnauthorized, "unauthorized", "role not found in context", c.Request.URL.Path)
			c.Abort()
			return
		}

		if role != "business" {
			response.SendProblem(c, http.StatusForbidden, "forbidden", "business role required", c.Request.URL.Path)
			c.Abort()
			return
		}

		c.Next()
	}
}
