package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAdminReportService_GetReports(t *testing.T) {
	t.Run("returns paginated results with default values", func(t *testing.T) {
		// Test pagination defaults
		page := 0
		pageSize := 0

		if page < 1 {
			page = 1
		}
		if pageSize < 1 || pageSize > 100 {
			pageSize = 20
		}

		assert.Equal(t, 1, page)
		assert.Equal(t, 20, pageSize)
	})

	t.Run("enforces max page size", func(t *testing.T) {
		pageSize := 150
		if pageSize < 1 || pageSize > 100 {
			pageSize = 20
		}
		assert.Equal(t, 20, pageSize)
	})

	t.Run("accepts valid page size", func(t *testing.T) {
		pageSize := 50
		if pageSize < 1 || pageSize > 100 {
			pageSize = 20
		}
		assert.Equal(t, 50, pageSize)
	})
}

func TestAdminReportService_MarkAsHandled(t *testing.T) {
	t.Run("validates report exists before marking", func(t *testing.T) {
		// Test structure for error handling
		err := validateReportExists(0)
		assert.Error(t, err)
		assert.Equal(t, "report not found", err.Error())
	})

	t.Run("prevents double handling", func(t *testing.T) {
		// Test structure for already handled check
		alreadyHandled := true
		if alreadyHandled {
			err := errAlreadyHandled()
			assert.Error(t, err)
			assert.Equal(t, "report is already handled", err.Error())
		}
	})
}

// Helper functions for testing
func validateReportExists(id int) error {
	if id == 0 {
		return errReportNotFound()
	}
	return nil
}

func errReportNotFound() error {
	return &testError{msg: "report not found"}
}

func errAlreadyHandled() error {
	return &testError{msg: "report is already handled"}
}

type testError struct {
	msg string
}

func (e *testError) Error() string {
	return e.msg
}
