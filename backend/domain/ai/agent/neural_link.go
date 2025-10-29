package agent

import (
	"basai/domain/ai/agent/tools"
	"basai/domain/ai/utilities"
	"encoding/json"
	"fmt"
)

// MultiModalAgentInterface defines the interface for preparing the prompt for the LLM.
type MultiModalAgentInterface interface {
	PreparePrompt(synapseMetaData Synapse, modelName []byte, tokens interface{}) ([]byte, []map[string]string, tools.BasaiTools, string, error)
}

// MultiModalAgent is a struct that implements the MultiModalAgentInterface.
type MultiModalAgent struct {
}

// NewMultiModalAgent returns a new instance of MultiModalAgent.
func NewMultiModalAgent() MultiModalAgentInterface {
	return &MultiModalAgent{}
}

// PreparePrompt is a function that implements the MultiModalAgentInterface.
// It prepares the prompt for the LLM (Language Learning Model) and returns the LLM and the prepared prompt.
func (a *MultiModalAgent) PreparePrompt(synapseMetaData Synapse, modelName []byte, tokens interface{}) ([]byte, []map[string]string, tools.BasaiTools, string, error) {
	// Initialize the prompt template and prompt map
	var (
		systemPrompt      []byte
		chatHistory       []map[string]string
		partnerToolsError error
		tradingTools      tools.BasaiTools
	)

	// Set the prompt template based on the model name
	systemPrompt, _ = utilities.SwitchModelWithCustomInstructionPromptBySyntax(modelName)

	tradingTools, partnerToolsError = tools.GetAllTools()
	if partnerToolsError != nil {
		fmt.Print(partnerToolsError.Error())
	}

	// Render the tool names
	tl, tn := tools.RenderToolNames(&tradingTools)

	// Get the current date and time
	currentDate, _, _, _, currentDayOfWeek, _, _, _, currentTime, _ := utilities.GetCurrentDateTimeWithTimeZoneShift(synapseMetaData.TimeZone)

	tokensJSON, err := json.Marshal(tokens)
	if err != nil {
		fmt.Print("Error marshalling tokens:", err)
		tokensJSON = []byte("{}") // Default to empty JSON object on error
	}
	noteService := tools.NewNoteService(tools.NotePad{},synapseMetaData.UserId,synapseMetaData.UserId,4)

	promptMap := map[string][]byte{
		"tool_names":              []byte(tn),
		"tools_notepad":           []byte(noteService.GetNotes()),
		"tools":                   []byte(tl),
		"current_date":            []byte(currentDate),
		"current_day_of_the_week": []byte(currentDayOfWeek),
		"current_time":            []byte(currentTime),
		"tokens": tokensJSON,
	}

	// Format the system prompt with the prepared prompt map
	llmSystemPrompt := utilities.CustomFormat(systemPrompt, promptMap)

	return llmSystemPrompt, chatHistory, tradingTools, tn, nil
}
