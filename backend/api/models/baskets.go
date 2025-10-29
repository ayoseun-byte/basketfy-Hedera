package models

type Token struct {
	Ticker string  `json:"ticker"`
	Name   string  `json:"name"`
	Weight float64     `json:"weight"`
	Price  float64 `json:"price"`
	IsNative bool `json:"isNative"`
	TokenAddress string `json:"tokenAddress"`
}

type CreateBasketRequest struct {
	BasketReferenceId string `json:"basketReferenceId"`
	Category      string     `json:"category"`
	Name          string     `json:"name" validate:"required"`
	Description   string     `json:"description"`
	Creator       string     `json:"creator" validate:"required"`
	UserId       string     `json:"userId" validate:"required"`
	Image         string     `json:"image"`
	Tokens         []Token `json:"tokens"`
	Symbol string `json:"symbol"`
	URI string `json:"uri,omitempty"`
	Address string `json:"address,omitempty"`
}

type Allbasket struct{
Limit int64  `json:"limit,omitempty" validate:"required"`
}

type SingleBasketRequest struct{
	Id string  `json:"id"`
}