package handlers

import (
	models "basai/api/models"
	portfolio "basai/application/services"
	"log"
	"net/http"
	"github.com/go-playground/validator"
	"github.com/labstack/echo/v4"
)

func Rebalance(c echo.Context,triggerChan chan []models.TokenInfo) error {
	var (
		// Create a new chat struct
		assignDataModel models.UserBasketRequest
	)
	// create a new validator
	v := validator.New()

	// Parse the request payload and map it to the assignDataModel struct
	if err := c.Bind(&assignDataModel); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "Failed to bind request payload: " + err.Error()})
	}

	// Validate the user data
	if err := v.Struct(&assignDataModel); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": err.Error() + " validation failed"})
	}

	data,err := portfolio.GetUserBasketByIdService(c.Request().Context(), assignDataModel)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "Failed to assign basket: " + err.Error()})
	}
	
	    // Trigger the background work immediately (non-blocking)
		select {
		case triggerChan <- func() []models.TokenInfo {
			var tokenArray []models.TokenInfo
			for _, investment := range data.BasketInvestments{
				for _, tokenInfo := range investment.TokenInfo{
				tokenArray = append(tokenArray, models.TokenInfo{
					TokenName:    tokenInfo.Name,
					Ticker:       tokenInfo.Symbol,
					ClosingPrice: tokenInfo.ClosingPrice,
					TargetWeight: tokenInfo.Weight,
				})
			}
		}
			return tokenArray
		}():
		default:
			// If channel is full, drop trigger to avoid blocking
			log.Println("Trigger channel full, skipping immediate run")
		}

	return c.JSON(http.StatusAccepted, map[string]interface{}{"message": "rebalancing started successfully"})
}


