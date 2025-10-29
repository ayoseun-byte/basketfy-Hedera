package llms

import (
	gem "basai/domain/ai/llms/gemini"
)

type CallLLmInterface interface {
	GemStreamClient(apiKey string, req map[string]interface{}, chunkChan chan string)
	GemStreamCompleteClient(apiKey string, req map[string]interface{}) (string, error)
}

type LLMClient struct {
	MaxTokens   int                 `json:"max_tokens"`
	Messages    []map[string]string `json:"messages"`
	Temperature float64             `json:"temperature"`
	Stop        []string            `json:"stop"`
	Stream      bool                `json:"stream"`
}
// NewLLMClient creates and returns a new instance of LLMClient implementing the CallLLmInterface.
func NewLLMClient() CallLLmInterface {
	return &LLMClient{}
}


// GemStreamClient sends a request to the Gemini API for streaming responses.
// It takes an API key, a request map, and a channel to receive chunks of the response.
// The method uses a specific response format for Gemini and delegates the request to the Gemini client.
func (c *LLMClient) GemStreamClient(apiKey string, req map[string]interface{}, chunkChan chan string) {
	geminiClient := gem.NewGeminiClient(c.NewGeminiResponseFormat())
	geminiClient.GemStreamClient(apiKey, req, chunkChan)
}

// GemStreamCompleteClient sends a request to the Gemini API for a complete response.
// It takes an API key and a request map, and returns the complete response as a string and an error if any.
// The method uses a specific response format for Gemini and delegates the request to the Gemini client.
func (c *LLMClient) GemStreamCompleteClient(apiKey string, req map[string]interface{}) (string, error) {
	geminiClient := gem.NewGeminiClient(c.NewGeminiResponseFormat())
	return geminiClient.GemStreamCompleteClient(apiKey, req)
}
