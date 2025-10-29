package handlers

import (
	models "basai/api/models"
	portfolio "basai/application/services"
	"encoding/json"
	"fmt"
	"github.com/go-playground/validator"
	"github.com/labstack/echo/v4"
	"net/http"
	"strconv"
	"time"
)

// BuyBasket godoc
// @Summary      Buy a basket
// @Description  Handles the purchase of a basket by a user.
// @Tags         Basket
// @Accept       json
// @Produce      json
// @Param        request body models.BuyBasketRequest true "Buy Basket payload"
// @Success      200  {object} models.BasketResponse "Basket purchase successful"
// @Failure      400  {object} map[string]interface{} "Invalid request payload"
// @Failure      500  {object} map[string]interface{} "Internal server error"
// @Router       /api/v1/buy-basket [post]
func BuyBasket(c echo.Context) error {
	var createUserBasketDataModel models.BuyBasketRequest

	// Parse the request payload and map it to the createUserBasketDataModel struct
	if err := c.Bind(&createUserBasketDataModel); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "Failed to bind request payload: " + err.Error()})
	}

	res, err := portfolio.CreateUserBuyBasketService(c.Request().Context(), createUserBasketDataModel)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "Failed to assign basket: " + err.Error()})
	}
	return c.JSON(http.StatusOK, models.BasketResponse{
		Status:  200,
		Message: "The basket purchase was completed successfully.",
		Result:  res,
	})
}

// GetUserBasket godoc
// @Summary      Get user basket
// @Description  Retrieves the basket(s) associated with a user by user ID.
// @Tags         Basket
// @Accept       json
// @Produce      json
// @Param        id query string true "User ID"
// @Success      200  {object} models.BasketResponse "User basket data"
// @Failure      400  {object} map[string]interface{} "Missing or invalid user ID"
// @Failure      500  {object} map[string]interface{} "Internal server error"
// @Router       /api/v1/get-user-basket [get]
func GetUserBasket(c echo.Context) error {
	var userBasketDataModel models.UserBasketRequest

	errorDetail := models.NewError()
	// Retrieve the 'id' query parameter
	basketid := c.QueryParam("basketid")
	if basketid == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "Missing basketid query parameter"})
	}
	// Retrieve the 'id' query parameter
	id := c.QueryParam("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "Missing id query parameter"})
	}
	userBasketDataModel.UserId = id
	userBasketDataModel.BasketId = basketid

	// Call the service to get the user basket
	basket, err := portfolio.GetUserBasketByIdService(c.Request().Context(), userBasketDataModel)
	if err != nil {
		errorDetail.ResponseCode = 500
		errorDetail.Message = "Failed to retrieve basket:" + err.Error()
		errorDetail.ExternalReference = "500"
		errorDetail.Detail = err.Error()
		return c.JSON(errorDetail.ResponseCode, err)
	}

	// Return the basket data as a JSON response
	return c.JSON(http.StatusOK, models.BasketResponse{
		Status:  200,
		Message: "User basket retrieved successfully.",
		Result:  basket,
	})
}

// GetAllUserBaskets godoc
// @Summary      Get user baskets
// @Description  Retrieves all user baskets with an optional limit.
// @Tags         Basket
// @Accept       json
// @Produce      json
// @Param        limit query int false "Limit the number of baskets returned"
// @Param        id query string true "User ID"
// @Success      200  {object} []portfolio.UserBasket "All Basket data retrieved successfully"
// @Failure      400  {object} map[string]interface{} "Invalid limit query parameter"
// @Failure      500  {object} map[string]interface{} "Internal server error"
// @Router       /api/v1/get-user-baskets [get]
func GetAllUserBaskets(c echo.Context) error {

	// Retrieve the 'limit' query parameter
	limit := c.QueryParam("limit")
	// Retrieve the 'id' query parameter
	id := c.QueryParam("id")
	// Convert the 'limit' query parameter to int64
	limitInt, err := strconv.ParseInt(limit, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{"error": "Invalid limit query parameter: " + err.Error()})
	}

	allUserBaskets, err := portfolio.GetAllUserBasketsByIdService(c.Request().Context(), limitInt, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "Failed to assign basket: " + err.Error()})
	}

	return c.JSON(http.StatusOK, models.AllBasketResponse{
		Status:  200,
		Message: "All Basket data retrieved successfully",
		Result:  allUserBaskets,
	})
}

// CreateBasket godoc
// @Summary      Create a new basket
// @Description  Creates a new basket with the provided details.
// @Tags         Basket
// @Accept       json
// @Produce      json
// @Param        request body models.CreateBasketRequest true "Create Basket payload"
// @Success      200  {object} models.BasketResponse "Basket created successfully"
// @Failure      400  {object} map[string]interface{} "Invalid request payload or validation failed"
// @Failure      500  {object} map[string]interface{} "Internal server error"
// @Router       /api/v1/create-basket [post]
func CreateBasket(c echo.Context) error {
	var createBasketDataModel models.CreateBasketRequest
	v := validator.New()

	// Parse the request payload and map it to the createBasketDataModel struct
	if err := c.Bind(&createBasketDataModel); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "Failed to bind request payload: " + err.Error()})
	}

	// Validate the basket data
	if err := v.Struct(&createBasketDataModel); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": err.Error() + " validation failed"})
	}

	res, err := portfolio.CreateBasketService(c.Request().Context(), createBasketDataModel)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "Failed to create basket: " + err.Error()})
	}
	return c.JSON(http.StatusOK, models.BasketResponse{
		Status:  200,
		Message: "Basket created successfully.",
		Result:  res,
	})
}

// GetAllBasket godoc
// @Summary      Get all baskets
// @Description  Retrieves all baskets with an optional limit.
// @Tags         Basket
// @Accept       json
// @Produce      json
// @Param        limit query int false "Limit the number of baskets returned"
// @Success      200  {object} []portfolio.BasketCatalogue "All Basket data retrieved successfully"
// @Failure      400  {object} map[string]interface{} "Invalid limit query parameter"
// @Failure      500  {object} map[string]interface{} "Internal server error"
// @Router       /api/v1/get-all-basket [get]
func GetAllBasket(c echo.Context) error {
	var allBasketDataModel models.Allbasket

	// Retrieve the 'limit' query parameter
	limit := c.QueryParam("limit")

	// Convert the 'limit' query parameter to int64
	limitInt, err := strconv.ParseInt(limit, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "Invalid limit query parameter: " + err.Error()})
	}

	// Assign the converted limit to the allBasketDataModel
	allBasketDataModel.Limit = limitInt

	allBaskets, err := portfolio.GetAllBasketService(c.Request().Context(), allBasketDataModel)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "Failed to assign basket: " + err.Error()})
	}

	return c.JSON(http.StatusOK, models.BasketResponse{
		Status:  200,
		Message: "All Basket data retrieved successfully",
		Result:  allBaskets,
	})
}

// GetSingleBasket godoc
// @Summary      Get single basket
// @Description  Retrieves a single basket by its ID.
// @Tags         Basket
// @Accept       json
// @Produce      json
// @Param        id query string true "Basket ID"
// @Success      200  {object} portfolio.BasketCatalogue "Single basket data"
// @Failure      400  {object} map[string]interface{} "Missing or invalid basket ID"
// @Failure      500  {object} map[string]interface{} "Internal server error"
// @Router       /api/v1/get-single-basket [get]
func GetSingleBasket(c echo.Context) error {
	var singleBasketDataModel models.SingleBasketRequest

	// Retrieve the 'id' query parameter
	id := c.QueryParam("id")

	// Validate that the 'id' parameter is not empty
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "Missing id query parameter"})
	}

	// Assign the id to the singleBasketDataModel
	singleBasketDataModel.Id = id

	// Call the service to get the single basket
	basket, err := portfolio.GetBasketByIdService(c.Request().Context(), singleBasketDataModel.Id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "Failed to retrieve basket: " + err.Error()})
	}

	// Return the basket data as a JSON response
	return c.JSON(http.StatusOK, models.BasketResponse{
		Status:  200,
		Message: "All Basket data retrieved successfully",
		Result:  basket,
	})
}

// GenerateAnalytics godoc
// @Summary      Generate portfolio analytics
// @Description  Returns analytics data for the user's portfolio including TVL, 7-day trend, risk score, etc.
// @Tags         Analytics
// @Accept       json
// @Produce      json
// @Param        id query string true "User ID"
// @Success      200  {object} portfolio.UserBasket "Analytics data for the user's portfolio"
// @Failure      400  {object} map[string]interface{} "Missing or invalid user ID"
// @Failure      500  {object} map[string]interface{} "Internal server error"
// @Router       /api/v1/get-user-basket-analytics [get]
func GenerateAnalytics(c echo.Context) error {
	var (
		analyticsResponse      models.AnalyticsResponse
		userBasketDataModel    models.UserBasketRequest
		totalValue, todayValue float64
		totalRebalanceValue    int
	)
	errorDetail := models.NewError()
	// Retrieve the 'id' query parameter
	basketid := c.QueryParam("basketid")
	if basketid == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "Missing basketid query parameter"})
	}
	// Retrieve the 'id' query parameter
	id := c.QueryParam("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "Missing id query parameter"})
	}
	userBasketDataModel.UserId = id
	userBasketDataModel.BasketId = basketid

	// Fetch user basket data
	basket, err := portfolio.FetchAnalyticsDataService(c.Request().Context(), userBasketDataModel)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "Failed to retrieve basket: " + err.Error()})
	}

	// === Total Value Computation ===
	for _, investments := range basket.BasketInvestments {
		for _, token := range investments.TokenInfo {
			totalValue += token.ClosingPrice * token.Quantity
			todayValue += 1234 * token.Quantity // Placeholder
		}
	}
	analyticsResponse.TotalValue = models.TotalValue{
		Value: totalValue,
		Today: todayValue,
	}

	const days = 7
	today := time.Now()

	var portfolioValueChart []models.PortfolioValueChart
	for i, investments := range basket.BasketInvestments {
		var tokenTrends []models.TokenTrend
		for _, token := range investments.TokenInfo {
			var trendData []struct {
				Date  string  `json:"date"`
				Value float64 `json:"value"`
			}

			for i := days - 1; i >= 0; i-- {
				date := today.AddDate(0, 0, -i).Format("2006-01-02")
				value := token.ClosingPrice * token.Quantity * (1 + 0.01*float64(i)) // simulate gain
				trendData = append(trendData, struct {
					Date  string  `json:"date"`
					Value float64 `json:"value"`
				}{
					Date:  date,
					Value: value,
				})
			}
			tokenTrends = append(tokenTrends, models.TokenTrend{
				Ticker: token.Symbol,
				Name:   token.Name,
				Data:   trendData,
			})

		}
		portfolioValueChart = append(portfolioValueChart, models.PortfolioValueChart{
			Trend:      "sevenDays",
			TokenTrend: tokenTrends,
		})
		totalRebalanceValue = i + 1
		analyticsResponse.RiskScore = investments.RiskScore
	}

	analyticsResponse.PortfolioValueChart = portfolioValueChart
	// === Simulated Statistics ===
	analyticsResponse.PortfolioStatistics = models.PortfolioStatistics{
		Created:           basket.CreatedAt.Format("2006-01-02"),
		TotalTransactions: totalRebalanceValue,
		AverageHoldTime:   "2 months",
		BestPerformer:     "BTC",
		CorrelationToBTC:  0.82,
		MaxDrawdown:       0.15,
	}
	analyticsResponse.SevenDaysReturns = 23.54
	analyticsResponse.SharpeRatio = 1.25

	analyticsResponse.Volatility = 0.35

	// Marshal check (optional debug log)
	if marshaled, err := json.Marshal(analyticsResponse); err == nil {
		fmt.Println("\n\n analyticsResponse: >>> ", string(marshaled))
	} else {
		errorDetail.ResponseCode = 500
		errorDetail.Message = "Failed to marshal analyticsResponse:" + err.Error()
		errorDetail.ExternalReference = "500"
		errorDetail.Detail = err.Error()
		return c.JSON(errorDetail.ResponseCode, err)
	}

	// Success
	return c.JSON(http.StatusOK, analyticsResponse)
}
