package portfolio

import "time"



type BasketToken struct {
	Ticker       string  `bson:"ticker" json:"ticker"`
	Name         string  `bson:"name" json:"name"`
	Quantity     float64 `bson:"quantity" json:"quantity"`
	Weight       float64 `bson:"weight" json:"weight"`
	Price        float64 `bson:"price" json:"price"`
	IsNative     bool    `bson:"isNative" json:"isNative"`
	TokenAddress string  `bson:"tokenAddress" json:"tokenAddress"`
}

type BasketCatalogue struct {
	ID                string        `bson:"id" json:"id"`
	BasketReferenceId string        `bson:"basketReferenceId" json:"basketReferenceId"`
	Name              string        `bson:"name" json:"name"`
	Description       string        `bson:"description" json:"description"`
	Creator           string        `bson:"creator" json:"creator"`
	UserId            string        `bson:"userId" json:"userId"`
	Performance7d     float64       `bson:"performance7d" json:"performance7d"`
	Performance30d    float64       `bson:"performance30d" json:"performance30d"`
	Holders           int           `bson:"holders" json:"holders"`
	Category          string        `bson:"category" json:"category"`
	Tokens            []BasketToken `bson:"tokens" json:"tokens"`
	Image             string        `bson:"image" json:"image"`
	Symbol            string        `bson:"symbol" json:"symbol"`
	URI               string        `bson:"uri,omitempty" json:"uri,omitempty"`
	Address           string        `bson:"address,omitempty" json:"address,omitempty"`
	CreatedAt         time.Time     `bson:"createdAt"`
	UpdatedAt         time.Time     `bson:"updatedAt"`
}