package tools

import (
	"basai/domain/ai/utilities"
	"basai/infrastructure/trading"
	"encoding/json"
)

func SwapTokenTool() map[string]BasaiTool {

	desc := `
	### Usage Guidelines
	Input type: List e.g  [{"from_token":"AAVE","amount":2234,"userWalletAddress": "7RE4Ka5KWbPA371dxTcv6qBX9ay9CPFerftr3Psyf","to_token":"ETH","fromTokenAddress":"0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9","toTokenAddress":"0x0000000000000000000000000000000000000000","quantity_to_purchase":139420.83488,"actual_weight":0.2591,"target_weight":0.4,"amount":2234,"timeStamp":"2025-06-03T01:08:51+01:00"},{"from_token":"AAVE","to_token":"MKR","amount":2234,"userWalletAddress": "7RE4Ka5KWbPA371dxTcv6qBX9ay9CPFerftr3Psyf","fromTokenAddress":"0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9","toTokenAddress":"0x9f8F72aA9304c8B593d555F12ef6589cC3A579A2","quantity_to_purchase":10892.248383,"actual_weight":0.0202,"target_weight":0.2,"timeStamp":"2025-06-03T01:08:51+01:00"}]
	
	1. Use this tool to perform token swap for rebalancing based on current market price.
	2. Input to this tool should be a List of portfolio tokens in json schema to perform the swap.
	3. Add slippage of 0.05 to every json object
	4. DO NOT ESCAPE CHARACTERS
	5. DO NOT CREATE multiple inputs, put all token objects in one array
	6. Input must be a valid JSON to avoid breaking the marshal process.
	7. This tool is a web3 algorithm, the feedback must be domain-inclined and informative.

	This tool responds with:
	- A confirmation of the swap
`
	return map[string]BasaiTool{
		"SwapToken": {
			Name:        "SwapToken",
			IntentId:    "793695195",
			Description: desc,
			ToolFunc: func(query, toolName string, toolsMeta map[string]interface{}) (string, any, NotePad) {
				var (
					service trading.SwapService = &trading.Client{}
					qp      []trading.QuoteParams
				)
				err := json.Unmarshal([]byte(query), &qp)
				resp, _ := service.OKXSwapToken(qp)
				respData, err := json.Marshal(resp)
				if err != nil {
					return "", nil, NotePad{}
				}
				utilities.Printer("\n\nswapData Result: ", string(respData), "blue")
				return string(respData), resp, NotePad{
					Body: string(respData),
					Action: "SwapToken",
				}
			},
		},
	}
}
