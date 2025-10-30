package handlers

import (
	"basai/api/models"
	"basai/application/services"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

// SaveTransactionHandler handles POST request to create a new transaction
func SaveTransactionHandler(c echo.Context) error {
	var transaction models.UserTransactionsItem

	// Bind request body to transaction model
	if err := c.Bind(&transaction); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"error": "Invalid request body: " + err.Error(),
		})
	}

	// Get userID from query parameter
	userID := c.QueryParam("id")
	if userID == "" {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"error": "User ID is required",
		})
	}

	// Call service to save transaction
	result, err := services.SaveTransactionService(c.Request().Context(), userID, transaction)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"error": "Failed to save transaction: " + err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, models.APIResponse{
		Status:  201,
		Message: "Transaction created successfully",
		Result:  result,
	})
}

// GetSingleTransactionHandler handles GET request to retrieve a single transaction
func GetSingleTransactionHandler(c echo.Context) error {
	// Get transaction ID from path parameter
	transactionID := c.Param("transactionId")
	if transactionID == "" {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"error": "Transaction ID is required",
		})
	}

	// Call service to get transaction
	result, err := services.GetSingleTransactionService(c.Request().Context(), transactionID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "transaction not found" {
			statusCode = http.StatusNotFound
		}
		return c.JSON(statusCode, map[string]any{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, models.APIResponse{
		Status:  200,
		Message: "Transaction retrieved successfully",
		Result:  result,
	})
}

// GetAllUserTransactionsHandler handles GET request to retrieve paginated user transactions
func GetAllUserTransactionsHandler(c echo.Context) error {
	var req models.UserTransactionsRequest

	// Retrieve the 'id' query parameter
	req.UserID = c.QueryParam("id")
	if req.UserID == "" {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"error": "User ID is required",
		})
	}

	// Parse limit parameter
	limit, err := strconv.Atoi(c.QueryParam("limit"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"error": "Invalid limit query parameter: " + err.Error(),
		})
	}

	// Parse page parameter
	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"error": "Invalid page query parameter: " + err.Error(),
		})
	}

	req.Limit = limit
	req.Page = page

	// Call service to get transactions
	res, err := services.GetAllUserTransactionsService(c.Request().Context(), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"error": "Failed to retrieve transactions: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, models.APIResponse{
		Status:  200,
		Message: "Transactions retrieved successfully",
		Result:  res,
	})
}

// GetUserTransactionsSummaryHandler handles GET request to retrieve latest N transactions
func GetUserTransactionsSummaryHandler(c echo.Context) error {
	// Get userID from query parameter
	userID := c.QueryParam("id")
	if userID == "" {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"error": "User ID is required",
		})
	}

	// Parse optional limit parameter (default to 10 if not provided or invalid)
	limit := 10
	if limitParam := c.QueryParam("limit"); limitParam != "" {
		parsedLimit, err := strconv.Atoi(limitParam)
		if err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	// Call service to get transaction summary
	result, err := services.GetUserTransactionsSummaryService(c.Request().Context(), userID, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"error": "Failed to retrieve transaction summary: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, models.APIResponse{
		Status:  200,
		Message: "Transaction summary retrieved successfully",
		Result:  result,
	})
}
