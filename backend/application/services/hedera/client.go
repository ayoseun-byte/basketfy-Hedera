package hedera

import (
	"basai/config"
	"context"

	"log"

	hdrsdk "github.com/hashgraph/hedera-sdk-go/v2"
)

type HederaClient struct {
	client *hdrsdk.Client
	cfg    *config.AppConfig
}

// NewHederaClient initializes Hedera SDK client
func NewHederaClient(cfg *config.AppConfig) (*HederaClient, error) {
	var client *hdrsdk.Client

	if cfg.HederaNetwork == "mainnet" {
		client = hdrsdk.ClientForMainnet()
	} else {
		client = hdrsdk.ClientForTestnet()
	}

	client.SetOperator(cfg.HederaOperatorID, cfg.HederaOperatorKey)
	client.SetDefaultMaxTransactionFee(hdrsdk.HbarFromCents(10000)) // 100 HBAR max

	return &HederaClient{
		client: client,
		cfg:    cfg,
	}, nil
}

// CreateFungibleToken creates a new HTS fungible token (bToken)
func (hc *HederaClient) CreateFungibleToken(ctx context.Context, name, symbol string) (hdrsdk.TokenID, error) {
	txn, err := hdrsdk.NewTokenCreateTransaction().
		SetTokenName(name).
		SetTokenSymbol(symbol).
		SetDecimals(8).
		SetInitialSupply(0).
		SetTreasuryAccountID(hc.cfg.HederaOperatorID).
		SetAdminKey(hc.cfg.HederaOperatorKey).
		SetFreezeKey(hc.cfg.HederaOperatorKey).
		SetSupplyKey(hc.cfg.HederaOperatorKey).
		SetWipeKey(hc.cfg.HederaOperatorKey).
		FreezeWith(hc.client)
	if err != nil {
		return hdrsdk.TokenID{}, err
	}

	txn.Sign(hc.cfg.HederaOperatorKey)

	resp, err := txn.Execute(hc.client)
	if err != nil {
		return hdrsdk.TokenID{}, err
	}

	receipt, err := resp.GetReceiptQuery().Execute(hc.client)
	if err != nil {
		return hdrsdk.TokenID{}, err
	}

	log.Printf("Created fungible token: %v", receipt.TokenID)
	return *receipt.TokenID, nil
}

// CreateNonFungibleToken creates a Basket Identity NFT
func (hc *HederaClient) CreateNonFungibleToken(ctx context.Context, name, symbol string) (hdrsdk.TokenID, error) {
	txn, err := hdrsdk.NewTokenCreateTransaction().
		SetTokenName(name).
		SetTokenSymbol(symbol).
		SetTokenType(hdrsdk.TokenTypeNonFungibleUnique).
		SetTreasuryAccountID(hc.cfg.HederaOperatorID).
		SetAdminKey(hc.cfg.HederaOperatorKey).
		SetSupplyKey(hc.cfg.HederaOperatorKey).
		FreezeWith(hc.client)
	if err != nil {
		return hdrsdk.TokenID{}, err
	}

	txn.Sign(hc.cfg.HederaOperatorKey)

	resp, err := txn.Execute(hc.client)
	if err != nil {
		return hdrsdk.TokenID{}, err
	}

	receipt, err := resp.GetReceiptQuery().Execute(hc.client)
	if err != nil {
		return hdrsdk.TokenID{}, err
	}

	log.Printf("Created NFT token: %v", receipt.TokenID)
	return *receipt.TokenID, nil
}

// MintToken mints bToken supply
func (hc *HederaClient) MintToken(ctx context.Context, tokenID hdrsdk.TokenID, amount uint64) error {
	txn, err := hdrsdk.NewTokenMintTransaction().
		SetTokenID(tokenID).
		SetAmount(amount).
		FreezeWith(hc.client)
	if err != nil {
		return err
	}

	txn.Sign(hc.cfg.HederaOperatorKey)

	resp, err := txn.Execute(hc.client)
	if err != nil {
		return err
	}

	_, err = resp.GetReceiptQuery().Execute(hc.client)
	return err
}

// BurnToken burns bToken supply
func (hc *HederaClient) BurnToken(ctx context.Context, tokenID hdrsdk.TokenID, amount uint64) error {
	txn, err := hdrsdk.NewTokenBurnTransaction().
		SetTokenID(tokenID).
		SetAmount(amount).
		FreezeWith(hc.client)
	if err != nil {
		return err
	}

	txn.Sign(hc.cfg.HederaOperatorKey)

	resp, err := txn.Execute(hc.client)
	if err != nil {
		return err
	}

	_, err = resp.GetReceiptQuery().Execute(hc.client)
	return err
}

// CreateTopic creates HCS topic for audit logging
func (hc *HederaClient) CreateTopic(ctx context.Context, memo string) (hdrsdk.TopicID, error) {
	txn, err := hdrsdk.NewTopicCreateTransaction().
		SetTopicMemo(memo).
		SetAdminKey(hc.cfg.HederaOperatorKey).
		SetSubmitKey(hc.cfg.HederaOperatorKey).
		FreezeWith(hc.client)
	if err != nil {
		return hdrsdk.TopicID{}, err
	}

	txn.Sign(hc.cfg.HederaOperatorKey)

	resp, err := txn.Execute(hc.client)
	if err != nil {
		return hdrsdk.TopicID{}, err
	}

	receipt, err := resp.GetReceiptQuery().Execute(hc.client)
	if err != nil {
		return hdrsdk.TopicID{}, err
	}

	log.Printf("Created HCS topic: %v", receipt.TopicID)
	return *receipt.TopicID, nil
}

// SubmitMessage submits audit log message to HCS
func (hc *HederaClient) SubmitMessage(ctx context.Context, topicID hdrsdk.TopicID, message []byte) (hdrsdk.TransactionID, error) {
	txn, err := hdrsdk.NewTopicMessageSubmitTransaction().
		SetTopicID(topicID).
		SetMessage(message).
		FreezeWith(hc.client)
	if err != nil {
		return hdrsdk.TransactionID{}, err
	}

	txn.Sign(hc.cfg.HederaOperatorKey)

	resp, err := txn.Execute(hc.client)
	if err != nil {
		return hdrsdk.TransactionID{}, err
	}

	return resp.TransactionID, nil
}

// Close closes the Hedera client connection
func (hc *HederaClient) Close() error {
	return hc.client.Close()
}
