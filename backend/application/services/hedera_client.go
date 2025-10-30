package services

import (
	"basai/config"
	"context"
	"fmt"

	"log"

	hdrsdk "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
)

type HederaClient struct {
	client *hdrsdk.Client
	cfg    *config.ConfigApplication
}

// NewHederaClient initializes Hedera SDK client
func NewHederaClient() (*HederaClient, error) {
	cfg := &config.AppConfig
	var client *hdrsdk.Client

	if cfg.HederaNetwork == "mainnet" {
		client = hdrsdk.ClientForMainnet()
	} else {
		client = hdrsdk.ClientForTestnet()
	}
	opID, err := hdrsdk.AccountIDFromString(cfg.HederaOperatorID)
	if err != nil {
		return nil, err
	}
	opKeys, err := hdrsdk.PrivateKeyFromString(cfg.HederaOperatorKey)
	if err != nil {
		return nil, err
	}
	txfees, err := hdrsdk.HbarFromString("10000")
	if err != nil {
		return nil, err
	}
	client.SetOperator(opID, opKeys)

	client.SetDefaultMaxTransactionFee(txfees) // 100 HBAR max

	return &HederaClient{
		client: client,
		cfg:    cfg,
	}, nil
}

// CreateHederaAccount creates a new Hedera account with initial balance
func (hc *HederaClient) CreateHederaAccount() (string, string, error) {
	// generate a new key pair
	newPrivateKey, _ := hdrsdk.PrivateKeyGenerateEcdsa()
	newPublicKey := newPrivateKey.PublicKey()
	// build & execute the account creation transaction
	transaction := hdrsdk.NewAccountCreateTransaction().
		SetECDSAKeyWithAlias(newPublicKey).   // set the account key
		SetInitialBalance(hdrsdk.NewHbar(20)) // fund with 20 HBAR

	// execute the transaction and get response
	txResponse, err := transaction.Execute(hc.client)
	if err != nil {
		return "", "", nil
	}

	// get the receipt to extract the new account ID
	receipt, err := txResponse.GetReceipt(hc.client)
	if err != nil {
		return "", "", nil
	}

	newAccountId := *receipt.AccountID

	fmt.Printf("Hedera Account created: %s\n", newAccountId.String())
	fmt.Printf("EVM Address: 0x%s\n", newPublicKey.ToEvmAddress())

	return newAccountId.String(), newPrivateKey.String(), nil

}

// CreateFungibleToken creates a new HTS fungible token (bToken)
func (hc *HederaClient) CreateFungibleToken(ctx context.Context, name, symbol string) (hdrsdk.TokenID, error) {
	payer, err := hc.ConvertStringToPrivateKey(hc.cfg.HederaOperatorKey)
	if err != nil {
		return hdrsdk.TokenID{}, err
	}
	opID, err := hc.ConvertStringToAccountID(hc.cfg.HederaOperatorID)
	if err != nil {
		return hdrsdk.TokenID{}, err
	}
	txn, err := hdrsdk.NewTokenCreateTransaction().
		SetTokenName(name).
		SetTokenSymbol(symbol).
		SetDecimals(8).
		SetInitialSupply(0).
		SetTreasuryAccountID(opID).
		SetAdminKey(payer).
		SetFreezeKey(payer).
		SetSupplyKey(payer).
		SetWipeKey(payer).
		FreezeWith(hc.client)
	if err != nil {
		return hdrsdk.TokenID{}, err
	}

	txn.Sign(payer)

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
	payer, err := hc.ConvertStringToPrivateKey(hc.cfg.HederaOperatorKey)
	if err != nil {
		return hdrsdk.TokenID{}, err
	}
	opID, err := hc.ConvertStringToAccountID(hc.cfg.HederaOperatorID)
	if err != nil {
		return hdrsdk.TokenID{}, err
	}
	txn, err := hdrsdk.NewTokenCreateTransaction().
		SetTokenName(name).
		SetTokenSymbol(symbol).
		SetTokenType(hdrsdk.TokenTypeNonFungibleUnique).
		SetTreasuryAccountID(opID).
		SetAdminKey(payer).
		SetSupplyKey(payer).
		FreezeWith(hc.client)
	if err != nil {
		return hdrsdk.TokenID{}, err
	}

	txn.Sign(payer)

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
	payer, err := hc.ConvertStringToPrivateKey(hc.cfg.HederaOperatorKey)
	if err != nil {
		return err
	}
	txn, err := hdrsdk.NewTokenMintTransaction().
		SetTokenID(tokenID).
		SetAmount(amount).
		FreezeWith(hc.client)
	if err != nil {
		return err
	}

	txn.Sign(payer)

	resp, err := txn.Execute(hc.client)
	if err != nil {
		return err
	}

	_, err = resp.GetReceiptQuery().Execute(hc.client)
	return err
}

// BurnToken burns bToken supply
func (hc *HederaClient) BurnToken(ctx context.Context, tokenID hdrsdk.TokenID, amount uint64) error {
	payer, err := hc.ConvertStringToPrivateKey(hc.cfg.HederaOperatorKey)
	if err != nil {
		return err
	}
	txn, err := hdrsdk.NewTokenBurnTransaction().
		SetTokenID(tokenID).
		SetAmount(amount).
		FreezeWith(hc.client)
	if err != nil {
		return err
	}

	txn.Sign(payer)

	resp, err := txn.Execute(hc.client)
	if err != nil {
		return err
	}

	_, err = resp.GetReceiptQuery().Execute(hc.client)
	return err
}

// CreateTopic creates HCS topic for audit logging
func (hc *HederaClient) CreateTopic(ctx context.Context, memo string) (hdrsdk.TopicID, error) {
	payer, err := hc.ConvertStringToPrivateKey(hc.cfg.HederaOperatorKey)
	if err != nil {
		return hdrsdk.TopicID{}, err
	}
	txn, err := hdrsdk.NewTopicCreateTransaction().
		SetTopicMemo(memo).
		SetAdminKey(payer).
		SetSubmitKey(payer).
		FreezeWith(hc.client)
	if err != nil {
		return hdrsdk.TopicID{}, err
	}

	txn.Sign(payer)

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
	payer, err := hc.ConvertStringToPrivateKey(hc.cfg.HederaOperatorKey)
	if err != nil {
		return hdrsdk.TransactionID{}, err
	}
	txn, err := hdrsdk.NewTopicMessageSubmitTransaction().
		SetTopicID(topicID).
		SetMessage(message).
		FreezeWith(hc.client)
	if err != nil {
		return hdrsdk.TransactionID{}, err
	}

	txn.Sign(payer)

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
