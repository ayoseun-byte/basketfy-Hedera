package trading

import (
	"basai/config"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/cenkalti/backoff/v4"
	"github.com/sony/gobreaker"
)

// HTTPClient with timeout
var httpClient = &http.Client{
	Timeout: 5 * time.Second,
}

// Circuit Breaker config
var cb = gobreaker.NewCircuitBreaker(gobreaker.Settings{
	Name:        "TRADING_SERVICE",
	MaxRequests: 3,
	Interval:    10 * time.Second,
	Timeout:     30 * time.Second,
})

// retryWithLimit retries the given operation up to maxRetries times with exponential backoff.
func retryWithLimit(operation func() error, maxRetries int) error {
	b := backoff.NewExponentialBackOff()
	b.MaxElapsedTime = 0 // We'll control retries by count, not time

	var lastErr error
	for i := 0; i < maxRetries; i++ {
		if err := operation(); err != nil {
			lastErr = err
			// Wait for the next backoff duration
			time.Sleep(b.NextBackOff())
			continue
		}
		return nil
	}
	return lastErr
}

const (
	NATIVE_SOL      = "11111111111111111111111111111111"
	WRAPPED_SOL     = "So11111111111111111111111111111111111111112"
	USDC_SOL        = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
	ETH             = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
	SOLANA_CHAIN_ID string = "501"
)

type priceData struct{
	Solana struct{
		Usd float64 `json:"usd"`
	} `json:"solana"`
}

// PriceService defines the interface for price-related operations.
type PriceService interface {
	GetCoinGeckoPrice(cryptoAddress string) (priceData, error)
	GetAllTokensOnChain(chainIndex string) (map[string]interface{}, error)
	GetOKXPrice(cryptoAddress string) (map[string]interface{}, error)
	GetOKXPriceWithFallback(cryptoAddress string) (interface{}, error)
}

// Client represents the OKX DEX client and implements PriceService.
type Client struct {
	APIKey         string
	SecretKey      string
	APIPassphrase  string
	ProjectID      string
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

func (c *Client) _getOKXHeaders(timestamp, method, requestPath, queryString, body string) map[string]string {
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

func (c *Client) GetCoinGeckoPrice(cryptoAddress string) (priceData, error) {
	print("\ncalling coingeck\n\n")
	var priceData priceData

	operation := func() error {
		baseURL := fmt.Sprintf("%s/api/v3/simple/price", config.AppConfig.PRICEURL)

		// Prepare query parameters
		params := url.Values{}
		params.Set("vs_currencies", "usd")
		params.Set("ids", "solana")
		// params.Set("category", "layer-1")
		// params.Set("per_page", "100")
		params.Set("symbols", cryptoAddress)
		params.Set("precision", "full")
		fullURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

		req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, fullURL, nil)
		if err != nil {
			return fmt.Errorf("failed to create request: %w", err)
		}

		req.Header.Set("Accept", "application/json")
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("x-cg-api-key", "CG-DzJz2MeUnCRdjBGqpiFMTyaM")

		ctx, cancel := context.WithTimeout(req.Context(), 5*time.Second)
		defer cancel()
		req = req.WithContext(ctx)

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return fmt.Errorf("failed to send request: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			return fmt.Errorf("unexpected status code: %d, body: %s, config url: %s", resp.StatusCode, string(body), config.AppConfig.OKXURL)
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("failed to read response body: %w", err)
		}

		if err := json.Unmarshal(body, &priceData); err != nil {
			return fmt.Errorf("failed to unmarshal response body: %w", err)
		}

		return nil
	}

	// Use circuit breaker and retry up to 3 times
	_, err := cb.Execute(func() (interface{}, error) {
		return nil, retryWithLimit(operation, 3)
	})

	return priceData, err
}

func (c *Client) GetAllTokensOnChain(chainIndex string) (map[string]interface{}, error) {
	var priceData map[string]interface{}

	operation := func() error {
		timestamp := time.Now().UTC().Format(time.RFC3339)

		requestPath := "/api/v5/dex/aggregator/all-tokens"

		// Prepare query parameters
		params := url.Values{}
		params.Set("chainIndex", "501")
		queryString := "?" + params.Encode()
		headers := c._getOKXHeaders(timestamp, "GET", requestPath, queryString, "")

		fullURL := fmt.Sprintf("%s%s", config.AppConfig.OKXURL, requestPath)
		if queryString != "" {
			fullURL += queryString
		}
		print(fullURL)
		req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, fullURL, nil)
		if err != nil {
			return fmt.Errorf("failed to create request: %w", err)
		}

		for key, value := range headers {
			req.Header.Set(key, value)
		}

		ctx, cancel := context.WithTimeout(req.Context(), 5*time.Second)
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

		if err := json.Unmarshal(body, &priceData); err != nil {
			return fmt.Errorf("failed to unmarshal response body: %w", err)
		}

		return nil
	}

	// Use circuit breaker and retry up to 3 times
	_, err := cb.Execute(func() (interface{}, error) {
		return nil, retryWithLimit(operation, 3)
	})

	return priceData, err
}

func (c *Client) GetOKXPrice(cryptoAddress string) (map[string]interface{}, error) {
	var priceData map[string]interface{}

	operation := func() error {
		timestamp := time.Now().UTC().Format(time.RFC3339)

		if strings.Contains(timestamp, "+") { // Ensure Z for Zulu time
			timestamp = strings.Split(timestamp, "+")[0] + "Z"
		} else if !strings.HasSuffix(timestamp, "Z") {
			timestamp += "Z"
		}

		// Prepare query parameters
		urlParams := url.Values{
			"chainIndex":           {SOLANA_CHAIN_ID},
			"tokenContractAddress": {cryptoAddress},
		}

		requestPath := "/api/v5/dex/market/price-info"
		queryString := "?" + urlParams.Encode()
		headers := c._getOKXHeaders(timestamp, "GET", requestPath, queryString, "")

		fullURL := fmt.Sprintf("%s%s%s", config.AppConfig.OKXURL, requestPath, queryString)
		// print("\n\n",fullURL,"\n\n")
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

		if err := json.Unmarshal(body, &priceData); err != nil {
			return fmt.Errorf("failed to unmarshal response body: %w", err)
		}

		return nil
	}

	// Use circuit breaker and retry up to 3 times
	_, err := cb.Execute(func() (interface{}, error) {
		return nil, retryWithLimit(operation, 3)
	})

	return priceData, err
}

func (c *Client)  GetOKXPriceWithFallback(cryptoAddress string) (interface{}, error){

	r, err := c.GetOKXPrice(cryptoAddress)
	if err != nil {
		print("\n\n >>> ", err.Error())
		geckoResult, err := c.GetCoinGeckoPrice(cryptoAddress)
		if err != nil {
			return nil,err
		}
		return geckoResult,nil
	}
	return r,nil
}