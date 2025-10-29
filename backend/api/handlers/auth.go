package handlers

import (
	"basai/api/models"
	"basai/application/services"
	"net/http"

	"github.com/labstack/echo/v4"
)

func GoogleAuthHandler(c echo.Context) error {
	var request models.GoogleAuthRequest

	// Parse the request payload
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"error": "Failed to bind request payload: " + err.Error(),
		})
	}

	// Exchange code for tokens + fetch Google profile
	res, err := services.GoogleAuthService(c.Request().Context(), request)
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
