package gemini

import (
	"context"
	"fmt"
	"google.golang.org/genai"
)

type Client struct {
	Schema *genai.Schema
}

func NewGeminiClient(schema *genai.Schema) *Client {
	return &Client{
		Schema: schema,
	}
}

func (c *Client) GemStreamCompleteClient(apiKey string, req map[string]interface{}) (string, error) {
	var p []genai.Part
	ctx := context.Background()
	query, formattedMessages, systemPrompt, err := formatGeminiRequest(req)

	if err != nil {
		return "", err
	}

	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return "", err
	}

	// Create a new Chat.
	chat, err := client.Chats.Create(ctx, "gemini-1.5-flash",
		&genai.GenerateContentConfig{
			ResponseMIMEType:  "application/json",
			ResponseSchema:    c.Schema,
			SystemInstruction: &genai.Content{Parts: []*genai.Part{{Text: systemPrompt}}},
		},
		formattedMessages,
	)
	if err != nil {
		return "", err
	}
	part := genai.Part{Text: query}
	p = append(p, part)

	// Send first chat message.
	result, err := chat.SendMessage(ctx, p...)
	if err != nil {
		return "", err
	}

	return result.Text(), nil

}

func (c *Client) GemStreamClient(apiKey string, req map[string]interface{}, chunkChan chan string) {

	var p []genai.Part
	// Ensure we close the channel when we're done
	defer close(chunkChan)
	ctx := context.Background()
	query, formattedMessages, systemPrompt, err := formatGeminiRequest(req)

	if err != nil {
		chunkChan <- err.Error()
	}
	model, ok := req["model"].(string)
	if !ok {
		chunkChan <- err.Error()
	}
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		chunkChan <- err.Error()
	}

	chat, err := client.Chats.Create(ctx, model,
		&genai.GenerateContentConfig{
			ResponseMIMEType:  "application/json",
			ResponseSchema:    c.Schema,
			SystemInstruction: &genai.Content{Parts: []*genai.Part{{Text: systemPrompt}}},
		},
		formattedMessages,
	)
	if err != nil {
		chunkChan <- err.Error()
	}
	part := genai.Part{Text: query}
	p = append(p, part)

	// Send first chat message.
	for result, err := range chat.SendMessageStream(ctx, p...) {
		if err != nil {
			chunkChan <- err.Error()
		}
		chunkChan <- result.Text()
	}

}

func formatGeminiRequest(req map[string]interface{}) (string, []*genai.Content, string, error) {
	// Extract the "messages" field as a slice of maps
	rawMessages, ok := req["messages"].([]map[string]string)
	if !ok || len(rawMessages) == 0 {
		return "", nil, "", fmt.Errorf("missing or invalid 'messages' field in the request")
	}

	var (
		contents     []*genai.Content
		systemPrompt string
		query        string
	)
	// Filter messages to exclude any with empty or missing 'content'
	for _, message := range rawMessages {
		role, roleOK := message["role"]
		content, contentOK := message["content"]

		if !roleOK || !contentOK || content == "" {
			continue // Skip malformed or empty entries
		}

		if role == "system" && systemPrompt == "" {
			systemPrompt = content // Extract system prompt (first one only)
			continue               // Do not include in Gemini message list
		}

		genaiContent := &genai.Content{
			Role: role,
			Parts: []*genai.Part{
				{Text: content},
			},
		}
		contents = append(contents, genaiContent)
		if role == "user" {
			query = content
		}
	}

	return query, contents, systemPrompt, nil
}
