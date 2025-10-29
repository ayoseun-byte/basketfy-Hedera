package tools

import (
	"basai/domain/ai/utilities"
	"basai/infrastructure/trading"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"sync"
	"time"
)

type portfolioToken struct {
	Name              string  `json:"name"`
	Ticker            string  `json:"ticker"`
	TokenAddress      string  `json:"tokenAddress"`
	ClosingPrice      float64 `json:"closing_price"`
	Quantity          float64 `json:"quantity"`
	UserWalletAddress string  `json:"userWalletAddress"`
	TargetWeight      float64 `json:"target_weight"`
}

type TempRebalanceResult struct {
	Ticker            string  `json:"ticker"`
	TokenAddress      string  `json:"tokenAddress"`
	CurrentValue      float64 `json:"current_value"`
	ActualWeight      float64 `json:"actual_weight"`
	TargetWeight      float64 `json:"target_weight"`
	UserWalletAddress string  `json:"userWalletAddress"`
	Deviation         float64 `json:"deviation"`
	Action            string  `json:"action"` // "swap-in", "swap-out", or "hold"
	NeedOffset        bool
}

type RebalanceResult struct {
	Ticker                  string  `json:"ticker"`
	TokenAddress            string  `json:"tokenAddress"`
	UserWalletAddress       string  `json:"userWalletAddress"`
	CurrentValue            float64 `json:"current_value"`
	ActualWeight            float64 `json:"actual_weight"`
	TargetWeight            float64 `json:"target_weight"`
	Deviation               float64 `json:"deviation"`
	Action                  string  `json:"action"` // "swap-in", "swap-out", or "hold"
	NeededRebalanceQuotient float64
	QuantityToPurchase      float64 // should be currentValue divided by neededRebalanceQuotient
	TimeStamp               string  `json:"timeStamp"`
}

type SwapAction struct {
	FromToken          string  `json:"from_token"`
	ToToken            string  `json:"to_token"`
	FromTokenAddress   string  `json:"fromTokenAddress"`
	ToTokenAddress     string  `json:"toTokenAddress"`
	QuantityToPurchase float64 `json:"quantity_to_purchase"`
	UserWalletAddress  string  `json:"userWalletAddress"`
	ActualWeight       float64 `json:"actual_weight"`
	TargetWeight       float64 `json:"target_weight"`
	TimeStamp          string  `json:"timeStamp"`
}

type portfolioType struct {
	Name   string  `json:"name"`
	Price  float64 `json:"closing_price"`
	Ticker string  `json:"ticker"`
	Weight float64 `json:"weight"`
}

func roundTo(val float64, places int) float64 {
	factor := math.Pow(10, float64(places))
	return math.Round(val*factor) / factor
}

func computeTokenWeight(portfolio string) ([]SwapAction, error) {
	var (
		tempResults         []TempRebalanceResult
		results             []RebalanceResult
		swapAction          []SwapAction
		tokenPortfolio      []portfolioToken
		tolerance           float64              = 0.03
		service             trading.PriceService = &trading.Client{}
		offsetValues        []float64
		swapInTicker        string
		swapInTickerAddress string
		offsetValue         float64
		swapInCount         int
		totalValue          float64
		quantityToPurchase  float64
		mu                  sync.Mutex
		wg                  sync.WaitGroup
		errChan             = make(chan error, len(tokenPortfolio))
		priceData           struct {
			Solana struct {
				Usd float64 `json:"usd"`
			} `json:"solana"`
		}
	)
	if err := json.Unmarshal([]byte(portfolio), &tokenPortfolio); err != nil {
		// Handle error if unmarshalling fails
		return nil, err
	}

	// Step 1: Compute total portfolio value
	for i := range tokenPortfolio {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			ticker := tokenPortfolio[i].Ticker
			price, err := service.GetOKXPriceWithFallback(ticker)
			if err != nil {
				errChan <- fmt.Errorf("Error fetching prices for %s: %v", ticker, err)
				return
			}

			respData, err := json.Marshal(price)
			if err != nil {
				errChan <- fmt.Errorf("Error marshalling prices for %s: %v", ticker, err)
				return
			}

			err = json.Unmarshal(respData, &priceData)
			if err != nil {
				errChan <- fmt.Errorf("Error unmarshalling price data for %s: %v", ticker, err)
				return
			}

			mu.Lock()
			tokenPortfolio[i].ClosingPrice = priceData.Solana.Usd
			totalValue += priceData.Solana.Usd * tokenPortfolio[i].Quantity
			mu.Unlock()
		}(i)
	}

	wg.Wait()
	close(errChan)
	for err := range errChan {
		if err != nil {
			log.Fatal(err)
		}
	}

	// Step 2: Compute rebalance info per token
	for _, token := range tokenPortfolio {
		currentValue := token.ClosingPrice * token.Quantity
		actualWeight := currentValue / totalValue
		deviation := actualWeight - token.TargetWeight

		action := "hold"
		needOffSet := false
		if deviation > tolerance {
			action = "swap-in" // swap-in ticker is the ticker that is performing
			offsetValues = append(offsetValues, deviation)
		} else if deviation < -tolerance {
			action = "swap-out" // swap-out is the ticker to swap away
			needOffSet = true
		}

		result := TempRebalanceResult{
			Ticker:            token.Ticker,
			UserWalletAddress: token.UserWalletAddress,
			TokenAddress:      token.TokenAddress,
			CurrentValue:      roundTo(currentValue, 2),
			ActualWeight:      roundTo(actualWeight, 4),
			TargetWeight:      token.TargetWeight,
			Deviation:         roundTo(deviation, 4),
			Action:            action,
			NeedOffset:        needOffSet,
		}

		tempResults = append(tempResults, result)
	}

	// Step 3: Count swap-in tokens and distribute offset
	if len(offsetValues) > 1 {
		// Find the max value in offsetValues
		max := offsetValues[0]
		for _, v := range offsetValues[1:] {
			if v > max {
				max = v
			}
		}
		offsetValue = max
	} else if len(offsetValues) == 1 {
		offsetValue = offsetValues[0]
	} else {
		offsetValue = 0
	}

	for _, temp := range tempResults {
		if temp.NeedOffset {
			swapInCount++
		}

		if temp.Action == "swap-in" && roundTo(temp.Deviation, 3) == roundTo(offsetValue, 3) {
			swapInTicker = temp.Ticker
			swapInTickerAddress = temp.TokenAddress
		}
	}

	// Prevent divide-by-zero
	if swapInCount == 0 {
		swapInCount = 1
	}

	neededRebalanceQuotient := offsetValue / float64(swapInCount) // this quotient will be used as the value by which each weight for swap-out token will be increased

	// Step 4: Construct final results with quantity to purchase
	for _, temp := range tempResults {
		if temp.Action == "swap-in" {
			continue
		}
		if temp.Action == "swap-out" {
			quantityToPurchase = temp.CurrentValue / neededRebalanceQuotient
		}
		results = append(results, RebalanceResult{
			Ticker:                  temp.Ticker,
			TokenAddress:            temp.TokenAddress,
			UserWalletAddress:       temp.UserWalletAddress,
			CurrentValue:            temp.CurrentValue,
			ActualWeight:            temp.ActualWeight,
			TargetWeight:            temp.TargetWeight,
			Deviation:               temp.Deviation,
			Action:                  temp.Action,
			NeededRebalanceQuotient: roundTo(neededRebalanceQuotient, 4),
			QuantityToPurchase:      roundTo(quantityToPurchase, 6),
			TimeStamp:               time.Now().Format(time.RFC3339),
		})
		swapAction = append(swapAction, SwapAction{
			FromToken:          swapInTicker,
			FromTokenAddress:   swapInTickerAddress,
			ToToken:            temp.Ticker,
			UserWalletAddress:  temp.UserWalletAddress,
			ToTokenAddress:     temp.TokenAddress,
			ActualWeight:       temp.ActualWeight,
			TargetWeight:       temp.TargetWeight,
			QuantityToPurchase: roundTo(quantityToPurchase, 6),
			TimeStamp:          time.Now().Format(time.RFC3339),
		})
	}
	return swapAction, nil
}

func ComputeTokenWeightTool() map[string]BasaiTool {

	desc := `
	### Usage Guidelines
	Input type: List e.g [{"name":"Compound","userWalletAddress": "7RE4Ka5KWbPA371dxTcv6qBX9ay9CPFerftr3Psyf","closing_price":78,"quantity": 200,"ticker":"UNI","tokenAddress":"xxxxxx0000x0xxx","target_weight":0.65},{"name":"Aave","closing_price":90.1,"userWalletAddress": "7RE4Ka5KWbPA371dxTcv6qBX9ay9CPFerftr3Psyf","quantity": 60,"ticker":"AAVE","tokenAddress":"x0024234f3we53","target_weight":0.35}]
	
	1. Use this tool to compute the weight of a token based on current market price.
	2. Input to this tool should be a List of portfolio tokens in json schema to perform the computation.
	3. Avoid repeated computations for the same token unless necessary.
	4. DO NOT ESCAPE CHARACTERS
	5. DO NOT CREATE multiple inputs, put all token objects in one array
	6. Input must be a valid JSON to avoid breaking the marshal process.
	7. This tool is a web3 algorithm, the feedback must be domain-inclined and informative.

	This tool responds with:
	- A confirmation of the token weight computed
	- The computed weight value
	- Timestamp of execution
	`

	return map[string]BasaiTool{
		"CalculateCurrentValueAndWeights": {
			Name:        "CalculateCurrentValueAndWeights",
			IntentId:    "793695109",
			Description: desc,
			ToolFunc: func(query, toolName string, toolsMeta map[string]interface{}) (string, any, NotePad) {
				// respData := []byte(`[{"from_token":"AAVE","to_token":"ETH","userWalletAddress": "7RE4Ka5KWbPA371dxTcv6qBX9ay9CPFerftr3Psyf","fromTokenAddress":"0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9","toTokenAddress":"0x0000000000000000000000000000000000000000","quantity_to_purchase":140291.970183,"actual_weight":0.2591,"target_weight":0.4,"timeStamp":"2025-06-03T01:39:40+01:00"},{"from_token":"AAVE","to_token":"MKR","userWalletAddress": "7RE4Ka5KWbPA371dxTcv6qBX9ay9CPFerftr3Psyf","fromTokenAddress":"0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9","toTokenAddress":"0x9f8F72aA9304c8B593d555F12ef6589cC3A579A2","quantity_to_purchase":10960.338397,"actual_weight":0.0202,"target_weight":0.2,"timeStamp":"2025-06-03T01:39:40+01:00"}]`)
				var (
					resp any
					err  error
				)
				resp, err = computeTokenWeight(query)
				respData, err := json.Marshal(resp)
				if err != nil {
					print(err.Error())
					return "", nil, NotePad{}
				}
				utilities.Printer("\n\nCalculateCurrentValueAndWeights Result: ", string(respData), "gold")
				return string(respData), resp, NotePad{
					Action: "CalculateCurrentValueAndWeights",
					Body:   string(respData),
				}

			},
		},
	}
}
