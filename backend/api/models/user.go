package models

import "time"

type UserTransactionsRequest struct {
	UserID string `json:"userId" binding:"required"`
	Page   int    `json:"page" binding:"required,min=1"`
	Limit  int    `json:"limit" binding:"required,min=1,max=100"`
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
