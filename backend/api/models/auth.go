// api/models/auth.go
package models

import (
	"basai/domain/portfolio"
	"time"
)

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
	FullName string `json:"fullName" binding:"required"`
}

type LoginRequest struct {
	EmailOrPhone string `json:"emailOrPhone" binding:"required"`
	Password     string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token     string          `json:"token"`
	User      *portfolio.User `json:"user"`
	ExpiresAt time.Time       `json:"expiresAt"`
}

type VerifyOTPRequest struct {
	UserID           string `json:"userId" binding:"required"`
	OTP              string `json:"otp" binding:"required,len=6"`
	VerificationType string `json:"verificationType" binding:"required,oneof=email phone"`
}

type ResendOTPRequest struct {
	UserID           string `json:"userId" binding:"required"`
	VerificationType string `json:"verificationType" binding:"required,oneof=email phone"`
}

type ForgotPasswordRequest struct {
	EmailOrPhone string `json:"emailOrPhone" binding:"required"`
}

type ResetPasswordRequest struct {
	ResetToken  string `json:"resetToken" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=8"`
}

type ChangePasswordRequest struct {
	UserID          string `json:"userId" binding:"required"`
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=8"`
}

type UserRequest struct {
	UserId string `json:"userId"`
	Phone  string `json:"phone"`
	Email  string `json:"email"`
}
