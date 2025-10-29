// domain/portfolio/user.go
package portfolio

import (
	"time"

	"github.com/shopspring/decimal"
)

type User struct {
	UserID             string          `bson:"user_id" json:"userId"`
	Email              string          `bson:"email" json:"email"`
	Phone              string          `bson:"phone" json:"phone"`
	PasswordHash       string          `bson:"passwordHash" json:"-"` // Never expose in JSON
	FullName           string          `bson:"fullName" json:"fullName"`
	IsActive           bool            `bson:"isActive" json:"isActive"`
	IsEmailVerified    bool            `bson:"isEmailVerified" json:"isEmailVerified"`
	IsPhoneVerified    bool            `bson:"isPhoneVerified" json:"isPhoneVerified"`
	EmailOTP           string          `bson:"emailOTP" json:"-"`
	EmailOTPExpiry     time.Time       `bson:"emailOTPExpiry" json:"-"`
	PhoneOTP           string          `bson:"phoneOTP" json:"-"`
	PhoneOTPExpiry     time.Time       `bson:"phoneOTPExpiry" json:"-"`
	ResetToken         string          `bson:"resetToken" json:"-"`
	ResetTokenExpiry   time.Time       `bson:"resetTokenExpiry" json:"-"`
	LoginAttempts      int             `bson:"loginAttempts" json:"-"`
	AccountLockedUntil time.Time       `bson:"accountLockedUntil" json:"-"`
	LastLoginAt        time.Time       `bson:"lastLoginAt" json:"lastLoginAt"`
	CreatedAt          time.Time       `bson:"createdAt" json:"createdAt"`
	UpdatedAt          time.Time       `bson:"updatedAt" json:"updatedAt"`
	WalletAddress      string          `bson:"walletAddress" json:"walletAddress"`
	Balance            decimal.Decimal `bson:"balance" json:"balance"`
	TotalInvested      decimal.Decimal `bson:"totalInvested" json:"totalInvested"`
	TotalReturns       decimal.Decimal `bson:"totalReturns" json:"totalReturns"`
	BasketsOwned       []string        `bson:"basketsOwned" json:"basketsOwned"`
	Role               int             `bson:"role" json:"role"` // e.g., 1 = user, 2 = feeder, 3 = curator, 4 = admin
	AvatarURL          string          `bson:"avatarURL" json:"avatarURL"`
}

type UserTransactionsRequest struct {
	UserID         string `json:"userId" binding:"required"`
	Page           int    `json:"page" binding:"required,min=1"`
	RecordsPerPage int    `json:"recordsPerPage" binding:"required,min=1,max=100"`
}
type UserTransactionsResponse struct {
	CurrentPage  int                    `json:"currentPage"`
	TotalRecords int                    `json:"totalRecords"`
	TotalPages   int                    `json:"totalPages"`
	Histories    []UserTransactionsItem `json:"histories"`
}
type UserTransactionsItem struct {
	ID       string    `json:"id"`
	Type     string    `json:"type"` // e.g., "investment", "withdrawal"
	Amount   float64   `json:"amount"`
	Currency string    `json:"currency"`
	Date     time.Time `json:"date"`
	Status   string    `json:"status"` // e.g., "completed", "pending"
	Basket   string    `json:"basket,omitempty"`
}
