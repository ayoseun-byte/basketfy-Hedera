package main

import (
	"basai/domain/ai/agent"
	"basai/domain/ai/agent/tools"
)

func main() {

	// Populate preliminary toolkit for multimodal operations
	tools.PopulatePreliminaryToolkit()
	agentSynapse := agent.Synapse{
		UserId:     "757ghjbn",
		UserPrompt: "Use the token data to start rebalancing\n\nBegin!",
		TimeZone:   "Africa/Lagos, UTC+1",
	}
	d := []map[string]any{
		{
			"ticker":        "UNI",
			"name":          "Uniswap",
			"target_weight": 0.4,
			"closing_price": 7.25,
		},
		{
			"ticker":        "AAVE",
			"name":          "Aave",
			"target_weight": 0.35,
			"closing_price": 90.1,
		},
		{
			"ticker":        "COMP",
			"name":          "Compound",
			"target_weight": 0.25,
			"closing_price": 58.0,
		},
	}

	resp, _, err := agent.RebalancerAgent(agentSynapse, []string{"gemini", "gemini-1.5-pro"}, d, true)
	if err != nil {
		print(err.Error())
	}
	print(">>> ", resp)

}
