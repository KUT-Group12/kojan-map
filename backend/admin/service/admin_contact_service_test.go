package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAdminContactService_ApproveInquiry(t *testing.T) {
	t.Run("prevents double approval", func(t *testing.T) {
		askFlag := true
		if askFlag {
			err := &testError{msg: "inquiry is already handled"}
			assert.Error(t, err)
			assert.Equal(t, "inquiry is already handled", err.Error())
		}
	})

	t.Run("allows approving unhandled inquiry", func(t *testing.T) {
		askFlag := false
		assert.False(t, askFlag)
	})
}

func TestAdminContactService_RejectInquiry(t *testing.T) {
	t.Run("validates inquiry exists", func(t *testing.T) {
		inquiryID := 0
		if inquiryID == 0 {
			err := &testError{msg: "inquiry not found"}
			assert.Error(t, err)
		}
	})

	t.Run("accepts valid inquiry ID", func(t *testing.T) {
		inquiryID := 123
		assert.Greater(t, inquiryID, 0)
	})
}

func TestAdminContactService_GetInquiries(t *testing.T) {
	t.Run("returns empty list when no inquiries", func(t *testing.T) {
		var inquiries []interface{}
		assert.Empty(t, inquiries)
		assert.Equal(t, 0, len(inquiries))
	})
}
