package hedera

import (
	"context"
	"fmt"
	"log"

	"github.com/hashgraph/hedera-sdk-go/v2"
)

type DIDFeederService struct {
	hederaService *HederaService
}

func NewDIDFeederService(hs *HederaService) *DIDFeederService {
	return &DIDFeederService{hederaService: hs}
}

// RegisterFeeder verifies and registers a feeder via DID
func (dfs *DIDFeederService) RegisterFeeder(
	ctx context.Context,
	feederDID string,
	feederAccount hedera.AccountID,
) (registered bool, err error) {

	// In production, verify DID document on Hedera
	// For now, simulate DID verification
	if len(feederDID) == 0 {
		return false, fmt.Errorf("invalid DID")
	}

	// Create verifiable credential for feeder
	// This would be stored on-chain in production
	log.Printf("Registered feeder DID: %s with account: %s", feederDID, feederAccount.String())
	return true, nil
}

// ============ VAULT SERVICE (FEEDER DEPOSITS) ============

type VaultService struct {
	hederaService *HederaService
	didService    *DIDFeederService
}

type FeederVault struct {
	FeederDID         string `json:"feeder_did"`
	StablecoinBalance uint64 `json:"stablecoin_balance"`
	DepositTimestamp  int64  `json:"deposit_timestamp"`
	YieldEarned       uint64 `json:"yield_earned"`
}

var feederVaults = make(map[string]*FeederVault)

func NewVaultService(hs *HederaService, dfs *DIDFeederService) *VaultService {
	return &VaultService{
		hederaService: hs,
		didService:    dfs,
	}
}

// DepositStablecoin allows feeder to deposit stablecoin liquidity
func (vs *VaultService) DepositStablecoin(
	ctx context.Context,
	feederDID string,
	amount uint64,
) (vault *FeederVault, err error) {

	if _, exists := feederVaults[feederDID]; !exists {
		feederVaults[feederDID] = &FeederVault{
			FeederDID:         feederDID,
			StablecoinBalance: 0,
			DepositTimestamp:  time.Now().Unix(),
			YieldEarned:       0,
		}
	}

	feederVaults[feederDID].StablecoinBalance += amount
	return feederVaults[feederDID], nil
}

// WithdrawStablecoin allows feeder to withdraw liquidity
func (vs *VaultService) WithdrawStablecoin(
	ctx context.Context,
	feederDID string,
	amount uint64,
) (vault *FeederVault, err error) {

	vault, exists := feederVaults[feederDID]
	if !exists || vault.StablecoinBalance < amount {
		return nil, fmt.Errorf("insufficient balance")
	}

	vault.StablecoinBalance -= amount
	return vault, nil
}

// GetVault retrieves feeder vault information
func (vs *VaultService) GetVault(feederDID string) (*FeederVault, error) {
	vault, exists := feederVaults[feederDID]
	if !exists {
		return nil, fmt.Errorf("vault not found")
	}
	return vault, nil
}
