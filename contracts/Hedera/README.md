# 🚀 Basketfy Complete Implementation & Deployment Guide

A-Z guide for implementing all Hedera services, smart contracts, and business logic.

---

## 📋 Table of Contents

1. [Smart Contract Deployment](#smart-contract-deployment)
2. [Go Backend Setup](#go-backend-setup)
3. [HTS Token Creation](#hts-token-creation)
4. [HCS Audit Logging](#hcs-audit-logging)
5. [DID Feeder Verification](#did-feeder-verification)
6. [Vault & Liquidity Management](#vault--liquidity-management)
7. [API Endpoints](#api-endpoints)
8. [End-to-End Workflows](#end-to-end-workflows)
9. [Testing & Debugging](#testing--debugging)

---

## Smart Contract Deployment

### Step 1: Install Foundry/Hardhat

```bash
cd smart-contracts

# Using Hardhat (recommended)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init

# Or using Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Step 2: Create hardhat.config.js

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    hedera_testnet: {
      url: "https://testnet.hashio.io/rpc",
      accounts: [process.env.HEDERA_OPERATOR_KEY],
      chainId: 296,
    },
    hedera_mainnet: {
      url: "https://mainnet.hashio.io/rpc",
      accounts: [process.env.HEDERA_OPERATOR_KEY],
      chainId: 295,
    },
  },
};
```

### Step 3: Create Deployment Script

**`scripts/deploy.js`:**

```javascript
async function main() {
  console.log("Deploying Basketfy contracts...");

  // Deploy BasketFactory
  const BasketFactory = await ethers.getContractFactory("BasketFactory");
  const hcsTopicId = "0x0000000000000000000000000000000000000167"; // Placeholder
  const factory = await BasketFactory.deploy(hcsTopicId);
  await factory.deployed();
  console.log("BasketFactory deployed to:", factory.address);

  // Deploy RebalancingOracle
  const RebalancingOracle = await ethers.getContractFactory("RebalancingOracle");
  const oracle = await RebalancingOracle.deploy(factory.address, process.env.ORACLE_ADDRESS);
  await oracle.deployed();
  console.log("RebalancingOracle deployed to:", oracle.address);

  // Deploy FeederVault
  const FeederVault = await ethers.getContractFactory("FeederVault");
  const vault = await FeederVault.deploy(factory.address);
  await vault.deployed();
  console.log("FeederVault deployed to:", vault.address);

  // Save deployment info
  const deploymentInfo = {
    factoryAddress: factory.address,
    oracleAddress: oracle.address,
    vaultAddress: vault.address,
    deployedAt: new Date().toISOString(),
  };

  const fs = require("fs");
  fs.writeFileSync(
    "../backend/.env.deployed",
    `FACTORY_CONTRACT_ID=${factory.address}\nORACLE_CONTRACT_ID=${oracle.address}\nVAULT_CONTRACT_ID=${vault.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Step 4: Deploy to Hedera Testnet

```bash
npx hardhat run scripts/deploy.js --network hedera_testnet
```

**Expected Output:**

```
Deploying Basketfy contracts...
BasketFactory deployed to: 0x... (Contract ID: 0.0.XXXXX)
RebalancingOracle deployed to: 0x... (Contract ID: 0.0.YYYYY)
FeederVault deployed to: 0x... (Contract ID: 0.0.ZZZZZ)
```

---

## Go Backend Setup

### Step 1: Initialize Go Project

```bash
cd backend

# Initialize go module
go mod init basketfy/backend

# Create main.go structure
mkdir -p {config,models,services,handlers,hedera}
```

### Step 2: Install Dependencies

```bash
go get github.com/hashgraph/hedera-sdk-go/v2
go get github.com/gin-gonic/gin
go get github.com/gin-contrib/cors
go get github.com/joho/godotenv

go mod download
go mod verify
```

### Step 3: Configure Environment

**`.env` file:**

```bash
# Hedera Credentials
HEDERA_OPERATOR_ID=0.0.XXXXX
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet

# Smart Contracts (from deployment)
FACTORY_CONTRACT_ID=0.0.FACTORY_ID
ORACLE_CONTRACT_ID=0.0.ORACLE_ID
VAULT_CONTRACT_ID=0.0.VAULT_ID

# HTS Token IDs (created by backend)
BTOKEN_ID=0.0.PLACEHOLDER
BASKET_NFT_ID=0.0.PLACEHOLDER

# HCS Topic (created by backend)
AUDIT_TOPIC_ID=0.0.PLACEHOLDER

# Backend
BACKEND_PORT=:8080
GO_ENV=development
VITE_API_URL=http://localhost:8080

# Oracles
PRICE_ORACLE_API=https://api.coingecko.com/api/v3
OKX_API_KEY=your_key
OKX_SECRET_KEY=your_secret
OKX_PASSPHRASE=your_passphrase
```

### Step 4: Create main.go

```bash
# Use the main.go code from artifacts above
# Save as: backend/main.go
```

### Step 5: Run Backend

```bash
go run main.go

# Or build binary
go build -o basketfy-backend
./basketfy-backend
```

**Expected Output:**

```
Starting Basketfy backend on :8080
Created HCS Topic: 0.0.TOPIC_ID
[GIN-debug] Loaded HTML Templates (0): 
[GIN-debug] Listening and serving HTTP on :8080
```

---

## HTS Token Creation

### Creating Fungible Token (bToken)

**Triggered on basket creation:**

```go
// backend/services/hts_service.go

func (hs *HederaService) CreateBToken(basketName string) (hedera.TokenID, error) {
    // Create bToken for basket
    tokenID, err := hs.hederaClient.CreateFungibleToken(
        context.Background(),
        fmt.Sprintf("Basketfy %s", basketName),
        fmt.Sprintf("b%s", strings.ToUpper(basketName[:2])), // e.g., bAI, bDeFi
    )
    if err != nil {
        return hedera.TokenID{}, err
    }
    return tokenID, nil
}
```

### Creating Basket Identity NFT

```go
func (hs *HederaService) CreateBasketNFT(basketName string) (hedera.TokenID, error) {
    // Create NFT for basket identity
    nftID, err := hs.hederaClient.CreateNonFungibleToken(
        context.Background(),
        fmt.Sprintf("Basketfy %s NFT", basketName),
        "BASKET_NFT",
    )
    if err != nil {
        return hedera.TokenID{}, err
    }
    return nftID, nil
}
```

### Mint bToken on User Deposit

```go
func (hs *HederaService) MintBTokenForDeposit(tokenID hedera.TokenID, amount uint64) error {
    return hs.hederaClient.MintToken(context.Background(), tokenID, amount)
}
```

### Burn bToken on Redemption

```go
func (hs *HederaService) BurnBTokenOnRedemption(tokenID hedera.TokenID, amount uint64) error {
    return hs.hederaClient.BurnToken(context.Background(), tokenID, amount)
}
```

---

## HCS Audit Logging

### Create HCS Topic

```go
// Called once at backend startup
func (app *App) InitializeAuditTopic() (hedera.TopicID, error) {
    topicID, err := app.hederaService.CreateHCSTopic(context.Background())
    if err != nil {
        return hedera.TopicID{}, err
    }
    app.auditTopicID = topicID
    return topicID, nil
}
```

### Log Events to HCS

```go
// Event types: BASKET_CREATED, BASKET_PURCHASE, BASKET_REDEMPTION, FEEDER_DEPOSIT, REBALANCE

func (hs *HederaService) LogEvent(
    topicID hedera.TopicID,
    eventType string,
    basketID uint64,
    actor string,
    details string,
) error {
    auditLog := HCSAuditLog{
        Timestamp: time.Now().Unix(),
        EventType: eventType,
        BasketID:  basketID,
        Actor:     actor,
        Details:   details,
    }
    
    logBytes, _ := json.Marshal(auditLog)
    
    _, err := hs.hederaClient.SubmitMessage(
        context.Background(),
        topicID,
        logBytes,
    )
    return err
}
```

### Query Audit Logs from Mirror Node

```go
import "net/http"

func GetAuditLogs(topicID string) ([]HCSAuditLog, error) {
    url := fmt.Sprintf("https://testnet.mirrornode.hedera.com/api/v1/topics/%s/messages", topicID)
    
    resp, err := http.Get(url)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    var result struct {
        Messages []struct {
            Message string `json:"message"`
        } `json:"messages"`
    }
    
    json.NewDecoder(resp.Body).Decode(&result)
    
    var logs []HCSAuditLog
    for _, msg := range result.Messages {
        var log HCSAuditLog
        json.Unmarshal([]byte(msg.Message), &log)
        logs = append(logs, log)
    }
    
    return logs, nil
}
```

---

## DID Feeder Verification

### Register Feeder with DID

```go
// backend/services/did_service.go

type DIDService struct {
    hederaClient *hedera.HederaClient
}

func (ds *DIDService) RegisterFeederDID(feederDID string, account hedera.AccountID) error {
    // Create DID document in production
    // For now, store mapping
    
    log.Printf("Registered DID: %s for account: %s", feederDID, account.String())
    
    // In production: store on Hedera DID registry
    // - Create DID document
    // - Store on ledger
    // - Issue verifiable credential
    
    return nil
}

func (ds *DIDService) VerifyFeederCredential(feederDID string) (bool, error) {
    // Query DID document from Hedera
    // Verify credential signature
    
    // Placeholder: accept all for testnet
    return len(feederDID) > 0, nil
}
```

### Middleware for DID Verification

```go
func DIDAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        feederDID := c.GetHeader("X-Feeder-DID")
        
        if feederDID == "" {
            c.JSON(401, gin.H{"error": "Missing feeder DID"})
            c.Abort()
            return
        }
        
        // Verify DID credential
        verified, err := didService.VerifyFeederCredential(feederDID)
        if err != nil || !verified {
            c.JSON(403, gin.H{"error": "Invalid feeder credential"})
            c.Abort()
            return
        }
        
        c.Set("feeder_did", feederDID)
        c.Next()
    }
}
```

---

## Vault & Liquidity Management

### Feeder Deposits Stablecoin

```go
// POST /feeder/deposit

func (bh *BasketHandler) DepositFeederLiquidity(c *gin.Context) {
    var req FeederVaultRequest
    c.ShouldBindJSON(&req)
    
    feederDID := c.MustGet("feeder_did").(string)
    
    vault, err := bh.vaultService.DepositStablecoin(
        c.Request.Context(),
        feederDID,
        req.StablecoinAmount,
    )
    if err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // Log to HCS
    bh.hederaService.LogEvent(
        bh.topicID,
        "FEEDER_DEPOSIT",
        0,
        feederDID,
        fmt.Sprintf("Deposited %d USDC", req.StablecoinAmount),
    )
    
    c.JSON(201, gin.H{
        "feeder_did": feederDID,
        "balance": vault.StablecoinBalance,
        "timestamp": time.Now().Unix(),
    })
}
```

### Feeder Withdraws Liquidity

```go
// GET /feeder/withdraw?feeder_did=xxx&amount=yyy

func (bh *BasketHandler) WithdrawFeederLiquidity(c *gin.Context) {
    feederDID := c.Query("feeder_did")
    amount, _ := strconv.ParseUint(c.Query("amount"), 10, 64)
    
    vault, err := bh.vaultService.WithdrawStablecoin(
        c.Request.Context(),
        feederDID,
        amount,
    )
    if err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // Log to HCS
    bh.hederaService.LogEvent(
        bh.topicID,
        "FEEDER_WITHDRAWAL",
        0,
        feederDID,
        fmt.Sprintf("Withdrew %d USDC", amount),
    )
    
    c.JSON(200, gin.H{
        "feeder_did": feederDID,
        "balance": vault.StablecoinBalance,
        "timestamp": time.Now().Unix(),
    })
}
```

### Query Feeder Vault Info

```go
// GET /feeder/vault?feeder_did=xxx

func (bh *BasketHandler) GetFeederVault(c *gin.Context) {
    feederDID := c.Query("feeder_did")
    
    vault, err := bh.vaultService.GetVault(feederDID)
    if err != nil {
        c.JSON(404, gin.H{"error": "Vault not found"})
        return
    }
    
    c.JSON(200, vault)
}
```

---

## API Endpoints

### Basket Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/basket/create` | Create new thematic basket |
| POST | `/basket/buy` | User deposits stablecoin, receives bToken |
| POST | `/basket/redeem` | User burns bToken, receives stablecoin |
| GET | `/basket/{id}` | Get basket info |
| POST | `/basket/rebalance` | Curator rebalances weights |

### Feeder Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/feeder/deposit` | Feeder deposits stablecoin liquidity |
| GET | `/feeder/withdraw` | Feeder withdraws liquidity |
| GET | `/feeder/vault` | Get feeder vault info |
| POST | `/feeder/register` | Register feeder with DID |

### Audit & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend health check |
| GET | `/audit-logs` | Retrieve HCS audit logs |
| GET | `/basket-tvl` | Get total value locked |

---

## End-to-End Workflows

### Workflow 1: Create Basket

```
1. Frontend calls POST /basket/create
   {
       "name": "AI Basket",
       "theme": "Artificial Intelligence",
       "tokens": ["0x...", "0x..."],
       "weights": [3000, 3000, 4000],
       "rebalance_frequency": 604800,
       "token_name": "Basketfy AI",
       "token_symbol": "bAI"
   }

2. Backend:
   - Creates HTS fungible token (bToken)
   - Creates HTS non-fungible token (NFT)
   - Stores basket config
   - Calls smart contract factory

3. HCS logs: BASKET_CREATED event

4. Response: basket_id, btoken_id, nft_id
```

### Workflow 2: User Buys Basket

```
1. Frontend calls POST /basket/buy
   {
       "basket_id": 1,
       "stablecoin": "USDC",
       "stablecoin_amount": 100000000 // 100 USDC (8 decimals)
   }

2. Backend:
   - Validates basket exists
   - Transfers 100 USDC from user
   - Calculates protocol fee (0.25%)
   - Mints ~99.75 bTokens via HTS
   - Updates TVL

3. HCS logs: BASKET_PURCHASE event

4. Response: btoken_minted, fee_deducted
```

### Workflow 3: User Redeems Basket

```
1. Frontend calls POST /basket/redeem
   {
       "basket_id": 1,
       "stablecoin": "USDC",
       "btoken_amount": 99750000 // ~99.75 bTokens
   }

2. Backend:
   - Validates user balance
   - Burns bToken via HTS
   - Calculates return (with fee)
   - Returns ~99.50 USDC

3. HCS logs: BASKET_REDEMPTION event

4. Response: stablecoin_returned, fee
```

### Workflow 4: Feeder Deposits Liquidity

```
1. Feeder calls POST /feeder/deposit
   {
       "feeder_did": "did:hedera:testnet:...",
       "stablecoin_amount": 1000000000 // 1000 USDC
   }

2. Backend:
   - Verifies DID credential
   - Transfers 1000 USDC to vault
   - Creates/updates feeder vault record
   - Accrues yield

3. HCS logs: FEEDER_DEPOSIT event

4. Response: new_balance, accrued_yield
```

---

## Testing & Debugging

### Health Check

```bash
curl http://localhost:8080/health

# Response:
# {"status": "healthy", "network": "testnet"}
```

### Create Test Basket

```bash
curl -X POST http://localhost:8080/basket/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Basket",
    "theme": "DeFi",
    "tokens": ["0x...", "0x..."],
    "weights": [5000, 5000],
    "rebalance_frequency": 604800,
    "token_name": "Test Token",
    "token_symbol": "TEST"
  }'
```

### Test User Purchase

```bash
curl -X POST http://localhost:8080/basket/buy \
  -H "Content-Type: application/json" \
  -d '{
    "basket_id": 1,
    "stablecoin": "0xA2025B9d07F5D4F3048822b5f4C11cPA41Ab850c9",
    "stablecoin_amount": 100000000
  }'
```

### Query HCS Audit Logs

```bash
curl "https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.TOPIC_ID/messages"
```

### View Transaction on Explorer

```
Hedera Testnet Explorer: https://testnet.explorer.hedera.com
Search by Transaction ID or Account ID
```

---

## Troubleshooting

### Issue: "Only admin" error

**Cause:** Contract caller is not authorized.

**Solution:** Ensure you're using the correct operator account.

### Issue: Token creation fails

**Cause:** Insufficient HBAR balance.

**Solution:** Request testnet HBAR from faucet: https://testnet.portal.hedera.com

### Issue: HCS message not visible

**Cause:** Mirror Node lag (usually <5 seconds).

**Solution:** Wait and retry query.

### Issue: Go backend won't start

**Cause:** Missing .env file or dependencies.

**Solution:** 
```bash
go mod tidy
go mod download
cp .env.example .env
# Fill in credentials
go run main.go
```

---

## Next Steps

1. **Frontend Integration:** Connect Vite React frontend to backend APIs
2. **Oracle Integration:** Implement real price feeds (CoinGecko, OKX)
3. **Production Deployment:** Deploy to Hedera Mainnet
4. **KYC Integration:** Add compliance layer for regulated assets
5. **Mobile Apps:** Develop USSD/WhatsApp interfaces