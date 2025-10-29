package agent

import (
	"bytes"
	"encoding/json"
	"fmt"
	"regexp"
)

var (
	// actionRegex   = regexp.MustCompile(`\s*Action:\s*(.*)`)
	// inputRegex    = regexp.MustCompile(`\s*Input:\s*(.*)`)
	// feedbackRegex = regexp.MustCompile(`\s*Feedback:\s*(.*)`)
	emojiRegex = regexp.MustCompile(`[^a-zA-Z0-9\s/]`)
)

type toolSchema struct {
	Item ToolCall `json:"item"`
}

// NeuralParser is a function that processes the output from the agent cortex.
// It takes a byte slice `data` as input, representing the agent's decision on tool call.
// It returns a pointer to an `AgentActionTypes` struct, which contains the agent's action details,
// or an error struct if the output format is incorrect or contains multiple formats.
// If the XML unmarshalling fails, it returns an error.
func NeuralParser(data []byte, modelType string, callType bool) (*AgentActionTypes, []byte, error) {

	// if hasMultipleFormats(data) {
	// 	return newAgentError("You can not call <answer> tag and <tool_call> tag at once. if you intend to use a tool then you should use ONLY <tool_call>."), nil, nil
	// }

	if callType && isAnswerOnly(data) {
		return newAgentFinish(data), nil, nil
	}

	// Unmarshal JSON into struct
	var toolCall toolSchema

	jsonErr := json.Unmarshal(data, &toolCall)
	if jsonErr != nil {
		return &AgentActionTypes{}, nil, fmt.Errorf("AgentActionTypes; error unmarshaling JSON: %s, erro: %v", string(data), jsonErr)
	}

	if toolCall.Item.Thought != "" {
		return buildAgentAction(&toolCall.Item), []byte(toolCall.Item.Thought), nil
	}

	return newAgentError("Oops! I used a wrong format. I now know that if I am responding without a tool, I MUST use the answer JSON schema Format ONLY or If I am planning to use a tool I must use the tool call JSON schema Format. I will now try again."), nil, nil
}

// Helper function to check if data contains multiple formats
func hasMultipleFormats(data []byte) bool {
	return bytes.Contains(data, []byte(`thought:`)) && bytes.Contains(data, []byte(`"answer":`))
}

// Helper function to check if data is in answer-only format
func isAnswerOnly(data []byte) bool {
	return bytes.Contains(data, []byte(`"answer":`))
}

// Helper function to create a new AgentError
func newAgentError(errorMessage string) *AgentActionTypes {
	return &AgentActionTypes{
		AgentError: map[string][]byte{
			"Error":          []byte(errorMessage),
			"IterationValue": []byte("1"),
		},
	}
}

// Helper function to create a new AgentFinish
func newAgentFinish(data []byte) *AgentActionTypes {
	return &AgentActionTypes{
		AgentFinish: map[string][]byte{
			"Output": data,
		},
	}
}

// Helper function to build AgentAction from tool call
func buildAgentAction(toolCall *ToolCall) *AgentActionTypes {
	action := emojiRegex.ReplaceAll([]byte(toolCall.Action), []byte(""))
	input := "{}"

	if inp, ok := toolCall.Input.(string); ok {
		input = inp
	}

	return &AgentActionTypes{
		AgentAction: map[string][]byte{
			"Action":         bytes.TrimSpace(action),
			"Input":          []byte(input),
			"Feedback":       []byte(toolCall.Feedback),
			"IterationValue": []byte("1"),
		},
	}
}
