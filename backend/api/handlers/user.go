package handlers

import (
	"basai/api/models"
	"basai/application/services"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

func GetAllUserTransactionsHandler(c echo.Context) error {
	var req models.UserTransactionsRequest

	// Retrieve the 'id' query parameter
	req.UserID = c.QueryParam("id")

	limit, err := strconv.Atoi(c.QueryParam("limit"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{"error": "Invalid limit query parameter: " + err.Error()})
	}
	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{"error": "Invalid page query parameter: " + err.Error()})
	}

	req.Limit = limit
	req.Page = page
	res, err := services.GetAllUserTransactionsService(c.Request().Context(), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"error": "Failed to authenticate user: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, models.APIResponse{
		Status:  200,
		Message: "Google sign-in successful",
		Result:  res,
	})
}
