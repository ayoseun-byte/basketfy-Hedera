package handlers

type BasketHandler struct {
	hederaService *HederaService
	vaultService  *VaultService
	topicID       hedera.TopicID
}

func NewBasketHandler(hs *HederaService, vs *VaultService, topicID hedera.TopicID) *BasketHandler {
	return &BasketHandler{
		hederaService: hs,
		vaultService:  vs,
		topicID:       topicID,
	}
}

// Health check endpoint
func (bh *BasketHandler) Health(c *gin.Context) {
	c.JSON(200, gin.H{"status": "healthy", "network": cfg.HederaNetwork})
}

// CreateBasket creates a new thematic basket
func (bh *BasketHandler) CreateBasket(c *gin.Context) {
	var req CreateBasketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()

	// Create HTS tokens (bToken + NFT)
	bTokenID, nftID, err := bh.hederaService.CreateBasketTokens(ctx, req.Name, req.TokenName, req.TokenSymbol)
	if err != nil {
		c.JSON(500, gin.H{"error": fmt.Sprintf("Failed to create tokens: %v", err)})
		return
	}

	// Log to HCS
	_, err = bh.hederaService.LogToHCS(ctx, bh.topicID, "BASKET_CREATED", 0, c.ClientIP(), fmt.Sprintf("Created basket: %s", req.Name))
	if err != nil {
		log.Printf("Warning: failed to log to HCS: %v", err)
	}

	c.JSON(201, gin.H{
		"basket_id": 1,
		"btoken_id": bTokenID.String(),
		"nft_id":    nftID.String(),
		"name":      req.Name,
		"theme":     req.Theme,
	})
}

// BuyBasket handles user basket purchase
func (bh *BasketHandler) BuyBasket(c *gin.Context) {
	var req BuyBasketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()

	// In production: validate stablecoin token, call smart contract
	// Simulate: mint bToken
	bTokenAmount := req.StablecoinAmount * 99 / 100 // 1% protocol fee

	// Log to HCS
	_, err := bh.hederaService.LogToHCS(ctx, bh.topicID, "BASKET_PURCHASE", req.BasketID, c.ClientIP(), fmt.Sprintf("Purchased %d bTokens", bTokenAmount))
	if err != nil {
		log.Printf("Warning: failed to log to HCS: %v", err)
	}

	c.JSON(201, gin.H{
		"basket_id":         req.BasketID,
		"stablecoin_amount": req.StablecoinAmount,
		"btoken_minted":     bTokenAmount,
		"timestamp":         time.Now().Unix(),
	})
}

// RedeemBasket handles basket redemption
func (bh *BasketHandler) RedeemBasket(c *gin.Context) {
	var req RedeemBasketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()

	// In production: call smart contract burn
	stablecoinReturned := req.BTokenAmount * 99 / 100

	// Log to HCS
	_, err := bh.hederaService.LogToHCS(ctx, bh.topicID, "BASKET_REDEMPTION", req.BasketID, c.ClientIP(), fmt.Sprintf("Redeemed %d bTokens", req.BTokenAmount))
	if err != nil {
		log.Printf("Warning: failed to log to HCS: %v", err)
	}

	c.JSON(200, gin.H{
		"basket_id":           req.BasketID,
		"btoken_burned":       req.BTokenAmount,
		"stablecoin_returned": stablecoinReturned,
		"timestamp":           time.Now().Unix(),
	})
}

// DepositFeederLiquidity handles feeder stablecoin deposits
func (bh *BasketHandler) DepositFeederLiquidity(c *gin.Context) {
	var req FeederVaultRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()

	vault, err := bh.vaultService.DepositStablecoin(ctx, req.FeederDID, req.StablecoinAmount)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Log to HCS
	_, err = bh.hederaService.LogToHCS(ctx, bh.topicID, "FEEDER_DEPOSIT", 0, req.FeederDID, fmt.Sprintf("Deposited %d stablecoins", req.StablecoinAmount))
	if err != nil {
		log.Printf("Warning: failed to log to HCS: %v", err)
	}

	c.JSON(201, gin.H{
		"feeder_did":     vault.FeederDID,
		"balance":        vault.StablecoinBalance,
		"deposit_amount": req.StablecoinAmount,
		"timestamp":      time.Now().Unix(),
	})
}

// WithdrawFeederLiquidity handles feeder withdrawals
func (bh *BasketHandler) WithdrawFeederLiquidity(c *gin.Context) {
	feederDID := c.Query("feeder_did")
	withdrawAmount, _ := strconv.ParseUint(c.Query("amount"), 10, 64)

	ctx := c.Request.Context()

	vault, err := bh.vaultService.WithdrawStablecoin(ctx, feederDID, withdrawAmount)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Log to HCS
	_, err = bh.hederaService.LogToHCS(ctx, bh.topicID, "FEEDER_WITHDRAWAL", 0, feederDID, fmt.Sprintf("Withdrew %d stablecoins", withdrawAmount))
	if err != nil {
		log.Printf("Warning: failed to log to HCS: %v", err)
	}

	c.JSON(200, gin.H{
		"feeder_did":        vault.FeederDID,
		"balance":           vault.StablecoinBalance,
		"withdrawal_amount": withdrawAmount,
		"timestamp":         time.Now().Unix(),
	})
}

// GetFeederVault retrieves feeder vault info
func (bh *BasketHandler) GetFeederVault(c *gin.Context) {
	feederDID := c.Query("feeder_did")

	vault, err := bh.vaultService.GetVault(feederDID)
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, vault)
}
