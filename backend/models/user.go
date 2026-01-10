package models

import (
	"time"
)

// Role represents user role enum
type Role string

const (
	RoleUser     Role = "user"
	RoleBusiness Role = "business"
	RoleAdmin    Role = "admin"
)

// User represents the 会員情報 table
type User struct {
	GoogleID         string    `gorm:"column:googleId;primaryKey;size:50" json:"googleId"`
	Gmail            string    `gorm:"column:gmail;not null;size:100" json:"gmail"`
	Role             Role      `gorm:"column:role;not null;type:enum('user','business','admin')" json:"role"`
	RegistrationDate time.Time `gorm:"column:registrationDate;not null" json:"registrationDate"`
	DeletedAt        *time.Time `gorm:"column:deletedAt" json:"deletedAt,omitempty"`
}

// TableName specifies the table name for User
func (User) TableName() string {
	return "users"
}
