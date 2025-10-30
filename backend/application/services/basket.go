package services

import "context"

type BasketConfig struct {
	Name               string   `json:"name"`
	Theme              string   `json:"theme"`
	Tokens             []string `json:"tokens"`
	Weights            []int    `json:"weights"`
	RebalanceFrequency int64    `json:"rebalance_frequency"`
	FeePercentage      int      `json:"fee_percentage"`
}

type CreateBasketRequest struct {
	Name               string   `json:"name" binding:"required"`
	Theme              string   `json:"theme" binding:"required"`
	Tokens             []string `json:"tokens" binding:"required"`
	Weights            []int    `json:"weights" binding:"required"`
	RebalanceFrequency int64    `json:"rebalance_frequency" binding:"required"`
	FeePercentage      int      `json:"fee_percentage"`
	TokenName          string   `json:"token_name" binding:"required"`
	TokenSymbol        string   `json:"token_symbol" binding:"required"`
}

type BuyBasketRequest struct {
	BasketID         uint64 `json:"basket_id" binding:"required"`
	Stablecoin       string `json:"stablecoin" binding:"required"`
	StablecoinAmount uint64 `json:"stablecoin_amount" binding:"required"`
}

type RedeemBasketRequest struct {
	BasketID     uint64 `json:"basket_id" binding:"required"`
	Stablecoin   string `json:"stablecoin" binding:"required"`
	BTokenAmount uint64 `json:"btoken_amount" binding:"required"`
}

type RebalanceRequest struct {
	BasketID   uint64 `json:"basket_id" binding:"required"`
	NewWeights []int  `json:"new_weights" binding:"required"`
}

type BasketResponse struct {
	BasketID         uint64       `json:"basket_id"`
	BTokenAddress    string       `json:"btoken_address"`
	NFTAddress       string       `json:"nft_address"`
	Config           BasketConfig `json:"config"`
	TotalValueLocked uint64       `json:"total_value_locked"`
	CreatedAt        int64        `json:"created_at"`
}

type HCSAuditLog struct {
	Timestamp int64  `json:"timestamp"`
	EventType string `json:"event_type"`
	BasketID  uint64 `json:"basket_id"`
	Actor     string `json:"actor"`
	Amount    uint64 `json:"amount"`
	Details   string `json:"details"`
}

// CreateBasketTokens creates both bToken (fungible) and Basket NFT
func (hs *HederaClient) CreateBasketTokens(
	ctx context.Context,
	basketName string,
	tokenName string,
	tokenSymbol string,
) (string, string, error) {

	// Create bToken (fungible token)
	bTokenID, err := hs.CreateFungibleToken(ctx, tokenName, tokenSymbol)
	if err != nil {
		return "", "", err
	}

	// Create Basket Identity NFT
	nftID, err := hs.CreateNonFungibleToken(ctx, basketName, "BASKET_NFT")
	if err != nil {
		return "", "", err
	}

	return bTokenID.String(), nftID.String(), nil
}
