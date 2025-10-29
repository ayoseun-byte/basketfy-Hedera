package pkg

import (
	"basai/api/handlers"
	"basai/api/models"

	"github.com/labstack/echo/v4"
	// app_midd "basai/api/middleware"
)

func PortfolioRoutes(basketGroup *echo.Group) {

	/******************** ai ***********/
	basketGroup.POST("/buy-basket", handlers.BuyBasket)
	basketGroup.GET("/get-user-basket", handlers.GetUserBasket)
	basketGroup.GET("/get-user-baskets", handlers.GetAllUserBaskets)
	basketGroup.POST("/create-basket", handlers.CreateBasket)
	basketGroup.GET("/get-all-basket", handlers.GetAllBasket)
	basketGroup.GET("/get-single-basket", handlers.GetSingleBasket)
	basketGroup.GET("/get-user-basket-analytics", handlers.GenerateAnalytics)
}

func AuthRoutes(authGroup *echo.Group) {

	/******************** auth ***********/
	// authGroup.POST("/register", handlers.Register)
	// authGroup.POST("/login", handlers.Login)
	authGroup.POST("/auth/google", handlers.GoogleAuthHandler)
	// authGroup.POST("/verify-otp", handlers.VerifyOTP)
	// authGroup.POST("/resend-otp", handlers.ResendOTP)
	// authGroup.POST("/forgot-password", handlers.ForgotPassword)
	// authGroup.POST("/reset-password", handlers.ResetPassword)
	// authGroup.POST("/change-password", handlers.ChangePassword)
}

func UserRoutes(userGroup *echo.Group) {

	/******************** user ***********/

	userGroup.GET("/:transactionId", handlers.GetSingleTransactionHandler) // Get single transaction
	userGroup.GET("", handlers.GetAllUserTransactionsHandler)              // Get all with pagination
	userGroup.GET("/summary", handlers.GetUserTransactionsSummaryHandler)  // Get summary
}

func AIRoutes(aiGroup *echo.Group, trigger chan []models.TokenInfo) {

	/******************** ai ***********/
	aiGroup.POST("/rebalance-ai", func(c echo.Context) error {
		return handlers.Rebalance(c, trigger)
	})
	aiGroup.POST("/rebalance-ai-stream", handlers.GenerateStreamingResponse)
}
