package agent

import "basai/domain/ai/agent/tools"

// Synapse struct represents the core structure for managing the state and data of the agent.
type Synapse struct {
	UserPrompt        string                 // UserPrompt holds the initial user input or query for the agent.
	AIIdentity        []byte                 // AIIdentity holds the identity information for the AI.
	SysPrompt         []byte                 // SysPrompt holds the system prompt for the agent.
	InstructPrompt    []byte                 // InstructPrompt holds the instructional prompt for the agent.
	MetaData          map[string]interface{} // MetaData contains various metadata related to the agent's state.
	ToolNames         string                 // ToolNames is a string of tool names available to the agent.
	ModelType         map[string]string      // ModelType specifies the type of model used by the agent.
	TradingTools      tools.BasaiTools
	UserId string
	TimeZone string
}

// AgentActionTypes represents the various stages and types of actions an agent can take.
type AgentActionTypes struct {
	// AgentAction holds the current action the agent is performing.
	AgentAction map[string][]byte

	// AgentFinish holds the final actions or results after the agent completes its task.
	AgentFinish map[string][]byte

	// AgentPlan holds the planned actions or steps the agent intends to take.
	AgentPlan map[string][]byte

	// AgentError holds any errors encountered by the agent during its process.
	AgentError map[string][]byte
}

// ToolCall represents a call to a tool with specific parameters and feedback.
type ToolCall struct {
	// Thought is the reasoning or interpretation behind the tool call.
	Thought  string `xml:"thought" json:"thought"`
	// Action specifies the action to be taken by the tool.
	Action   string `xml:"action" json:"action"`
	// Input contains the parameters or data required for the action.
	Input    interface{} `xml:"input" json:"input"`
	// Feedback provides information or results from the tool call.
	Feedback string `xml:"feedback" json:"feedback"`
}