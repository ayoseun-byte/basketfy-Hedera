package handlers

import (
	"basai/application/services"
	"basai/config"
	"log"

	"fmt"

	"net/http"

	"github.com/labstack/echo/v4"
)

type BasketHandler struct {
	hederaService *services.HederaClient
	cfg           *config.ConfigApplication
	topicID       string // Add missing field
}

func NewBasketHandler() (*BasketHandler, error) {
	cfg := &config.AppConfig
	fmt.Println("Hedera Topic ID:", cfg.HederaTopicID)
	hs, err := services.NewHederaClient()
	if err != nil {
		log.Fatalf("Failed to initialize Hedera client: %v", err)
	}

	return &BasketHandler{
		hederaService: hs,
		cfg:           cfg,               // Store config
		topicID:       cfg.HederaTopicID, // Initialize topic ID from config
	}, nil // Return nil error on success
}

// CreateBasket creates a new thematic basket
func (bh *BasketHandler) DeployBasketFactory(c echo.Context) error {

	// Create HTS tokens (bToken + NFT)
	contractID, err := bh.hederaService.GetBasketFactoryVersion()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"error": fmt.Sprintf("Failed to create tokens: %v", err),
		})
	}
	return c.JSON(http.StatusCreated, map[string]any{
		"contract_id": contractID,
	})
}

// // CreateBasket creates a new thematic basket
// func (bh *BasketHandler) CreateBasket(c echo.Context) error {
// 	var req models.CreateBasketRequest
// 	if err := c.Bind(&req); err != nil {
// 		return c.JSON(http.StatusBadRequest, map[string]interface{}{
// 			"error": "Failed to bind request payload: " + err.Error(),
// 		})
// 	}
// 	ctx := c.Request().Context()

// 	// Create HTS tokens (bToken + NFT)
// 	bTokenID, nftID, err := bh.hederaService.CreateBasketTokens(ctx, req.Name, req.Name, req.Symbol)
// 	if err != nil {
// 		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
// 			"error": fmt.Sprintf("Failed to create tokens: %v", err),
// 		})
// 	}

// 	// Log to HCS
// 	_, err = bh.hederaService.SubmitMessage(ctx, bh.topicID, "BASKET_CREATED", 0, c.RealIP(),
// 		fmt.Sprintf("Created basket: %s", req.Name))
// 	if err != nil {
// 		log.Printf("Warning: failed to log to HCS: %v", err)
// 	}

// 	return c.JSON(http.StatusCreated, map[string]interface{}{
// 		"basket_id": 1,
// 		"btoken_id": bTokenID,
// 		"nft_id":    nftID,
// 		"name":      req.Name,
// 		"theme":     req.Category,
// 	})
// }

// // BuyBasket handles user basket purchase
// func (bh *BasketHandler) BuyBasket(c echo.Context) error {
// 	var req models.BuyBasketRequest
// 	if err := c.Bind(&req); err != nil {
// 		return c.JSON(http.StatusBadRequest, map[string]interface{}{
// 			"error": err.Error(),
// 		})
// 	}

// 	ctx := c.Request().Context()

// 	// Create HTS tokens (bToken + NFT)
// 	bTokenID, nftID, err := bh.hederaService.MintToken(ctx, req.Name, req.Name, req.Symbol)
// 	if err != nil {
// 		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
// 			"error": fmt.Sprintf("Failed to create tokens: %v", err),
// 		})
// 	}

// 	// In production: validate stablecoin token, call smart contract
// 	// Simulate: mint bToken
// 	bTokenAmount := req.StablecoinAmount * 99 / 100 // 1% protocol fee

// 	message := fmt.Sprintf("User purchased %d bTokens for basket %d using %s", bTokenAmount, req.BasketData.BasketReferenceId, req.Stablecoin)
// 	// Log to HCS
// 	_, err := bh.hederaService.SubmitMessage(ctx, bh.topicID, []byte(models.Purchase), req.BasketID,
// 		c.RealIP(), fmt.Sprintf("Purchased %d bTokens", bTokenAmount))
// 	if err != nil {
// 		log.Printf("Warning: failed to log to HCS: %v", err)
// 	}

// 	return c.JSON(http.StatusCreated, map[string]interface{}{
// 		"basket_id":         req.BasketID,
// 		"stablecoin_amount": req.StablecoinAmount,
// 		"btoken_minted":     bTokenAmount,
// 		"timestamp":         time.Now().Unix(),
// 	})
// }

// // RedeemBasket handles basket redemption
// func (bh *BasketHandler) RedeemBasket(c echo.Context) error {
// 	var req models.RedeemBasketRequest
// 	if err := c.Bind(&req); err != nil {
// 		return c.JSON(http.StatusBadRequest, map[string]interface{}{
// 			"error": err.Error(),
// 		})
// 	}

// 	ctx := c.Request().Context()

// 	// In production: call smart contract burn
// 	stablecoinReturned := req.BTokenAmount * 99 / 100

// 	// Log to HCS
// 	_, err := bh.hederaService.LogToHCS(ctx, bh.topicID, "BASKET_REDEMPTION", req.BasketID,
// 		c.RealIP(), fmt.Sprintf("Redeemed %d bTokens", req.BTokenAmount))
// 	if err != nil {
// 		log.Printf("Warning: failed to log to HCS: %v", err)
// 	}

// 	return c.JSON(http.StatusOK, map[string]interface{}{
// 		"basket_id":           req.BasketID,
// 		"btoken_burned":       req.BTokenAmount,
// 		"stablecoin_returned": stablecoinReturned,
// 		"timestamp":           time.Now().Unix(),
// 	})
// }
