package portfolio

import "time"

type TokenInfo struct {
	Name         string  `bson:"name" json:"name"`
	Symbol       string  `bson:"symbol" json:"symbol"`
	Amount       float64 `bson:"amount" json:"amount"`
	Quantity     float64 `bson:"quantity" json:"quantity"`
	EntryPrice   float64 `bson:"entryPrice" json:"entry_price"`
	ClosingPrice float64 `bson:"closingPrice" json:"closing_price"`
	Description  string  `bson:"description" json:"description"`
	Weight       float64 `bson:"weight" json:"weight"`
	IsNative     bool    `bson:"isNative" json:"isNative"`
	TokenAddress string  `bson:"tokenAddress" json:"tokenAddress"`
}

type BasketInvestment struct {
	BasketName             string      `bson:"basketName" json:"basketName"`
	BasketReferenceId      string      `bson:"basketReferenceId" json:"basketReferenceId"`
	TokenInfo              []TokenInfo `bson:"tokens" json:"tokens"`
	AllowedRebalance       bool        `bson:"allowedRebalance" json:"allowedRebalance"`
	TotalRebalanceSessions int         `bson:"totalRebalanceSessions" json:"totalRebalanceSessions"`
	TotalWeight            float64     `bson:"totalWeight" json:"totalWeight"`
	Image                  string      `bson:"image" json:"image"`
	Category               string      `bson:"category" json:"category"`
	Description            string      `bson:"description" json:"description"`
	RiskScore              float64     `bson:"riskScore" json:"riskScore"`
	CreatedAt              time.Time   `bson:"created_at"`
	UpdatedAt              time.Time   `bson:"updated_at"`
}

type UserBasket struct {
	UserId            string             `bson:"userId" json:"user_id"`
	BasketInvestments []BasketInvestment `bson:"basketInvestments" json:"basketInvestments"`
	CreatedAt         time.Time          `bson:"createdAt"`
	UpdatedAt         time.Time          `bson:"updatedAt"`
}

type Portfolio struct {
	UserId string `bson:"userId" json:"userId"`
	Tokens []struct {
		Name         string  `bson:"name" json:"name"`
		Symbol       string  `bson:"symbol" json:"symbol"`
		EntryPrice   float64 `bson:"entryPrice" json:"entryPrice"`
		ClosingPrice float64 `bson:"closingPrice" json:"closingPrice"`
	} `bson:"tokens" json:"tokens"`
	AssignToAI bool `bson:"assignToAI" json:"assignToAI"`
}
