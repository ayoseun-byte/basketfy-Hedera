package services

import (
	"fmt"
	"strings"

	hdrsdk "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
)

func (hc *HederaClient) ConvertStringToPrivateKey(keyStr string) (hdrsdk.PrivateKey, error) {
	privateKey, err := hdrsdk.PrivateKeyFromString(keyStr)
	if err != nil {
		return hdrsdk.PrivateKey{}, err
	}
	return privateKey, nil
}

func (hc *HederaClient) ConvertStringToAccountID(keyStr string) (hdrsdk.AccountID, error) {
	opID, err := hdrsdk.AccountIDFromString(keyStr)
	if err != nil {
		return hdrsdk.AccountID{}, err
	}
	return opID, nil
}

func (hc *HederaClient) ConvertStringToContractID(keyStr string) (hdrsdk.ContractID, error) {
	keyStr = strings.TrimSpace(keyStr)

	// If it's in Hedera format like 0.0.12345
	if strings.Contains(keyStr, ".") {
		contractID, err := hdrsdk.ContractIDFromString(keyStr)
		if err != nil {
			return hdrsdk.ContractID{}, fmt.Errorf("invalid contract ID string: %w", err)
		}
		return contractID, nil
	}

	// If it's an EVM address (0x-prefixed or plain hex)
	keyStr = strings.TrimPrefix(keyStr, "0x")
	if len(keyStr) != 40 {
		return hdrsdk.ContractID{}, fmt.Errorf("invalid evm address length: %d", len(keyStr))
	}

	// Assuming shard=0, realm=0 for most Hedera networks
	contractID, err := hdrsdk.ContractIDFromEvmAddress(0, 0, keyStr)
	if err != nil {
		return hdrsdk.ContractID{}, fmt.Errorf("failed to parse EVM address: %w", err)
	}

	return contractID, nil
}
