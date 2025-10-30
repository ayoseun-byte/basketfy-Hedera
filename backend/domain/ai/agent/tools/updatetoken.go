package tools

import (
	"basai/application/services"
	"basai/domain/ai/utilities"
	"context"
	"encoding/json"
	"sync"
)

type RebalanceUpdate struct {
	TokenAddress string  `json:"tokenAddress"`
	UserId       string  `json:"user_id"`
	Weight       float64 `json:"weight"`
	Amount       float64 `json:"amount"`
}

func UpdateTokenWeightTool() map[string]BasaiTool {

	desc := `
	### Usage Guidelines
	Input type: List e.g  [{"amount":2234,"tokenAddress":"0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9","weight":0.2591},{"tokenAddress":"0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9","amount":2234,"weight":0.0202,"weight":0.2}]
	
	1. Use this tool to update and save the token weights to db after a swap to conclude the rebalancing.
	2. Input to this tool should be a List of portfolio tokens in json schema to perform the swap.
	3. Ensure the response reflects a successful update transaction.
	4. Do not execute repeated updates for the same token unless explicitly required.

	This tool responds with:
	- A confirmation of the token weight updated
	- The new weight value
	- Timestamp of execution
	- Optional: transaction ID if available
	`

	return map[string]BasaiTool{
		"UpdateTokenWeight": {
			Name:        "UpdateTokenWeight",
			IntentId:    "793695189",
			Description: desc,
			ToolFunc: func(input, toolName string, toolsMeta map[string]interface{}) (string, any, NotePad) {
				var (
					ruList []RebalanceUpdate
				)

				json.Unmarshal([]byte(input), &ruList)
				ruListJSON, _ := json.Marshal(ruList)
				utilities.Printer("\n\nrebalanceupdateData: ", string(ruListJSON), "blue")
				var wg sync.WaitGroup
				for _, ru := range ruList {
					wg.Add(1)
					go func(ru RebalanceUpdate) {
						defer wg.Done()
						// Create a background context to control lifecycle
						bgCtx, cancel := context.WithCancel(context.Background())
						defer cancel()
						_ = services.UpdateUserBasketToken(bgCtx, ru.UserId, ru.TokenAddress, ru.Amount, ru.Weight)
					}(ru)
				}
				wg.Wait()
				return `{"status":"tokens updated successfully"}`, nil, NotePad{
					Action: "UpdateTokenWeight",
				}
			},
		},
	}
}
