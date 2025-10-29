package trading

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"basai/config"
	"time"
	"github.com/cenkalti/backoff/v4"
)



func SellToken(crypto string) (map[string]interface{}, error) {
	var priceData map[string]interface{}

	operation := func() error {
		baseURL := fmt.Sprintf("%s/api/v3/simple/price", config.AppConfig.OKXURL)

		// Prepare query parameters
		params := url.Values{}
		params.Set("vs_currencies", "usd,eur")
		params.Set("ids", crypto) // Use the single crypto string directly
		params.Set("precision", "full")

		fullURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

		req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, fullURL, nil)
		if err != nil {
			return fmt.Errorf("failed to create request: %w", err)
		}

		req.Header.Set("Accept", "application/json")
		req.Header.Set("Content-Type", "application/json")

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

	// Use circuit breaker and exponential backoff
	_, err := cb.Execute(func() (interface{}, error) {
		return nil, backoff.Retry(operation, backoff.NewExponentialBackOff())
	})

	return priceData, err
}