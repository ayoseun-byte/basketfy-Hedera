package models


// Define a new struct type with JSON tags
type TokenInfo struct {
	TokenName    string  `json:"token_name"`
	Ticker       string  `json:"ticker"`
	ClosingPrice float64 `json:"closing_price"`
	TargetWeight float64 `json:"target_weight"`
}

type RebalanceRequest struct {
	UserId        string `json:"userId,omitempty" validate:"required"`
	SessionId     string `json:"sessionId,omitempty"`
	BasketDataId  string `json:"basketDataId,omitempty"`
}

type RebalanceResponse struct {
	Performance        string 
	RiskAssessment     string
	RebalancingSuggestion string
}