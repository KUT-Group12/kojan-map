package validate

import (
	"bytes"
	"fmt"
)

// ImageValidator provides image validation utilities
type ImageValidator struct{}

// NewImageValidator creates a new image validator
func NewImageValidator() *ImageValidator {
	return &ImageValidator{}
}

// ValidateMimeType checks if the image data is PNG or JPEG
// Returns error if the image type is not supported or data is too small
func (v *ImageValidator) ValidateMimeType(data []byte) error {
	if len(data) < 4 {
		return fmt.Errorf("image data too small")
	}

	// Check PNG magic number: 89 50 4E 47 (PNG)
	if len(data) >= 8 && bytes.Equal(data[:8], []byte{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}) {
		return nil
	}

	// Check JPEG magic number: FF D8 FF
	if len(data) >= 3 && data[0] == 0xFF && data[1] == 0xD8 && data[2] == 0xFF {
		return nil
	}

	return fmt.Errorf("image must be PNG or JPEG format")
}

// ValidateImageSize checks if the image size is within the limit
// maxSizeBytes: maximum allowed file size in bytes
func (v *ImageValidator) ValidateImageSize(sizeBytes int64, maxSizeBytes int64) error {
	if sizeBytes > maxSizeBytes {
		return fmt.Errorf("image size (%d bytes) exceeds maximum allowed size (%d bytes)", sizeBytes, maxSizeBytes)
	}
	return nil
}

// ValidateImage performs both mime type and size validation
func (v *ImageValidator) ValidateImage(data []byte, sizeBytes int64, maxSizeBytes int64) error {
	if err := v.ValidateMimeType(data); err != nil {
		return err
	}
	if err := v.ValidateImageSize(sizeBytes, maxSizeBytes); err != nil {
		return err
	}
	return nil
}
