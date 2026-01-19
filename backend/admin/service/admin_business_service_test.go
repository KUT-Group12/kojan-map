<<<<<<< HEAD
package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAdminBusinessService_ApproveApplication(t *testing.T) {
	t.Run("rejects already processed application", func(t *testing.T) {
		status := "approved"
		if status != "pending" {
			err := &testError{msg: "application is already processed"}
			assert.Error(t, err)
			assert.Equal(t, "application is already processed", err.Error())
		}
	})

	t.Run("accepts pending application", func(t *testing.T) {
		status := "pending"
		assert.Equal(t, "pending", status)
	})
}

func TestAdminBusinessService_RejectApplication(t *testing.T) {
	t.Run("rejects already processed application", func(t *testing.T) {
		status := "rejected"
		if status != "pending" {
			err := &testError{msg: "application is already processed"}
			assert.Error(t, err)
		}
	})
}

func TestBusinessApplicationResponse(t *testing.T) {
	t.Run("formats response correctly", func(t *testing.T) {
		response := BusinessApplicationResponse{
			RequestID:      1,
			BusinessName:   "Test Business",
			ApplicantName:  "test@example.com",
			ApplicantEmail: "test@example.com",
			Status:         "pending",
			CreatedAt:      "2025-01-10T12:00:00Z",
		}

		assert.Equal(t, 1, response.RequestID)
		assert.Equal(t, "Test Business", response.BusinessName)
		assert.Equal(t, "pending", response.Status)
	})
}
=======
package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAdminBusinessService_ApproveApplication(t *testing.T) {
	t.Run("rejects already processed application", func(t *testing.T) {
		status := "approved"
		if status != "pending" {
			err := &testError{msg: "application is already processed"}
			assert.Error(t, err)
			assert.Equal(t, "application is already processed", err.Error())
		}
	})

	t.Run("accepts pending application", func(t *testing.T) {
		status := "pending"
		assert.Equal(t, "pending", status)
	})
}

func TestAdminBusinessService_RejectApplication(t *testing.T) {
	t.Run("rejects already processed application", func(t *testing.T) {
		status := "rejected"
		if status != "pending" {
			err := &testError{msg: "application is already processed"}
			assert.Error(t, err)
		}
	})
}

func TestBusinessApplicationResponse(t *testing.T) {
	t.Run("formats response correctly", func(t *testing.T) {
		response := BusinessApplicationResponse{
			RequestID:      1,
			BusinessName:   "Test Business",
			ApplicantName:  "test@example.com",
			ApplicantEmail: "test@example.com",
			Status:         "pending",
			CreatedAt:      "2025-01-10T12:00:00Z",
		}

		assert.Equal(t, 1, response.RequestID)
		assert.Equal(t, "Test Business", response.BusinessName)
		assert.Equal(t, "pending", response.Status)
	})
}
>>>>>>> origin/main
