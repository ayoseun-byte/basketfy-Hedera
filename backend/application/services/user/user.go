package services

import (
	"basai/api/models"

	"basai/domain/portfolio"
	"basai/infrastructure/database"
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// SaveTransactionService saves a new transaction for a user
func SaveTransactionService(ctx context.Context, userID string, transaction models.UserTransactionsItem) (*portfolio.UserTransactionsItem, error) {
	// Validate inputs
	if userID == "" {
		return nil, errors.New("userID is required")
	}
	if transaction.Amount <= 0 {
		return nil, errors.New("amount must be greater than 0")
	}
	if transaction.Type == "" {
		return nil, errors.New("transaction type is required")
	}

	// Generate ID if not provided
	if transaction.ID == "" {
		transaction.ID = uuid.New().String()
	}

	// Set timestamp if not provided
	if transaction.Date.IsZero() {
		transaction.Date = time.Now()
	}

	// Default status to pending if not provided
	if transaction.Status == "" {
		transaction.Status = "pending"
	}

	// Create transaction document with userID reference
	txDoc := bson.M{
		"_id":       transaction.ID,
		"userId":    userID,
		"type":      transaction.Type,
		"amount":    transaction.Amount,
		"currency":  transaction.Currency,
		"date":      transaction.Date,
		"status":    transaction.Status,
		"basket":    transaction.Basket,
		"createdAt": time.Now(),
		"updatedAt": time.Now(),
	}

	_, err := database.Collections.UserHistory.InsertOne(ctx, txDoc)
	if err != nil {
		return nil, fmt.Errorf("failed to save transaction: %w", err)
	}

	return &portfolio.UserTransactionsItem{
		ID:       transaction.ID,
		Type:     transaction.Type,
		Amount:   transaction.Amount,
		Currency: transaction.Currency,
		Date:     transaction.Date,
		Status:   transaction.Status,
		Basket:   transaction.Basket,
	}, nil
}

// GetTransactionService retrieves a single transaction by ID
func GetSingleTransactionService(ctx context.Context, transactionID string) (*portfolio.UserTransactionsItem, error) {
	if transactionID == "" {
		return nil, errors.New("transactionID is required")
	}

	var transaction portfolio.UserTransactionsItem

	err := database.Collections.UserHistory.FindOne(
		ctx,
		bson.M{"_id": transactionID},
	).Decode(&transaction)

	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return nil, errors.New("transaction not found")
		}
		return nil, fmt.Errorf("failed to get transaction: %w", err)
	}

	return &transaction, nil
}

// GetUserTransactionsService retrieves all transactions for a user with pagination
func GetAllUserTransactionsService(ctx context.Context, req models.UserTransactionsRequest) (*portfolio.UserTransactionsResponse, error) {
	// Validate inputs
	if req.UserID == "" {
		return nil, errors.New("userID is required")
	}
	if req.Page < 1 {
		return nil, errors.New("page must be at least 1")
	}
	if req.Limit < 1 || req.Limit > 100 {
		return nil, errors.New("recordsPerPage must be between 1 and 100")
	}

	// Calculate skip value for pagination
	skip := int64((req.Page - 1) * req.Limit)
	limit := int64(req.Limit)

	// Create filter for the specific user
	filter := bson.M{"userId": req.UserID}

	// Get total count of records
	totalRecords, err := database.Collections.UserHistory.CountDocuments(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to count transactions: %w", err)
	}

	// If no records, return empty response
	if totalRecords == 0 {
		return &portfolio.UserTransactionsResponse{
			CurrentPage:  req.Page,
			TotalRecords: 0,
			TotalPages:   0,
			Histories:    []portfolio.UserTransactionsItem{},
		}, nil
	}

	// Set up options for query
	opts := options.Find().
		SetSkip(skip).
		SetLimit(limit).
		SetSort(bson.M{"date": -1}) // Sort by date descending (newest first)

	// Query transactions
	cursor, err := database.Collections.UserHistory.Find(ctx, filter, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to query transactions: %w", err)
	}
	defer cursor.Close(ctx)

	// Decode results
	var histories []portfolio.UserTransactionsItem
	err = cursor.All(ctx, &histories)
	if err != nil {
		return nil, fmt.Errorf("failed to decode transactions: %w", err)
	}

	// Handle nil slice
	if histories == nil {
		histories = []portfolio.UserTransactionsItem{}
	}

	// Calculate total pages
	totalPages := (int(totalRecords) + req.Limit - 1) / req.Limit

	return &portfolio.UserTransactionsResponse{
		CurrentPage:  req.Page,
		TotalRecords: int(totalRecords),
		TotalPages:   totalPages,
		Histories:    histories,
	}, nil
}

// GetUserTransactionsSummaryService retrieves latest N transactions for quick view
func GetUserTransactionsSummaryService(ctx context.Context, userID string, limit int) ([]portfolio.UserTransactionsItem, error) {
	if userID == "" {
		return nil, errors.New("userID is required")
	}

	if limit <= 0 || limit > 100 {
		limit = 10 // default limit
	}

	filter := bson.M{"userId": userID}
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSort(bson.M{"date": -1})

	cursor, err := database.Collections.UserHistory.Find(ctx, filter, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to query transactions: %w", err)
	}
	defer cursor.Close(ctx)

	var histories []portfolio.UserTransactionsItem
	err = cursor.All(ctx, &histories)
	if err != nil {
		return nil, fmt.Errorf("failed to decode transactions: %w", err)
	}

	if histories == nil {
		histories = []portfolio.UserTransactionsItem{}
	}

	return histories, nil
}
