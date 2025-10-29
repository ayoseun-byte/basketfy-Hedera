package middleware

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// This enables us interact with the Frontend Frameworks
func CORSMiddleware() echo.MiddlewareFunc {
	return middleware.CORSWithConfig(middleware.CORSConfig{
		// TODO:  set the origin to point to only cliveai.com domain for production environment
		AllowOrigins:     []string{"localhost:5173", "http://localhost:5173", "https://basketfy.netlify.app", "basketfy.netlify.app"},
		AllowMethods:     []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
		AllowCredentials: true,
	})
}

func TrailMiddleware() echo.MiddlewareFunc {
	return middleware.RemoveTrailingSlash()
}
