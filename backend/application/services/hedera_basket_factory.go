package services

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"

	hedera "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
)

type ContractArtifact struct {
	Bytecode struct {
		Object string `json:"object"`
	} `json:"bytecode"`
	DeployedBytecode struct {
		Object string `json:"object"`
	} `json:"deployedBytecode"`
}

// ============================================================
// Deploy BasketFactory Contract
// ============================================================

func (hc *HederaClient) DeployBasketFactory() (hedera.ContractID, error) {
	data, err := os.ReadFile("artifacts/BasketFactory.json")
	if err != nil {
		return hedera.ContractID{}, fmt.Errorf("failed to read BasketFactory.json: %w", err)
	}
	fmt.Println("Read BasketFactory.json successfully", len(data))
	var artifact ContractArtifact
	if err := json.Unmarshal(data, &artifact); err != nil {
		return hedera.ContractID{}, fmt.Errorf("invalid JSON in BasketFactory.json: %w", err)
	}
	code := artifact.DeployedBytecode.Object
	if len(code) >= 2 && code[:2] == "0x" {
		code = code[2:]
	}

	byteCode, err := hex.DecodeString(code)
	if err != nil {
		return hedera.ContractID{}, fmt.Errorf("failed to decode bytecode: %w", err)
	}

	contractCreate := hedera.NewContractCreateFlow().
		SetGas(5_000_000).
		SetBytecode(byteCode)

	txResponse, err := contractCreate.Execute(hc.client)
	if err != nil {
		return hedera.ContractID{}, fmt.Errorf("contract deployment failed: %w", err)
	}

	receipt, err := txResponse.GetReceipt(hc.client)
	if err != nil {
		return hedera.ContractID{}, fmt.Errorf("failed to get deployment receipt: %w", err)
	}

	contractID := *receipt.ContractID
	fmt.Printf("✅ BasketFactory deployed at: %v\n", contractID)
	return contractID, nil
}

// ============================================================
// Create Basket
// ============================================================

func (hc *HederaClient) CreateBasket(factoryID string, name, theme string, tokens []string, weights [][32]byte, rebalanceFreq, feePercentage []byte, basketAddress, bTokenAddress, nftAddress, curator string) (hedera.TransactionResponse, error) {
	contractID, err := hc.ConvertStringToContractID(factoryID)
	if err != nil {
		return hedera.TransactionResponse{}, err
	}

	params := hedera.NewContractFunctionParameters().
		AddString(name).
		AddString(theme).
		AddUint256Array(weights).
		AddUint256(rebalanceFreq).
		AddUint256(feePercentage)
	params, err = params.AddAddressArray(tokens)
	if err != nil {
		return hedera.TransactionResponse{}, fmt.Errorf("failed to add tokens array: %w", err)
	}

	params, err = params.AddAddress(bTokenAddress)
	if err != nil {
		return hedera.TransactionResponse{}, fmt.Errorf("failed to add bToken address: %w", err)
	}
	params, err = params.AddAddress(nftAddress)
	if err != nil {
		return hedera.TransactionResponse{}, fmt.Errorf("failed to add NFT address: %w", err)
	}
	params, err = params.AddAddress(curator)
	if err != nil {
		return hedera.TransactionResponse{}, fmt.Errorf("failed to add curator address: %w", err)
	}

	tx, err := hedera.NewContractExecuteTransaction().
		SetContractID(contractID).
		SetGas(10_000_000).
		SetFunction("createBasket", params).
		Execute(hc.client)

	if err != nil {
		return tx, fmt.Errorf("failed to call createBasket: %w", err)
	}

	receipt, err := tx.GetReceipt(hc.client)
	if err != nil {
		return tx, fmt.Errorf("failed to get createBasket receipt: %w", err)
	}

	fmt.Printf("✅ Basket created, status: %v\n", receipt.Status)
	return tx, nil
}

// ============================================================
// Get Basket Count
// ============================================================

func (hc *HederaClient) GetBasketCount(factoryID string) ([]byte, error) {
	contractID, err := hc.ConvertStringToContractID(factoryID)
	if err != nil {
		return nil, err
	}

	query := hedera.NewContractCallQuery().
		SetContractID(contractID).
		SetGas(1_000_000).
		SetFunction("getBasketIdCounter", nil)

	result, err := query.Execute(hc.client)
	if err != nil {
		return nil, fmt.Errorf("failed to query basket count: %w", err)
	}

	count := result.GetUint256(0)
	fmt.Printf("📦 Basket count: %v\n", count)
	return count, nil
}

// ============================================================
// Get Basket Config by ID
// ============================================================

func (hc *HederaClient) GetBasketConfig(factoryID string, basketID []byte) (map[string]any, error) {
	contractID, err := hc.ConvertStringToContractID(factoryID)
	if err != nil {
		return nil, err
	}

	params := hedera.NewContractFunctionParameters().
		AddUint256(basketID)

	query := hedera.NewContractCallQuery().
		SetContractID(contractID).
		SetGas(5_000_000).
		SetFunction("getBasketConfig", params)

	result, err := query.Execute(hc.client)
	if err != nil {
		return nil, fmt.Errorf("failed to get basket config: %w", err)
	}

	// Since Hedera doesn't natively return structs, this will require ABI decoding if using complex structs.
	// You can map result.GetAddress(), GetString(), etc. based on your Solidity return order.

	fmt.Printf("📜 Raw basket config: %v\n", result)
	return map[string]any{"raw": result}, nil
}

// ============================================================
// Update Basket NAV
// ============================================================

func (hc *HederaClient) UpdateBasketNAV(factoryID string, basketID, nav []byte) error {
	contractID, err := hc.ConvertStringToContractID(factoryID)
	if err != nil {
		return err
	}

	params := hedera.NewContractFunctionParameters().
		AddUint256(basketID).
		AddUint256(nav)

	tx, err := hedera.NewContractExecuteTransaction().
		SetContractID(contractID).
		SetGas(3_000_000).
		SetFunction("updateBasketNAV", params).
		Execute(hc.client)

	if err != nil {
		return fmt.Errorf("updateBasketNAV failed: %w", err)
	}

	receipt, err := tx.GetReceipt(hc.client)
	if err != nil {
		return fmt.Errorf("updateBasketNAV receipt error: %w", err)
	}

	fmt.Printf("📈 Basket NAV updated, status: %v\n", receipt.Status)
	return nil
}

// ============================================================
// Activate / Deactivate Basket
// ============================================================

func (hc *HederaClient) ToggleBasket(factoryID string, basketID []byte, activate bool) error {
	contractID, err := hc.ConvertStringToContractID(factoryID)
	if err != nil {
		return err
	}

	functionName := "deactivateBasket"
	if activate {
		functionName = "activateBasket"
	}

	params := hedera.NewContractFunctionParameters().
		AddUint256(basketID)

	tx, err := hedera.NewContractExecuteTransaction().
		SetContractID(contractID).
		SetGas(3_000_000).
		SetFunction(functionName, params).
		Execute(hc.client)

	if err != nil {
		return fmt.Errorf("%s failed: %w", functionName, err)
	}

	receipt, err := tx.GetReceipt(hc.client)
	if err != nil {
		return fmt.Errorf("%s receipt error: %w", functionName, err)
	}

	fmt.Printf("🟢 Basket %s, status: %v\n", functionName, receipt.Status)
	return nil
}

func (hc *HederaClient) GetBasketFactoryVersion() (string, error) {
	contractID, err := hc.ConvertStringToContractID(hc.cfg.HederaFactoryContractID)
	if err != nil {
		return "", err
	}

	query := hedera.NewContractCallQuery().
		SetContractID(contractID).
		SetGas(1_000_000).
		SetFunction("VERSION", nil)

	result, err := query.Execute(hc.client)
	if err != nil {
		return "", fmt.Errorf("failed to query basket count: %w", err)
	}

	count := result.GetString(0)
	fmt.Printf("📦 Basket factory version: %v\n", count)
	return count, nil
}
