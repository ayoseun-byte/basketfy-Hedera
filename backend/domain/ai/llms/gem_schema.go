package llms

import (
	"fmt"
	"google.golang.org/genai"
)


type Schema struct {
	Type                 string                 `json:"type"`
	Properties           map[string]interface{} `json:"properties"`
	Required             []string               `json:"required"`
	AdditionalProperties bool                   `json:"additionalProperties"`
}

type JSONSchema struct {
	Name   string `json:"name"`
	Strict bool   `json:"strict"`
	Schema Schema `json:"schema"`
}


type ResponseFormat struct {
	Type       string     `json:"type"`
	JSONSchema JSONSchema `json:"json_schema"`
}


// Function to generate the response format request body
func (c *LLMClient) FormatGeminiRequestWithResponseFormat(req map[string]interface{}, responseFormat ResponseFormat, stream bool) (map[string]interface{}, error) {
	// Extract the "messages" field as a slice of maps
	messages, ok := req["messages"].([]map[string]string)
	if !ok || len(messages) == 0 {
		return nil, fmt.Errorf("missing or invalid 'messages' field in the request")
	}

	// Filter messages to exclude any with empty or missing 'content'
	validMessages := []map[string]string{}
	for _, message := range messages {
		content, exists := message["content"]
		if !exists || content == "" {
			continue
		}
		validMessages = append(validMessages, message)
	}

	// Construct the new request object with the response format
	newReq := map[string]interface{}{
		"messages":        validMessages,
		"model":           req["model"],
		"max_tokens":      req["max_tokens"],
		"temperature":     req["temperature"],
		"stream":          stream,
		"response_format": responseFormat,
	}

	return newReq, nil
}


func (c *LLMClient) NewGeminiResponseFormat() *genai.Schema {
	return   &genai.Schema{
			Type: genai.TypeObject, 
			Properties: map[string]*genai.Schema{
				"item": { 
				Description: `When a tool or function call is necessary to answer the user's query, use the TOOL CALL JSON SCHEMA. For direct answers, use the FINAL RESPONSE SCHEMA 
				e.g 
                        for direct/final answer: {"item":{"insight":"The portfolio's allocation is now more closely aligned with the target weights, reducing concentration risk.","performance":"After rebalancing, the portfolio's overall value increased by 2.3%, and all tokens are within 5% of their target allocations.","risk_assessment":"Risk is now more diversified across assets, with no single token exceeding 35% of the portfolio.","rebalancing_suggestion":"Monitor market conditions and consider periodic rebalancing to maintain optimal allocation and risk profile."}}
                        for tool calls: {"item":{"action":"Google Images","feedback":"Searching for images of Chris Hemsworth as Thor...","input":"Chris Hemsworth as Thor","thought":"Searching for images related to Chris Hemsworth as Thor in the Marvel Cinematic Universe."}}`,
					Type:  genai.TypeUnspecified,
					AnyOf: []*genai.Schema{ // Each item can be one of these two schemas
						{Type: genai.TypeObject,
							Description: "FUNCTION CALL JSON SCHEMA, The object used ONLY when you need to make a function or tool calls.",
							Properties: map[string]*genai.Schema{
								"thought":  {Type: genai.TypeString, Description: "[Context analysis and reasoning (do not reveal to the user)] e.g I need to search for the latest news regarding Israel to provide accurate and current information."},
									"action":   {Type: genai.TypeString, Description: "[Tool selection from available tools.], e.g Google Search"},
									"input":    {Type: genai.TypeString, Description: "[Tool input (Just the input, not a descriptor or anything else.)] e.g Latest news Israel February 2025"},
									"feedback": {Type: genai.TypeString, Description: "[Processing status to user] e.g Searching for the most recent news about Israel..."},
							},
							PropertyOrdering: []string{"thought","action","input", "feedback"},
							Required: []string{"thought","action","input", "feedback"},
						},
						{Type: genai.TypeObject,
							Description: "FINAL RESPONSE SCHEMA, The object to use when responding with the final answer.",
							Properties: map[string]*genai.Schema{
								"insight": {Type: genai.TypeString, Description: "A concise, actionable insight derived from the rebalancing process, highlighting key findings or notable trends in the portfolio."},
								"performance": {Type: genai.TypeString, Description: "A summary of the portfolio's performance after rebalancing, including relevant metrics or changes in allocation."},
								"risk_assessment": {Type: genai.TypeString, Description: "An evaluation of the portfolio's risk profile post-rebalancing, noting any significant risk factors or improvements."},
								"rebalancing_suggestion": {Type: genai.TypeString, Description: "A clear, actionable suggestion for further rebalancing or optimization, based on the current portfolio state."},
							},
							Required: []string{"insight", "performance", "risk_assessment", "rebalancing_suggestion"},
							PropertyOrdering: []string{"insight", "performance", "risk_assessment", "rebalancing_suggestion"},
						},
						
					},
				},
			
			},
	}
	

}