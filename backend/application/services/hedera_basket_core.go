package services

import (
	"fmt"

	hedera "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
)

// ============================================================
// Factory-triggered Deposit & Withdrawal
// ============================================================

func (bcs *HederaClient) RecordDeposit(coreID string, user string, stablecoinAmount, bTokenMinted []byte) error {
	contractID, err := hedera.ContractIDFromString(coreID)
	if err != nil {
		return fmt.Errorf("invalid core contract ID: %w", err)
	}

	params := hedera.NewContractFunctionParameters().
		AddUint256(stablecoinAmount).
		AddUint256(bTokenMinted)

	params, err = params.AddAddress(user)
	if err != nil {
		return fmt.Errorf("failed to add bToken address: %w", err)
	}

	tx, err := hedera.NewContractExecuteTransaction().
		SetContractID(contractID).
		SetGas(3_000_000).
		SetFunction("recordDeposit", params).
		Execute(bcs.client)

	if err != nil {
		return fmt.Errorf("recordDeposit failed: %w", err)
	}

	receipt, err := tx.GetReceipt(bcs.client)
	if err != nil {
		return fmt.Errorf("recordDeposit receipt error: %w", err)
	}

	fmt.Printf("📥 Deposit recorded, status: %v\n", receipt.Status)
	return nil
}

func (bcs *HederaClient) RecordWithdrawal(coreID string, user string, bTokenBurned, stablecoinReturned []byte) error {
	contractID, err := hedera.ContractIDFromString(coreID)
	if err != nil {
		return fmt.Errorf("invalid core contract ID: %w", err)
	}

	params := hedera.NewContractFunctionParameters().
		AddUint256(bTokenBurned).
		AddUint256(stablecoinReturned)
	params, err = params.AddAddress(user)
	if err != nil {
		return fmt.Errorf("failed to add bToken address: %w", err)
	}

	tx, err := hedera.NewContractExecuteTransaction().
		SetContractID(contractID).
		SetGas(3_000_000).
		SetFunction("recordWithdrawal", params).
		Execute(bcs.client)

	if err != nil {
		return fmt.Errorf("recordWithdrawal failed: %w", err)
	}

	receipt, err := tx.GetReceipt(bcs.client)
	if err != nil {
		return fmt.Errorf("recordWithdrawal receipt error: %w", err)
	}

	fmt.Printf("📤 Withdrawal recorded, status: %v\n", receipt.Status)
	return nil
}

// ============================================================
// User Weight Management
// ============================================================

func (bcs *HederaClient) SetUserWeights(coreID string, weights [][32]byte) error {
	contractID, err := hedera.ContractIDFromString(coreID)
	if err != nil {
		return fmt.Errorf("invalid core contract ID: %w", err)
	}

	params := hedera.NewContractFunctionParameters().
		AddUint256Array(weights)

	tx, err := hedera.NewContractExecuteTransaction().
		SetContractID(contractID).
		SetGas(5_000_000).
		SetFunction("setUserWeights", params).
		Execute(bcs.client)

	if err != nil {
		return fmt.Errorf("setUserWeights failed: %w", err)
	}

	receipt, err := tx.GetReceipt(bcs.client)
	if err != nil {
		return fmt.Errorf("setUserWeights receipt error: %w", err)
	}

	fmt.Printf("⚖️ User weights updated, status: %v\n", receipt.Status)
	return nil
}

func (bcs *HederaClient) RebalanceUserWeights(coreID string, weights [][32]byte) error {
	contractID, err := hedera.ContractIDFromString(coreID)
	if err != nil {
		return fmt.Errorf("invalid core contract ID: %w", err)
	}

	params := hedera.NewContractFunctionParameters().
		AddUint256Array(weights)

	tx, err := hedera.NewContractExecuteTransaction().
		SetContractID(contractID).
		SetGas(5_000_000).
		SetFunction("rebalanceUserWeights", params).
		Execute(bcs.client)

	if err != nil {
		return fmt.Errorf("rebalanceUserWeights failed: %w", err)
	}

	receipt, err := tx.GetReceipt(bcs.client)
	if err != nil {
		return fmt.Errorf("rebalanceUserWeights receipt error: %w", err)
	}

	fmt.Printf("🔄 User rebalanced, status: %v\n", receipt.Status)
	return nil
}

// ============================================================
// Curator-only Weight Update
// ============================================================

func (bcs *HederaClient) UpdateDefaultWeights(coreID string, weights [][32]byte) error {
	contractID, err := hedera.ContractIDFromString(coreID)
	if err != nil {
		return fmt.Errorf("invalid core contract ID: %w", err)
	}

	params := hedera.NewContractFunctionParameters().
		AddUint256Array(weights)

	tx, err := hedera.NewContractExecuteTransaction().
		SetContractID(contractID).
		SetGas(3_000_000).
		SetFunction("updateDefaultWeights", params).
		Execute(bcs.client)

	if err != nil {
		return fmt.Errorf("updateDefaultWeights failed: %w", err)
	}

	receipt, err := tx.GetReceipt(bcs.client)
	if err != nil {
		return fmt.Errorf("updateDefaultWeights receipt error: %w", err)
	}

	fmt.Printf("🧮 Default weights updated, status: %v\n", receipt.Status)
	return nil
}

// ============================================================
// View / Read-only Queries
// ============================================================

func (bcs *HederaClient) GetUserBTokenBalance(coreID, user string) ([]byte, error) {
	contractID, _ := hedera.ContractIDFromString(coreID)
	params := hedera.NewContractFunctionParameters()

	params, err := params.AddAddress(user)
	if err != nil {
		return nil, fmt.Errorf("failed to add bToken address: %w", err)
	}

	query := hedera.NewContractCallQuery().
		SetContractID(contractID).
		SetGas(1_000_000).
		SetFunction("getUserBTokenBalance", params)

	result, err := query.Execute(bcs.client)
	if err != nil {
		return nil, fmt.Errorf("failed to get user balance: %w", err)
	}
	return result.GetUint256(0), nil
}

func (bcs *HederaClient) GetTotalValueLocked(coreID string) ([]byte, error) {
	contractID, _ := hedera.ContractIDFromString(coreID)

	query := hedera.NewContractCallQuery().
		SetContractID(contractID).
		SetGas(1_000_000).
		SetFunction("getTotalValueLocked", nil)

	result, err := query.Execute(bcs.client)
	if err != nil {
		return nil, fmt.Errorf("failed to get TVL: %w", err)
	}
	return result.GetUint256(0), nil
}
