package agent

import (
	"basai/config"
	"basai/domain/ai/llms"
	"basai/domain/ai/utilities"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"basai/domain/ai/agent/tools"
)

// FeedbackStruct represents the structure for handling feedback
type FeedbackStruct struct {
	IsFeedback   bool
	FeedbackChan chan string
}

type KnowledgeBaseWaitStruct struct {
	IsKBWait              bool
	KnowledgeBaseWaitChan chan string
}

// FeedbackStruct represents the structure for handling feedback
type ToolListStruct struct {
	HasToolList bool
	ToolList    []map[string]interface{}
}

// startLLMClient initializes and starts a language model client based on the specified provider.
// It uses the provided LLMProvider configuration to determine which client to start and passes
// the necessary API key and parameters to the client's streaming function.
//
// Parameters:
// - LLMProvider ([]string): A slice containing the provider name and model identifier.
// - streamChan (chan string): A channel for streaming responses from the language model.
// - kwargs (map[string]interface{}): A map of additional parameters for the language model client.
func startLLMStreamClient(LLMProvider []string, streamChan chan string, kwargs map[string]interface{}) {
	// Create a new instance of the language model client interface
	var clm llms.CallLLmInterface = llms.NewLLMClient()

	// Check if the LLMProvider configuration is valid
	if len(LLMProvider) < 2 {
		log.Println("Invalid LLMProvider configuration")
		return
	}

	// Set the model in the kwargs map using the second element of LLMProvider
	kwargs["model"] = LLMProvider[1]

	// Determine which language model client to start based on the provider name
	switch LLMProvider[0] {

	case "gemini":
		go func() {

			defer func() {
				if r := recover(); r != nil {
					log.Println("Recovered from panic in GemStreamClient:", r)
					streamChan <- "{\"item\":{\"answer\":\"[ERROR: An internal error occurred with the Gemini client likely credit].\",\"snap_summary\":\"Something wrong\",\"validation\":\"- Confidence Score: 1.0\n  - Sources Checked: [Internal Knowledge]\n  - Verification Status: Verified\n  - Data Freshness: Current\n  - Compliance Status: Compliant\n  - Industry Context: Imagination\"}}"
					defer close(streamChan)
				}

			}()
			// Start the Gemini streaming client with the provided API key and parameters
			clm.GemStreamClient(config.AppConfig.GeminiAPIKey, kwargs, streamChan)
		}()

	default:
		// Log an error if the provider is unsupported
		log.Println("Unsupported LLM provider:", LLMProvider[0])
	}
}

// MultimodalCortex orchestrates the interaction between the agent and the language model, handling tool execution and feedback processing.
// It prepares the prompt, initiates the language model call, and processes the response to determine if any actions are required.
// If actions are identified, it executes the corresponding tools and updates the prompt for the next iteration.
//
// Parameters:
// - agentSynapse (Synapse): Contains metadata and user prompt information for the agent.
// - feedback (*FeedbackStruct): A structure for handling feedback, including a channel for feedback messages.
// - toolList (*ToolListStruct): A structure for managing the list of tool responses.
// - verbose (bool): A flag to enable detailed logging of the process.
//
// Returns:
// - chan string: A channel streaming the response from the language model.
// - error: An error object if any issues occur during processing.
func RebalancerAgentStream(requestCtx context.Context,agentSynapse Synapse, LLMProvider []string,tokens interface{}, feedback *FeedbackStruct, verbose bool) (chan string, error) {
	// Create a new instance of MultiModalAgent
	var (
		mmAgent          MultiModalAgentInterface = NewMultiModalAgent()
		kwargs = map[string]interface{}{}

	)
	// startTime := time.Now()
	// Prepare the prompt and retrieve necessary data
	systemPrompt, chatHistory, swappingTools, toolNames, _ := mmAgent.PreparePrompt(agentSynapse, []byte(LLMProvider[0]),tokens)


	// Initialize AI Identity with default
	agentSynapse.AIIdentity = []byte("\nTokrai: ")

	// Create a done channel for feedback
	if feedback != nil && feedback.FeedbackChan != nil {
		defer close(feedback.FeedbackChan) // Ensure channel cleanup
	}

	// Append the user's prompt to the chat history with the role specified as "user"
	chatHistory = append(chatHistory, map[string]string{"role": "user", "content": agentSynapse.UserPrompt})

	newMap := map[string]string{"role": "system", "content": string(systemPrompt)}

	// Prepend the new map
	chatHistory = append([]map[string]string{newMap}, chatHistory...)

	// Log chat history if verbose is enabled
	if verbose {
		chatHistoryJSON, err := json.Marshal(chatHistory)
		if err != nil {
			log.Println(fmt.Errorf("error marshaling chat history: %w", err))
		} else {
			utilities.Printer("Chat History JSON Color: ", string(chatHistoryJSON), "gold")
		}
	}

	// Set up keyword arguments for the language model call
	kwargs = map[string]interface{}{
		"max_tokens":  5000,
		"messages":    chatHistory,
		"temperature": 0.3,
		"stop":        []string{},
	}

	// Create a channel for the direct call stream
	directCallStreamChan := make(chan string)
	startLLMStreamClient(LLMProvider, directCallStreamChan, kwargs)

	// Process the stream and check for actions
	sseChannel, toolCallString, actionReady, err := ProcessStream(directCallStreamChan,LLMProvider[0])
	if err != nil {
		log.Println(err)
		return nil, err
	}
	if !actionReady {
		// If no action is ready initially, return the stream
		return sseChannel, nil
	}

	// Initialize a list to store tool responses
	var toolResponseList []map[string]interface{}

	// Loop while action(s) is/are ready
	for actionReady {
		// Log the tool call string if verbose is enabled
		if verbose {
			utilities.Printer("\n\ntool call >>> ", toolCallString, "green")
		}

		// Parse agent actions from the tool call string
		agentActions, _, parseErr := NeuralParser([]byte(toolCallString), LLMProvider[0], false)
		if parseErr != nil {
			log.Println(parseErr)
			return nil, parseErr
		}

		// Retrieve the action from the parsed agent actions
		action, exists := agentActions.AgentAction["Action"]
		if !exists {
			// If action is missing, return the current stream
			return sseChannel, nil
		}

		// Log feedback if verbose is enabled
		if verbose {
			utilities.Printer("\n", string(agentActions.AgentAction["Feedback"]), "blue")
		}

		// Send feedback through a non-blocking goroutine if available
		if string(agentActions.AgentAction["Feedback"]) != "" && feedback.FeedbackChan != nil && actionReady {
			feedback.IsFeedback = true
			go func() {
				select {
				case feedback.FeedbackChan <- string(agentActions.AgentAction["Feedback"]):
					// Feedback sent successfully
				default:
				}
			}()
		}

		// Get tool response by executing the tool function
		toolResponse, rawToolResponse, notepadData, toolId := _executeToolAction(
			swappingTools,
			toolNames,
			string(action),
			string(agentActions.AgentAction["Input"]),
			agentSynapse.MetaData,
		)

		// Log the tool response if verbose is enabled
		if verbose {
			utilities.Printer("Observation: ", toolResponse, "purple")
		}

		noteService := tools.NewNoteService(notepadData, agentSynapse.UserId, agentSynapse.UserId,0)
		noteService.SaveNote()
		// Append tool response to the list
		toolResponseList = append(toolResponseList, map[string]interface{}{toolId: rawToolResponse})

		// Build agent thought process in a single operation to reduce allocations
		var agentThoughtBuf bytes.Buffer
		agentThoughtBuf.Write(agentSynapse.AIIdentity)
		agentThoughtBuf.WriteString("\n" + toolCallString)
		agentThoughtBuf.WriteString("\n\nTool Response:\n")
		agentThoughtBuf.WriteString(toolResponse)
		agentThoughtBuf.WriteString("\n")
		agentThoughtBuf.Write(agentSynapse.AIIdentity)

		// Append the new prompt to the chat history
		chatHistory = append(chatHistory, map[string]string{"role": "user", "content": agentThoughtBuf.String()})

		// Update existing kwargs map for the next language model call
		kwargs["messages"] = chatHistory

		// Create a new channel for the tool calling stream
		inStreamChan := make(chan string)
		startLLMStreamClient(LLMProvider, inStreamChan, kwargs)

		// Process the new stream and check for actions
		sseChannel, toolCallString, actionReady, err = ProcessStream(inStreamChan,LLMProvider[0])
		if err != nil {
			log.Println(err)
			return nil, err
		}
	}

	return sseChannel, nil
}
