package hedera

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/hashgraph/hedera-sdk-go/v2"
)

// ============ CONFIG ============

type Config struct {
	HederaOperatorID  hedera.AccountID
	HederaOperatorKey hedera.PrivateKey
	HederaNetwork     string
	FactoryContractID hedera.ContractID
	AuditTopicID      hedera.TopicID
	MirrorNodeURL     string
	BackendPort       string
}

var cfg Config
var client *hedera.Client

// ============ DATA MODELS ============

type BasketConfig struct {
	Name               string   `json:"name"`
	Theme              string   `json:"theme"`
	Tokens             []string `json:"tokens"`
	Weights            []int    `json:"weights"`
	RebalanceFrequency int64    `json:"rebalance_frequency"`
	FeePercentage      int      `json:"fee_percentage"`
}

type CreateBasketRequest struct {
	Name               string   `json:"name" binding:"required"`
	Theme              string   `json:"theme" binding:"required"`
	Tokens             []string `json:"tokens" binding:"required"`
	Weights            []int    `json:"weights" binding:"required"`
	RebalanceFrequency int64    `json:"rebalance_frequency" binding:"required"`
	FeePercentage      int      `json:"fee_percentage"`
	TokenName          string   `json:"token_name" binding:"required"`
	TokenSymbol        string   `json:"token_symbol" binding:"required"`
}

type BuyBasketRequest struct {
	BasketID         uint64 `json:"basket_id" binding:"required"`
	Stablecoin       string `json:"stablecoin" binding:"required"`
	StablecoinAmount uint64 `json:"stablecoin_amount" binding:"required"`
}

type RedeemBasketRequest struct {
	BasketID     uint64 `json:"basket_id" binding:"required"`
	Stablecoin   string `json:"stablecoin" binding:"required"`
	BTokenAmount uint64 `json:"btoken_amount" binding:"required"`
}

type RebalanceRequest struct {
	BasketID   uint64 `json:"basket_id" binding:"required"`
	NewWeights []int  `json:"new_weights" binding:"required"`
}

type BasketResponse struct {
	BasketID         uint64       `json:"basket_id"`
	BTokenAddress    string       `json:"btoken_address"`
	NFTAddress       string       `json:"nft_address"`
	Config           BasketConfig `json:"config"`
	TotalValueLocked uint64       `json:"total_value_locked"`
	CreatedAt        int64        `json:"created_at"`
}

type FeederVaultRequest struct {
	FeederDID        string `json:"feeder_did" binding:"required"`
	StablecoinAmount uint64 `json:"stablecoin_amount" binding:"required"`
	Stablecoin       string `json:"stablecoin" binding:"required"`
}

type HCSAuditLog struct {
	Timestamp int64  `json:"timestamp"`
	EventType string `json:"event_type"`
	BasketID  uint64 `json:"basket_id"`
	Actor     string `json:"actor"`
	Amount    uint64 `json:"amount"`
	Details   string `json:"details"`
}

func initHederaClient() {
	var err error
	if cfg.HederaNetwork == "testnet" {
		client = hedera.ClientForTestnet()
	} else {
		client = hedera.ClientForMainnet()
	}

	client.SetOperator(cfg.HederaOperatorID, cfg.HederaOperatorKey)
	client.SetDefaultMaxTransactionFee(hedera.HbarFromCents(1000))
}

type HederaService struct {
	client *hedera.Client
}

func NewHederaService(c *hedera.Client) *HederaService {
	return &HederaService{client: c}
}

// CreateBasketTokens creates both bToken (fungible) and Basket NFT
func (hs *HederaService) CreateBasketTokens(
	ctx context.Context,
	basketName string,
	tokenName string,
	tokenSymbol string,
) (bTokenID, nftID hedera.TokenID, err error) {

	// Create bToken (fungible token)
	bTokenID, err = hs.createFungibleToken(ctx, tokenName, tokenSymbol)
	if err != nil {
		return
	}

	// Create Basket Identity NFT
	nftID, err = hs.createNonFungibleToken(ctx, basketName, "BASKET_NFT")
	if err != nil {
		return
	}

	return
}

func (hs *HederaService) createFungibleToken(
	ctx context.Context,
	name string,
	symbol string,
) (hedera.TokenID, error) {

	tokenCreateTx, err := hedera.NewTokenCreateTransaction().
		SetTokenName(name).
		SetTokenSymbol(symbol).
		SetDecimals(8).
		SetInitialSupply(0).
		SetTreasuryAccountID(cfg.HederaOperatorID).
		SetAdminKey(cfg.HederaOperatorKey).
		SetFreezeKey(cfg.HederaOperatorKey).
		SetWipeKey(cfg.HederaOperatorKey).
		SetSupplyKey(cfg.HederaOperatorKey).
		FreezeWith(hs.client)
	if err != nil {
		return hedera.TokenID{}, err
	}

	tokenCreateTx.Sign(cfg.HederaOperatorKey)

	tokenCreateResp, err := tokenCreateTx.Execute(hs.client)
	if err != nil {
		return hedera.TokenID{}, err
	}

	tokenCreateReceipt, err := tokenCreateResp.GetReceiptQuery().Execute(hs.client)
	if err != nil {
		return hedera.TokenID{}, err
	}

	return *tokenCreateReceipt.TokenID, nil
}

func (hs *HederaService) createNonFungibleToken(
	ctx context.Context,
	name string,
	symbol string,
) (hedera.TokenID, error) {

	tokenCreateTx, err := hedera.NewTokenCreateTransaction().
		SetTokenName(name).
		SetTokenSymbol(symbol).
		SetTokenType(hedera.TokenTypeNonFungibleUnique).
		SetTreasuryAccountID(cfg.HederaOperatorID).
		SetAdminKey(cfg.HederaOperatorKey).
		SetSupplyKey(cfg.HederaOperatorKey).
		FreezeWith(hs.client)
	if err != nil {
		return hedera.TokenID{}, err
	}

	tokenCreateTx.Sign(cfg.HederaOperatorKey)

	tokenCreateResp, err := tokenCreateTx.Execute(hs.client)
	if err != nil {
		return hedera.TokenID{}, err
	}

	tokenCreateReceipt, err := tokenCreateResp.GetReceiptQuery().Execute(hs.client)
	if err != nil {
		return hedera.TokenID{}, err
	}

	return *tokenCreateReceipt.TokenID, nil
}

// MintBToken mints bToken shares when user deposits stablecoin
func (hs *HederaService) MintBToken(
	ctx context.Context,
	tokenID hedera.TokenID,
	amount uint64,
) error {

	mintTx, err := hedera.NewTokenMintTransaction().
		SetTokenID(tokenID).
		SetAmount(amount).
		FreezeWith(hs.client)
	if err != nil {
		return err
	}

	mintTx.Sign(cfg.HederaOperatorKey)

	mintResp, err := mintTx.Execute(hs.client)
	if err != nil {
		return err
	}

	_, err = mintResp.GetReceiptQuery().Execute(hs.client)
	return err
}

// BurnBToken burns bToken when user redeems
func (hs *HederaService) BurnBToken(
	ctx context.Context,
	tokenID hedera.TokenID,
	amount uint64,
) error {

	burnTx, err := hedera.NewTokenBurnTransaction().
		SetTokenID(tokenID).
		SetAmount(amount).
		FreezeWith(hs.client)
	if err != nil {
		return err
	}

	burnTx.Sign(cfg.HederaOperatorKey)

	burnResp, err := burnTx.Execute(hs.client)
	if err != nil {
		return err
	}

	_, err = burnResp.GetReceiptQuery().Execute(hs.client)
	return err
}

// LogToHCS submits audit event to Hedera Consensus Service
func (hs *HederaService) LogToHCS(
	ctx context.Context,
	topicID hedera.TopicID,
	eventType string,
	basketID uint64,
	actor string,
	details string,
) (hedera.TransactionID, error) {

	auditLog := HCSAuditLog{
		Timestamp: time.Now().Unix(),
		EventType: eventType,
		BasketID:  basketID,
		Actor:     actor,
		Details:   details,
	}

	logBytes, err := json.Marshal(auditLog)
	if err != nil {
		return hedera.TransactionID{}, err
	}

	messageTx, err := hedera.NewTopicMessageSubmitTransaction().
		SetTopicID(topicID).
		SetMessage(logBytes).
		FreezeWith(hs.client)
	if err != nil {
		return hedera.TransactionID{}, err
	}

	messageTx.Sign(cfg.HederaOperatorKey)

	messageResp, err := messageTx.Execute(hs.client)
	if err != nil {
		return hedera.TransactionID{}, err
	}

	return messageResp.TransactionID, nil
}

// CreateHCSTopic creates a new HCS topic for audit logging
func (hs *HederaService) CreateHCSTopic(ctx context.Context) (hedera.TopicID, error) {

	topicCreateTx, err := hedera.NewTopicCreateTransaction().
		SetTopicMemo("Basketfy Audit Log").
		SetAdminKey(cfg.HederaOperatorKey).
		SetSubmitKey(cfg.HederaOperatorKey).
		FreezeWith(hs.client)
	if err != nil {
		return hedera.TopicID{}, err
	}

	topicCreateTx.Sign(cfg.HederaOperatorKey)

	topicCreateResp, err := topicCreateTx.Execute(hs.client)
	if err != nil {
		return hedera.TopicID{}, err
	}

	topicCreateReceipt, err := topicCreateResp.GetReceiptQuery().Execute(hs.client)
	if err != nil {
		return hedera.TopicID{}, err
	}

	return *topicCreateReceipt.TopicID, nil
}
