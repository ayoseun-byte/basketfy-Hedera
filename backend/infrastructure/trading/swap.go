package trading

import (
	"basai/config"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
)

// QuoteParams represents parameters for getting a quote
type QuoteParams struct {
	Amount            string `json:"amount"`
	FromTokenAddress  string `json:"fromTokenAddress"`
	ToTokenAddress    string `json:"toTokenAddress"`
	Slippage          string `json:"slippage,omitempty"`
	UserWalletAddress string `json:"userWalletAddress,omitempty"`
}
type DexProtocol struct {
	DexName string `json:"dexName"`
	Percent string `json:"percent"`
}
type SubRouterList struct {
	DexProtocol []DexProtocol `json:"dexProtocol"`
	FromToken   Token         `json:"fromToken"`
	ToToken     Token         `json:"toToken"`
}
type DexRouterList struct {
	Router        string          `json:"router"`
	RouterPercent string          `json:"routerPercent"`
	SubRouterList []SubRouterList `json:"subRouterList"`
}

type Tx struct {
	Data                 string   `json:"data"`
	From                 string   `json:"from"`
	Gas                  string   `json:"gas"`
	GasPrice             string   `json:"gasPrice"`
	MaxPriorityFeePerGas string   `json:"maxPriorityFeePerGas"`
	MinReceiveAmount     string   `json:"minReceiveAmount"`
	SignatureData        []string `json:"signatureData"`
	To                   string   `json:"to"`
	Value                string   `json:"value"`
}
type Token struct {
	Decimal              string `json:"decimal"`
	IsHoneyPot           bool   `json:"isHoneyPot"`
	TaxRate              string `json:"taxRate"`
	TokenContractAddress string `json:"tokenContractAddress"`
	TokenSymbol          string `json:"tokenSymbol"`
	TokenUnitPrice       string `json:"tokenUnitPrice"`
}

type QuoteCompareList struct {
	AmountOut string `json:"amountOut"`
	DexLogo   string `json:"dexLogo"`
	DexName   string `json:"dexName"`
	TradeFee  string `json:"tradeFee"`
}

type RouterResult struct {
	ChainID               string             `json:"chainId"`
	ChainIndex            string             `json:"chainIndex"`
	DexRouterList         []DexRouterList    `json:"dexRouterList"`
	EstimateGasFee        string             `json:"estimateGasFee"`
	FromToken             Token              `json:"fromToken"`
	FromTokenAmount       string             `json:"fromTokenAmount"`
	PriceImpactPercentage string             `json:"priceImpactPercentage"`
	QuoteCompareList      []QuoteCompareList `json:"quoteCompareList"`
	ToToken               Token              `json:"toToken"`
	ToTokenAmount         string             `json:"toTokenAmount"`
	TradeFee              string             `json:"tradeFee"`
}

type Data struct {
	RouterResult RouterResult `json:"routerResult"`
	Tx           Tx           `json:"tx"`
}

// QuoteResponse represents the response from quote API
type OKXSwapResponse struct {
	Code string `json:"code"`
	Data []Data `json:"data"`
	Msg  string `json:"msg"`
}

// formatAmount ensures the amount is a valid numeric string, preserving decimals, and strips leading zeros from the integer part.
func formatAmount(amount string) (string, error) {
	if amount == "" {
		return "", fmt.Errorf("amount is required")
	}

	// Remove all characters except digits and decimal point
	re := regexp.MustCompile(`[^\d.]`)
	numStr := re.ReplaceAllString(amount, "")

	if numStr == "" {
		return "", fmt.Errorf("amount must contain digits")
	}

	// Split into whole and fractional parts
	parts := strings.SplitN(numStr, ".", 2)
	wholePart := parts[0]

	// Manually trim leading zeros from wholePart
	wholePart = strings.TrimLeft(wholePart, "0")
	if wholePart == "" {
		wholePart = "0"
	}

	if len(parts) == 2 {
		fracPart := parts[1]
		return wholePart + "." + fracPart, nil
	}
	return wholePart, nil
}

// SwapService defines the interface for swap-related operations.
type SwapService interface {
	OKXSwapToken(params []QuoteParams) (OKXSwapResponse, error)
}

func (c *Client) OKXSwapToken(params []QuoteParams) (OKXSwapResponse, error) {
	var (
		swapResult OKXSwapResponse
		res        []interface{}
	)
	var lastErr error

	for _, qp := range params {
		operation := func() error {
			timestamp := time.Now().UTC().Format(time.RFC3339)

			if strings.Contains(timestamp, "+") { // Ensure Z for Zulu time
				timestamp = strings.Split(timestamp, "+")[0] + "Z"
			} else if !strings.HasSuffix(timestamp, "Z") {
				timestamp += "Z"
			}
			amount, amountErr := formatAmount(qp.Amount)
			if amountErr != nil {
				return fmt.Errorf("failed to format amount: %w", amountErr)
			}
			qp.Slippage = "0.005"
			// Prepare query parameters
			urlParams := url.Values{
				"chainIndex":        {SOLANA_CHAIN_ID},
				"amount":            {amount},
				"fromTokenAddress":  {qp.FromTokenAddress},
				"toTokenAddress":    {qp.ToTokenAddress},
				"slippage":          {qp.Slippage},
				"userWalletAddress": {qp.UserWalletAddress},
			}

			requestPath := "/api/v5/dex/aggregator/swap"
			queryString := "?" + urlParams.Encode()
			headers := c._getOKXHeaders(timestamp, "GET", requestPath, queryString, "")

			fullURL := fmt.Sprintf("%s%s%s", config.AppConfig.OKXURL, requestPath, queryString)
			// print("\n\n", fullURL, "\n")
			req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, fullURL, nil)
			if err != nil {
				return fmt.Errorf("failed to create request: %w", err)
			}

			for key, value := range headers {
				req.Header.Set(key, value)
			}

			ctx, cancel := context.WithTimeout(req.Context(), 15*time.Second)
			defer cancel()
			req = req.WithContext(ctx)

			client := &http.Client{}
			resp, err := client.Do(req)
			if err != nil {
				return fmt.Errorf("failed to send request: %w", err)
			}
			defer resp.Body.Close()

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				return fmt.Errorf("failed to read response body: %w", err)
			}

			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("all-tokens API request failed with status %d: %s", resp.StatusCode, string(body))
			}
			// fmt.Printf("\n\nbody %s\n\n", string(body))
			if err := json.Unmarshal(body, &swapResult); err != nil {
				return fmt.Errorf("failed to unmarshal response body: %w", err)
			}
			res = append(res, swapResult)
			return nil
		}

		// Use circuit breaker and retry up to 3 times
		_, err := cb.Execute(func() (interface{}, error) {
			return nil, retryWithLimit(operation, 3)
		})
		if err != nil {
			lastErr = err
		}
	}

	fmt.Printf("\n\nswap result %v+\n", res)
	if len(res) == 0 {
		swapResult = OKXSwapResponse{
			Code: "0",
			Data: []Data{{
				RouterResult{
					ChainID:    "1",
					ChainIndex: "1",
					DexRouterList: []DexRouterList{{
						Router:        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee--0x0000000000000000000000000000000000000000",
						RouterPercent: "100",
						SubRouterList: []SubRouterList{{
							DexProtocol: []DexProtocol{{
								DexName: "Uniswap V3",
								Percent: "100",
							}},
							FromToken: Token{
								Decimal:              "18",
								IsHoneyPot:           false,
								TaxRate:              "0",
								TokenContractAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
								TokenSymbol:          "AAVE",
								TokenUnitPrice:       "100",
							},
							ToToken: Token{
								Decimal:              "18",
								IsHoneyPot:           false,
								TaxRate:              "0",
								TokenContractAddress: "0x0000000000000000000000000000000000000000",
								TokenSymbol:          "ETH",
								TokenUnitPrice:       "3500",
							},
						}},
					}},
					EstimateGasFee: "120000",
					FromToken: Token{
						Decimal:              "18",
						IsHoneyPot:           false,
						TaxRate:              "0",
						TokenContractAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
						TokenSymbol:          "AAVE",
						TokenUnitPrice:       "100",
					},
					FromTokenAmount:       "1000000000000000000",
					PriceImpactPercentage: "0.002",
					QuoteCompareList: []QuoteCompareList{
						{
							AmountOut: "38000000000000000",
							DexLogo:   "https://dex.example.com/logo.png",
							DexName:   "Uniswap V3",
							TradeFee:  "0.01",
						},
					},
					ToToken: Token{
						Decimal:              "18",
						IsHoneyPot:           false,
						TaxRate:              "0",
						TokenContractAddress: "0x9f8F72aA9304c8B593d555F12ef6589cC3A579A2",
						TokenSymbol:          "MKR",
						TokenUnitPrice:       "2500",
					},
					ToTokenAmount: "0.038",
					TradeFee:      "0.01",
				},
				Tx{

					Data:                 "0x123456",
					From:                 "0xYourAddressHere",
					Gas:                  "210000",
					GasPrice:             "30000000000",
					MaxPriorityFeePerGas: "2000000000",
					MinReceiveAmount:     "37000000000000000",
					SignatureData:        []string{""},
					To:                   "0xRouterAddress",
					Value:                "1000000000000000000",
				},
			}},
			Msg: "",
		}

		// // Print JSON
		// jsonBytes, err := json.MarshalIndent(swapResult, "", "  ")
		// if err != nil {
		// 	fmt.Printf("\n\nerr result %v+", err)
		// }
		// fmt.Printf("\n\nswap result %s", string(jsonBytes))
	}
	return swapResult, lastErr
}
