
package main

import (
	"basai/config"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/gagliardetto/solana-go/rpc"
)

// Constants
const (
	NATIVE_SOL      = "11111111111111111111111111111111"
	WRAPPED_SOL     = "So11111111111111111111111111111111111111112"
	USDC_SOL        = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
	ETH             = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
	SOLANA_CHAIN_ID = "501"
	COMPUTE_UNITS   = 300000
	MAX_RETRIES     = 3
	BASE_URL        = "https://www.okx.com"
)

// Client represents the OKX DEX client
type Client struct {
	APIKey         string
	SecretKey      string
	APIPassphrase  string
	ProjectID      string
	Connection     *rpc.Client
	HTTPClient     *http.Client
}

// NewClient creates a new OKX DEX client
func NewClient() (*Client, error) {
	apiKey := config.AppConfig.OKXAPIKey
	secretKey := config.AppConfig.OKXSecret
	apiPassphrase := config.AppConfig.OKXPassphrase
	projectID := config.AppConfig.OKXProjectID

	if apiKey == "" || secretKey == "" || apiPassphrase == "" || projectID == "" {
		return nil, fmt.Errorf("missing required environment variables")
	}


	return &Client{
		APIKey:         apiKey,
		SecretKey:      secretKey,
		APIPassphrase:  apiPassphrase,
		ProjectID:      projectID,
		HTTPClient:     &http.Client{Timeout: 30 * time.Second},
	}, nil
}

// getHeaders generates the required headers for OKX API authentication
func (c *Client) getHeaders(timestamp, method, requestPath, queryString, body string) map[string]string {
	stringToSign := timestamp + method + requestPath + queryString + body
	
	mac := hmac.New(sha256.New, []byte(c.SecretKey))
	mac.Write([]byte(stringToSign))
	signature := base64.StdEncoding.EncodeToString(mac.Sum(nil))

	return map[string]string{
		"Content-Type":         "application/json",
		"OK-ACCESS-KEY":        c.APIKey,
		"OK-ACCESS-SIGN":       signature,
		"OK-ACCESS-TIMESTAMP":  timestamp,
		"OK-ACCESS-PASSPHRASE": c.APIPassphrase,
		"OK-ACCESS-PROJECT":    c.ProjectID,
	}
}


// QuoteParams represents parameters for getting a quote
type QuoteParams struct {
	Amount           string `json:"amount"`
	FromTokenAddress string `json:"fromTokenAddress"`
	ToTokenAddress   string `json:"toTokenAddress"`
	Slippage         string `json:"slippage,omitempty"`
}

// QuoteResponse represents the response from quote API
type QuoteResponse struct {
	Code string `json:"code"`
	Msg  string `json:"msg"`
	Data []struct {
		RouterResult struct {
			ToTokenAmount string `json:"toTokenAmount"`
		} `json:"routerResult"`
		TX struct {
			Data string `json:"data"`
		} `json:"tx"`
	} `json:"data"`
}

// GetQuote gets a quote for token swap
func (c *Client) GetQuote(params QuoteParams) (*QuoteResponse, error) {
	if params.Amount == "" || params.FromTokenAddress == "" || params.ToTokenAddress == "" {
		return nil, fmt.Errorf("missing required parameters for quote")
	}

	timestamp := time.Now().UTC().Format(time.RFC3339)
	
	if params.Slippage == "" {
		params.Slippage = "0.05"
	}

	urlParams := url.Values{
		"chainId":          {SOLANA_CHAIN_ID},
		"amount":           {params.Amount},
		"fromTokenAddress": {params.FromTokenAddress},
		"toTokenAddress":   {params.ToTokenAddress},
		"slippage":         {params.Slippage},
	}

	requestPath := "/api/v5/dex/aggregator/quote"
	queryString := "?" + urlParams.Encode()
	headers := c.getHeaders(timestamp, "GET", requestPath, queryString, "")

	req, err := http.NewRequest("GET", BASE_URL+requestPath+queryString, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	for key, value := range headers {
		req.Header.Set(key, value)
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get quote: %s", string(body))
	}

	var result QuoteResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	if len(result.Data) == 0 {
		return nil, fmt.Errorf("no quote data received")
	}

	return &result, nil
}

// TokenResponse represents the response from all-tokens API
type TokenResponse struct {
	Code string `json:"code"`
	Msg  string `json:"msg"`
	Data []struct {
		TokenName         string `json:"tokenName"`
		TokenContractAddr string `json:"tokenContractAddr"`
		TokenSymbol       string `json:"tokenSymbol"`
	} `json:"data"`
}





// Example usage
func main() {
	client, err := NewClient()
	if err != nil {
		fmt.Printf("Failed to create client: %v\n", err)
		return
	}

	// Example: Get quote
	quote, err := client.GetQuote(QuoteParams{
		Amount:           "1000000", // 1 SOL in lamports
		FromTokenAddress: NATIVE_SOL,
		ToTokenAddress:   USDC_SOL,
		Slippage:         "0.05",
	})
	if err != nil {
		fmt.Printf("Failed to get quote: %v\n", err)
		return
	}

	fmt.Printf("Quote received: %+v\n", quote)

	// // Example: Get all tokens
	// tokens, err := client.GetBatchToken()
	// if err != nil {
	// 	fmt.Printf("Failed to get tokens: %v\n", err)
	// 	return
	// }

	// fmt.Printf("Found %d tokens\n", len(tokens.Data))

	// // Example: Get liquidity
	// liquidity, err := client.GetLiquidity(LiquidityParams{})
	// if err != nil {
	// 	fmt.Printf("Failed to get liquidity: %v\n", err)
	// 	return
	// }

	// fmt.Printf("Liquidity sources: %+v\n", liquidity)
}