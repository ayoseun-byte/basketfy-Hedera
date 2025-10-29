package models

type BasketItem struct {
	Token        string  `json:"token,omitempty" validate:"required"`
	TokenSymbol  string  `json:"tokenSymbol,omitempty" validate:"required"`
	EntryPrice   float64 `json:"entryPrice,omitempty" validate:"required"`
	Description  string  `json:"description,omitempty"`
	Weight       float64 `json:"weight,omitempty"`
	IsNative     bool    `json:"isNative"`
	TokenAddress string  `json:"tokenAddress"`
}

type BasketData struct {
	BasketName        string       `json:"basketName,omitempty"`
	BasketReferenceId string       `json:"basketReferenceId"`
	Description       string       `json:"description,omitempty"`
	Category          string       `json:"category"`
	Image             string       `json:"image,omitempty"`
	CreatedBy         string       `json:"createdBy,omitempty"`
	TotalWeight       float64      `json:"totalWeight,omitempty"`
	InvestmentAmount  float64      `json:"investmentAmount"`
	Tokens            []BasketItem `json:"tokens" validate:"required,dive"`
}

type BuyBasketRequest struct {
	UserId     string     `json:"userId,omitempty"`
	SessionId  string     `json:"sessionId,omitempty"`
	BasketData BasketData `json:"basketData" validate:"required"`
}

type UserBasketRequest struct {
	UserId   string `json:"userId"`
	BasketId string `json:"basketId"`
}

type BasketResponse struct {
	Status  int64       `json:"status"`
	Message string      `json:"message"`
	Result  interface{} `json:"result"`
}

type AllBasketResponse struct {
	Status  int64       `json:"status"`
	Message string      `json:"message"`
	Result  interface{} `json:"result"`
}
