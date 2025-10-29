package models

type TotalValue struct {
	Value float64 `json:"value"`
	Today float64 `json:"today"`
}
type TokenTrend struct {
	Ticker string  `json:"ticker"`
	Name   string  `json:"name"`
	Data  []struct {
		Date  string  `json:"date"`
		Value float64 `json:"value"`
	} `json:"data"`
}


type PortfolioValueChart struct {
	Trend string `json:"trend"`
	TokenTrend []TokenTrend  `json:"tokenTrend"`
}

type PortfolioStatistics struct {
	Created           string  `json:"created"`
	TotalTransactions int     `json:"totalTransactions"`
	AverageHoldTime   string  `json:"averageHoldTime"`
	BestPerformer     string  `json:"bestPerformer"`
	CorrelationToBTC  float64 `json:"correlationToBTC"`
	MaxDrawdown       float64 `json:"maxDrawdown"`
}

type AnalyticsResponse struct {
	Name                string                `json:"name"`
	TotalValue          TotalValue            `json:"totalValue"`
	SevenDaysReturns    float64               `json:"sevenDaysReturns"`
	RiskScore           float64               `json:"riskScore"`
	SharpeRatio         float64               `json:"sharpeRatio"`
	Volatility          float64               `json:"volatility"`
	PortfolioValueChart []PortfolioValueChart `json:"portfolioValueChart"`
	PortfolioStatistics PortfolioStatistics `json:"portfolioStatistics"`
}
