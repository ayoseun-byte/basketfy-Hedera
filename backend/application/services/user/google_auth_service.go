package services

import (
	"basai/api/models"
	"basai/config"
	"basai/domain/portfolio"
	"basai/infrastructure/database"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

func GoogleAuthService(ctx context.Context, req models.GoogleAuthRequest) (*portfolio.User, error) {
	clientID := config.AppConfig.GoogleClientID
	clientSecret := config.AppConfig.GoogleClientSecret
	redirectURI := config.AppConfig.GoogleRedirectURI

	// 1️⃣ Exchange the code for access_token
	data := url.Values{}
	data.Set("code", req.Code)
	data.Set("client_id", clientID)
	data.Set("client_secret", clientSecret)
	data.Set("redirect_uri", redirectURI)
	data.Set("grant_type", "authorization_code")

	resp, err := http.PostForm("https://oauth2.googleapis.com/token", data)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to exchange code for token: " + string(body))
	}

	var tokenResp map[string]any
	json.Unmarshal(body, &tokenResp)

	accessToken := tokenResp["access_token"].(string)

	// 2️⃣ Fetch user info from Google
	userInfoResp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer userInfoResp.Body.Close()

	userInfoBody, _ := io.ReadAll(userInfoResp.Body)

	var googleUser models.GoogleAuthResponse
	if err := json.Unmarshal(userInfoBody, &googleUser); err != nil {
		return nil, fmt.Errorf("failed to parse user info: %w", err)
	}
	// 3️⃣ Check if user already exists
	existingUser, _ := findUserByEmailOrPhone(ctx, googleUser.Email, "")
	if existingUser != nil {
		// Update last login time
		existingUser.LastLoginAt = time.Now()
		_, _ = database.Collections.UserBaskets.UpdateOne(ctx,
			map[string]any{"email": googleUser.Email},
			map[string]any{"$set": map[string]any{"lastLoginAt": existingUser.LastLoginAt}},
		)
		return existingUser, nil
	}

	// 4️⃣ Marshal Google user into your User struct
	user := &portfolio.User{
		UserID:             uuid.New().String(),
		Email:              googleUser.Email,
		Phone:              "", // Google doesn’t provide phone by default
		PasswordHash:       "", // No password since it's OAuth
		FullName:           googleUser.Name,
		IsActive:           true,
		IsEmailVerified:    true,
		IsPhoneVerified:    false,
		EmailOTP:           "",
		EmailOTPExpiry:     time.Time{},
		PhoneOTP:           "",
		PhoneOTPExpiry:     time.Time{},
		ResetToken:         "",
		ResetTokenExpiry:   time.Time{},
		LoginAttempts:      0,
		AccountLockedUntil: time.Time{},
		LastLoginAt:        time.Now(),
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
		WalletAddress:      "",
		Balance:            decimal.Decimal{},
		TotalInvested:      decimal.Decimal{},
		TotalReturns:       decimal.Decimal{},
		BasketsOwned:       []string{},
		Role:               1,
		AvatarURL:          googleUser.Picture,
	}

	// 5️⃣ Save new user in DB
	_, err = database.Collections.Users.InsertOne(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	return user, nil
}
