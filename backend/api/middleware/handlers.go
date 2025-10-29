package middleware

import (
	"fmt"
	"net/http"
	"basai/config"

	"github.com/labstack/echo/v4"
)

func APIKeyMiddleware() echo.MiddlewareFunc {
	expectedKey := config.AppConfig.APIKey

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			apiKey := c.Request().Header.Get("x-api-key")
			if apiKey == "" || apiKey != expectedKey {
				return echo.NewHTTPError(http.StatusUnauthorized, "Missing or invalid API key")
			}
			return next(c)
		}
	}
}



func SetHeaders(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Request().Header.Set("X-requested-With", "XMLHttpRequest")
		c.Request().Header.Set("Content-Type", "application/json")
		return next(c)
	}
}

func Recover(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		defer func() {
			if r := recover(); r != nil {
				err, ok := r.(error)
				if !ok {
					err = fmt.Errorf("%v", r)
				}
				c.Error(err)
			fmt.Printf("Recovered from panic in endpoint: %v", r)
			}
		}()
		return next(c)
	}
}
