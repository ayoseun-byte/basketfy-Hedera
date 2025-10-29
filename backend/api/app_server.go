package pkg

import (
	"basai/api/handlers"
	"basai/api/middleware"
	"basai/api/models"
	"basai/config"
	"basai/domain/ai/agent/tools"
	"basai/infrastructure/database"
	"context"
	"github.com/labstack/echo/v4"
	e_mid "github.com/labstack/echo/v4/middleware"
	echoSwagger "github.com/swaggo/echo-swagger"
	"log"
	"net/http"
	_ "net/http/pprof"
	"time"
)

func Start() *echo.Echo {
	// Initialize database components and handle any errors
	if err := database.InitializeComponents(); err != nil {
		log.Fatalf("Failed to initialize database components: %v", err)
	}
	// Populate preliminary toolkit for multimodal operations
	tools.PopulatePreliminaryToolkit()

	e := echo.New()
	//CORS & Middleware
	e.Use(middleware.CORSMiddleware())
	e.Pre(middleware.TrailMiddleware())
	// set up logger
	e.Use(e_mid.Logger())
	e.Use(e_mid.Recover())

	// Root route => handler
	e.GET("/", func(c echo.Context) error {
		var resp = map[string]interface{}{
			"ApplicationName":     "Basketfy AI Backend Server",
			"ApplicationOwner":    "",
			"ApplicationVersion":  "1.0",
			"ApplicationEngineer": "Sam Ayo",
			"ApplicationStatus":   "running...",
		}
		return c.JSON(http.StatusOK, resp)
	})
	e.GET("/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "healthy")
	})
	e.HEAD("/ping", handlers.APIHome)
	e.GET("/docs/*", echoSwagger.WrapHandler)
	//set api endpoint
	api := e.Group("api/v1")

	// api.Use(middleware.APIKeyMiddleware())
	PortfolioRoutes(api)

	AuthRoutes(api)

	UserRoutes(api)

	triggerChan := make(chan []models.TokenInfo, 1)

	AIRoutes(api, triggerChan)

	//Run Server
	s := &http.Server{
		Addr:         ":" + string(config.AppConfig.PORT),
		ReadTimeout:  5 * time.Minute,
		WriteTimeout: 5 * time.Minute,
	}
	//s.SetKeepAlivesEnabled(false)
	e.HideBanner = true
	// Start server
	go func() {
		if err := e.StartServer(s); err != nil {
			log.Print(err.Error(), "shutting down the server")

		}

	}()
	log.Println("⚡️🚀 Basketfy AI Backend Server::Started")
	log.Println("⚡️🚀 Basketfy AI Backend Server::Running")

	return e
}

// Stop - stop the echo server
func Stop(e *echo.Echo) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal(err)
	}
	return nil
}
