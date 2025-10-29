package services

import (
	"basai/api/models"
	"basai/config"
	"basai/domain/portfolio"
	"basai/infrastructure/database"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

const (
	OTPLength        = 6
	OTPExpiryMinutes = 10
	ResetTokenLength = 32
	ResetTokenExpiry = 1 * time.Hour
	MaxLoginAttempts = 5
	LockoutDuration  = 15 * time.Minute
	BcryptCost       = 12
)

// RegisterService - Creates a new user account
func RegisterService(ctx context.Context, userDataModel models.RegisterRequest) (*portfolio.User, error) {
	// Validate input
	if err := validateRegistrationInput(userDataModel); err != nil {
		return nil, err
	}

	// Check if user already exists
	existingUser, _ := findUserByEmailOrPhone(ctx, userDataModel.Email, userDataModel.Phone)
	if existingUser != nil {
		if existingUser.Email == userDataModel.Email {
			return nil, fmt.Errorf("email already registered")
		}
		return nil, fmt.Errorf("phone number already registered")
	}

	// Hash password
	hashedPassword, err := hashPassword(userDataModel.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Generate OTP for email/phone verification
	otp := generateOTP()
	otpExpiry := time.Now().Add(OTPExpiryMinutes * time.Minute)

	// Create user object
	user := &portfolio.User{
		UserID:             uuid.New().String(),
		Email:              userDataModel.Email,
		Phone:              userDataModel.Phone,
		PasswordHash:       hashedPassword,
		FullName:           userDataModel.FullName,
		IsActive:           false, // Set to false until verified
		IsEmailVerified:    false,
		IsPhoneVerified:    false,
		EmailOTP:           otp,
		EmailOTPExpiry:     otpExpiry,
		PhoneOTP:           otp, // Use same OTP for simplicity, or generate separate
		PhoneOTPExpiry:     otpExpiry,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
		LoginAttempts:      0,
		AccountLockedUntil: time.Time{},
	}

	// Insert user into database
	_, err = database.Collections.Users.InsertOne(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Send verification OTP (implement these functions based on your email/SMS provider)
	go sendVerificationEmail(user.Email, otp)
	go sendVerificationSMS(user.Phone, otp)

	return user, nil
}

// LoginService - Authenticates user with email/phone and password
func LoginService(ctx context.Context, userDataModel models.LoginRequest) (*models.LoginResponse, error) {
	// Find user by email or phone
	filter := bson.M{
		"$or": []bson.M{
			{"email": userDataModel.EmailOrPhone},
			{"phone": userDataModel.EmailOrPhone},
		},
		"isActive": true,
	}

	var user portfolio.User
	err := database.Collections.UserBaskets.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("invalid credentials")
		}
		return nil, fmt.Errorf("database error: %w", err)
	}

	// Check if account is locked
	if time.Now().Before(user.AccountLockedUntil) {
		remainingTime := time.Until(user.AccountLockedUntil).Round(time.Minute)
		return nil, fmt.Errorf("account locked. try again in %v", remainingTime)
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(userDataModel.Password)); err != nil {
		// Increment login attempts
		return nil, handleFailedLogin(ctx, user.UserID)
	}

	// Check if email/phone is verified
	if !user.IsEmailVerified && !user.IsPhoneVerified {
		return nil, fmt.Errorf("account not verified. please verify your email or phone")
	}

	// Reset login attempts on successful login
	err = resetLoginAttempts(ctx, user.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to reset login attempts: %w", err)
	}

	// Update last login
	err = updateLastLogin(ctx, user.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to update last login: %w", err)
	}

	// Generate JWT token (implement based on your JWT package)
	token, err := generateJWTToken(&user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	response := &models.LoginResponse{
		Token:     token,
		User:      &user,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	return response, nil
}

// VerifyOTPService - Verifies email or phone OTP
func VerifyOTPService(ctx context.Context, verifyRequest models.VerifyOTPRequest) error {
	// Find user
	user, err := GetUserByIdService(ctx, models.UserRequest{UserId: verifyRequest.UserID})
	if err != nil {
		return err
	}

	currentTime := time.Now()

	// Verify based on type (email or phone)
	switch verifyRequest.VerificationType {
	case "email":
		if user.EmailOTP != verifyRequest.OTP {
			return fmt.Errorf("invalid OTP")
		}
		if currentTime.After(user.EmailOTPExpiry) {
			return fmt.Errorf("OTP expired. please request a new one")
		}

		// Update user verification status
		update := bson.M{
			"$set": bson.M{
				"isEmailVerified": true,
				"isActive":        true,
				"emailOTP":        "",
				"updatedAt":       currentTime,
			},
		}
		err = updateUser(ctx, user.UserID, update)

	case "phone":
		if user.PhoneOTP != verifyRequest.OTP {
			return fmt.Errorf("invalid OTP")
		}
		if currentTime.After(user.PhoneOTPExpiry) {
			return fmt.Errorf("OTP expired. please request a new one")
		}

		// Update user verification status
		update := bson.M{
			"$set": bson.M{
				"isPhoneVerified": true,
				"isActive":        true,
				"phoneOTP":        "",
				"updatedAt":       currentTime,
			},
		}
		err = updateUser(ctx, user.UserID, update)

	default:
		return fmt.Errorf("invalid verification type")
	}

	return err
}

// ResendOTPService - Resends OTP for verification
func ResendOTPService(ctx context.Context, resendRequest models.ResendOTPRequest) error {
	user, err := GetUserByIdService(ctx, models.UserRequest{UserId: resendRequest.UserID})
	if err != nil {
		return err
	}

	// Generate new OTP
	otp := generateOTP()
	otpExpiry := time.Now().Add(OTPExpiryMinutes * time.Minute)

	var update bson.M

	switch resendRequest.VerificationType {
	case "email":
		update = bson.M{
			"$set": bson.M{
				"emailOTP":       otp,
				"emailOTPExpiry": otpExpiry,
				"updatedAt":      time.Now(),
			},
		}
		go sendVerificationEmail(user.Email, otp)

	case "phone":
		update = bson.M{
			"$set": bson.M{
				"phoneOTP":       otp,
				"phoneOTPExpiry": otpExpiry,
				"updatedAt":      time.Now(),
			},
		}
		go sendVerificationSMS(user.Phone, otp)

	default:
		return fmt.Errorf("invalid verification type")
	}

	return updateUser(ctx, user.UserID, update)
}

// ForgotPasswordService - Initiates password reset process
func ForgotPasswordService(ctx context.Context, forgotRequest models.ForgotPasswordRequest) error {
	// Find user by email or phone
	user, err := findUserByEmailOrPhone(ctx, forgotRequest.EmailOrPhone, forgotRequest.EmailOrPhone)
	if err != nil {
		// Don't reveal if user exists or not for security
		return nil
	}

	// Generate reset token
	resetToken := generateResetToken()
	resetTokenExpiry := time.Now().Add(ResetTokenExpiry)

	// Save reset token to database
	update := bson.M{
		"$set": bson.M{
			"resetToken":       resetToken,
			"resetTokenExpiry": resetTokenExpiry,
			"updatedAt":        time.Now(),
		},
	}

	err = updateUser(ctx, user.UserID, update)
	if err != nil {
		return fmt.Errorf("failed to generate reset token: %w", err)
	}

	// Send reset link/OTP via email or SMS
	resetLink := fmt.Sprintf("https://basketfy.com/reset-password?token=%s", resetToken)
	go sendPasswordResetEmail(user.Email, resetLink, resetToken)

	return nil
}

// ResetPasswordService - Resets password using reset token
func ResetPasswordService(ctx context.Context, resetRequest models.ResetPasswordRequest) error {
	// Validate password
	if err := validatePassword(resetRequest.NewPassword); err != nil {
		return err
	}

	// Find user by reset token
	filter := bson.M{
		"resetToken": resetRequest.ResetToken,
		"isActive":   true,
	}

	var user portfolio.User
	err := database.Collections.UserBaskets.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return fmt.Errorf("invalid or expired reset token")
		}
		return fmt.Errorf("database error: %w", err)
	}

	// Check if token is expired
	if time.Now().After(user.ResetTokenExpiry) {
		return fmt.Errorf("reset token expired. please request a new one")
	}

	// Hash new password
	hashedPassword, err := hashPassword(resetRequest.NewPassword)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password and clear reset token
	update := bson.M{
		"$set": bson.M{
			"passwordHash":     hashedPassword,
			"resetToken":       "",
			"resetTokenExpiry": time.Time{},
			"updatedAt":        time.Now(),
		},
	}

	err = updateUser(ctx, user.UserID, update)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Send confirmation email
	go sendPasswordChangeConfirmationEmail(user.Email)

	return nil
}

// ChangePasswordService - Changes password for authenticated user
func ChangePasswordService(ctx context.Context, changeRequest models.ChangePasswordRequest) error {
	// Get user
	user, err := GetUserByIdService(ctx, models.UserRequest{UserId: changeRequest.UserID})
	if err != nil {
		return err
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(changeRequest.CurrentPassword)); err != nil {
		return fmt.Errorf("current password is incorrect")
	}

	// Validate new password
	if err := validatePassword(changeRequest.NewPassword); err != nil {
		return err
	}

	// Check if new password is same as old
	if changeRequest.CurrentPassword == changeRequest.NewPassword {
		return fmt.Errorf("new password must be different from current password")
	}

	// Hash new password
	hashedPassword, err := hashPassword(changeRequest.NewPassword)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password
	update := bson.M{
		"$set": bson.M{
			"passwordHash": hashedPassword,
			"updatedAt":    time.Now(),
		},
	}

	err = updateUser(ctx, user.UserID, update)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Send confirmation email
	go sendPasswordChangeConfirmationEmail(user.Email)

	return nil
}

// GetUserByIdService - Retrieves user by ID
func GetUserByIdService(ctx context.Context, userDataModel models.UserRequest) (*portfolio.User, error) {
	filter := bson.M{"user_id": userDataModel.UserId, "isActive": true}

	var user portfolio.User
	err := database.Collections.UserBaskets.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("database error: %w", err)
	}

	return &user, nil
}

// ============= HELPER FUNCTIONS =============

// hashPassword - Hashes password using bcrypt
func hashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), BcryptCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}

// generateOTP - Generates random 6-digit OTP
func generateOTP() string {
	// For production, use crypto/rand for better randomness
	b := make([]byte, 3)
	rand.Read(b)
	otp := fmt.Sprintf("%06d", int(b[0])<<16|int(b[1])<<8|int(b[2]))
	return otp[:6]
}

// generateResetToken - Generates secure random reset token
func generateResetToken() string {
	b := make([]byte, ResetTokenLength)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// generateJWTToken - Generates JWT token (implement based on your JWT package)
func generateJWTToken(user *portfolio.User) (string, error) {

	claims := jwt.MapClaims{
		"user_id": user.UserID,
		"email":   user.Email,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.OKXAPIKey))

}

// findUserByEmailOrPhone - Finds user by email or phone
func findUserByEmailOrPhone(ctx context.Context, email, phone string) (*portfolio.User, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"email": email},
			{"phone": phone},
		},
	}

	var user portfolio.User
	err := database.Collections.UserBaskets.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// updateUser - Updates user document
func updateUser(ctx context.Context, userID string, update bson.M) error {
	filter := bson.M{"user_id": userID}
	_, err := database.Collections.UserBaskets.UpdateOne(ctx, filter, update)
	return err
}

// handleFailedLogin - Handles failed login attempts and account lockout
func handleFailedLogin(ctx context.Context, userID string) error {
	filter := bson.M{"user_id": userID}

	// Increment login attempts
	update := bson.M{
		"$inc": bson.M{"loginAttempts": 1},
		"$set": bson.M{"updatedAt": time.Now()},
	}

	_, err := database.Collections.UserBaskets.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("invalid credentials")
	}

	// Check if account should be locked
	var user portfolio.User
	err = database.Collections.UserBaskets.FindOne(ctx, filter).Decode(&user)
	if err == nil && user.LoginAttempts >= MaxLoginAttempts {
		lockUntil := time.Now().Add(LockoutDuration)
		lockUpdate := bson.M{
			"$set": bson.M{
				"accountLockedUntil": lockUntil,
				"updatedAt":          time.Now(),
			},
		}
		database.Collections.UserBaskets.UpdateOne(ctx, filter, lockUpdate)
		return fmt.Errorf("account locked due to multiple failed login attempts. try again in %v", LockoutDuration)
	}

	return fmt.Errorf("invalid credentials. %d attempts remaining", MaxLoginAttempts-user.LoginAttempts)
}

// resetLoginAttempts - Resets login attempts after successful login
func resetLoginAttempts(ctx context.Context, userID string) error {
	filter := bson.M{"user_id": userID}
	update := bson.M{
		"$set": bson.M{
			"loginAttempts":      0,
			"accountLockedUntil": time.Time{},
			"updatedAt":          time.Now(),
		},
	}
	_, err := database.Collections.UserBaskets.UpdateOne(ctx, filter, update)
	return err
}

// updateLastLogin - Updates last login timestamp
func updateLastLogin(ctx context.Context, userID string) error {
	filter := bson.M{"user_id": userID}
	update := bson.M{
		"$set": bson.M{
			"lastLoginAt": time.Now(),
			"updatedAt":   time.Now(),
		},
	}
	_, err := database.Collections.UserBaskets.UpdateOne(ctx, filter, update)
	return err
}

// validateRegistrationInput - Validates registration input
func validateRegistrationInput(input models.RegisterRequest) error {
	if input.Email == "" {
		return fmt.Errorf("email is required")
	}
	if input.Phone == "" {
		return fmt.Errorf("phone is required")
	}
	if input.FullName == "" {
		return fmt.Errorf("full name is required")
	}
	return validatePassword(input.Password)
}

// validatePassword - Validates password strength
func validatePassword(password string) error {
	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters long")
	}
	//password should contain atleast 1 capital letter and 1 number and 1 special character

	return nil
}

// ============= EMAIL/SMS FUNCTIONS (TO BE IMPLEMENTED) =============

func sendVerificationEmail(email, otp string) {
	// TODO: Implement using your email provider (SendGrid, AWS SES, etc.)
	fmt.Printf("Sending verification email to %s with OTP: %s\n", email, otp)
}

func sendVerificationSMS(phone, otp string) {
	// TODO: Implement using your SMS provider (Twilio, Africa's Talking, etc.)
	fmt.Printf("Sending verification SMS to %s with OTP: %s\n", phone, otp)
}

func sendPasswordResetEmail(email, resetLink, resetToken string) {
	// TODO: Implement password reset email
	fmt.Printf("Sending password reset email to %s with link: %s\n", email, resetLink)
}

func sendPasswordChangeConfirmationEmail(email string) {
	// TODO: Implement password change confirmation email
	fmt.Printf("Sending password change confirmation to %s\n", email)
}
