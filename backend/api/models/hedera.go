package models

type CreateBasketPayload struct {
	Name               string   `json:"name" binding:"required"`
	Theme              string   `json:"theme" binding:"required"`
	Tokens             []string `json:"tokens" binding:"required"`
	Weights            []int    `json:"weights" binding:"required"`
	RebalanceFrequency int64    `json:"rebalance_frequency" binding:"required"`
	FeePercentage      int      `json:"fee_percentage"`
	TokenName          string   `json:"token_name" binding:"required"`
	TokenSymbol        string   `json:"token_symbol" binding:"required"`
}

type BasketPurchasePayload struct {
	BasketID         uint64 `json:"basket_id" binding:"required"`
	Stablecoin       string `json:"stablecoin" binding:"required"`
	StablecoinAmount uint64 `json:"stablecoin_amount" binding:"required"`
	UserAddress      string `json:"user_address" binding:"required"`
}

type BasketRedemptionPayload struct {
	BasketID     uint64 `json:"basket_id" binding:"required"`
	Stablecoin   string `json:"stablecoin" binding:"required"`
	BTokenAmount uint64 `json:"btoken_amount" binding:"required"`
	UserAddress  string `json:"user_address" binding:"required"`
}

type RebalancePayload struct {
	BasketID   uint64 `json:"basket_id" binding:"required"`
	NewWeights []int  `json:"new_weights" binding:"required"`
	CuratorDID string `json:"curator_did" binding:"required"`
}

type FeederDepositPayload struct {
	FeederDID        string `json:"feeder_did" binding:"required"`
	StablecoinAmount uint64 `json:"stablecoin_amount" binding:"required"`
	Stablecoin       string `json:"stablecoin" binding:"required"`
}

type FeederWithdrawalPayload struct {
	FeederDID        string `json:"feeder_did" binding:"required"`
	WithdrawalAmount uint64 `json:"withdrawal_amount" binding:"required"`
	Stablecoin       string `json:"stablecoin" binding:"required"`
}

type BasketInfo struct {
	BasketID         uint64   `json:"basket_id"`
	Name             string   `json:"name"`
	Theme            string   `json:"theme"`
	BTokenID         string   `json:"btoken_id"`
	NFTID            string   `json:"nft_id"`
	Tokens           []string `json:"tokens"`
	Weights          []int    `json:"weights"`
	TotalValueLocked uint64   `json:"total_value_locked"`
	CreatedAt        int64    `json:"created_at"`
}

type FeederVaultInfo struct {
	FeederDID          string `json:"feeder_did"`
	StablecoinBalance  uint64 `json:"stablecoin_balance"`
	YieldEarned        uint64 `json:"yield_earned"`
	DepositTimestamp   int64  `json:"deposit_timestamp"`
	LastWithdrawalTime int64  `json:"last_withdrawal_time"`
}

type AuditLogEntry struct {
	Timestamp int64  `json:"timestamp"`
	EventType string `json:"event_type"`
	BasketID  uint64 `json:"basket_id"`
	Actor     string `json:"actor"`
	Amount    uint64 `json:"amount"`
	Details   string `json:"details"`
	TxHash    string `json:"tx_hash"`
}
