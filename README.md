# 🪙 Basketfy — Thematic Token Baskets on Hedera

**Track:** Onchain Finance & RWA  
**Built with:** Hedera Token Service (HTS) • Hedera Smart Contract Service (HSCS) • Hedera Consensus Service (HCS) • Hedera DID

[Certification](https://certs.hashgraphdev.com/6c72b9fc-70c7-4027-93cf-8d436b916410.pdf)
[PitchDeck](https://drive.google.com/file/d/1zoco-MhcD07vHD5_x9zrPVcgMuuM2ftR/view?usp=sharing)
---

## 🌍 Overview

Basketfy makes crypto investing simple, social, and inclusive. It enables anyone to **buy a theme instead of a token** — investing in curated, on-chain portfolios that represent entire narratives like **AI**, **DeFi Blue Chips**, **Stable Income**, or **African Growth**. Each theme is represented by a **basket token (bToken)** and backed by real crypto assets, transparently managed through smart contracts on **Hedera**.

In emerging markets where **currency volatility is high**, stablecoins have become lifelines — over **$50 billion in stablecoin transactions** were recorded in Africa over the past three years. Basketfy builds on this momentum by letting users **invest those stablecoins into diversified baskets**, lowering entry barriers and protecting purchasing power.

---

## 💡 Key Features

- 🎨 **Thematic Baskets** — invest in narratives like AI, DePIN, LSTs, or African Innovation
- ⚙️ **Smart Rebalancing** — uses live price oracles and off-chain AI logic to maintain target weights
- 💸 **Stablecoin-Friendly** — designed for stablecoin entry and exit, hedging local currency risk
- 🪪 **Basket Identity NFT** — each basket is represented by a unique NFT with metadata
- 🌐 **Feeder Network with DID** — verified liquidity providers (Feeders) supply stablecoins via Hedera DID
- 🧩 **Composable DeFi Primitive** — bTokens can be staked, traded, or used as collateral
- 💱 **DEX-Agnostic Integration** — connects to external liquidity via API or Hedera-based swap contracts

---

## 🧠 Hedera Integration Summary

### Hedera Token Service (HTS) — Token & NFT Issuance

**Why HTS?** We chose HTS for minting and managing bTokens and Basket Identity NFTs because its sub-cent transaction costs (typically $0.001 per mint) make fractional investing economically viable for microinvestors in Africa. HTS's native support for custom token and NFT metadata eliminates the need for expensive Layer 2 solutions while maintaining Hedera's security guarantees. This directly enables our target use case: allowing users to invest as little as $1 USDC into a diversified basket without prohibitive fees.

**Transaction Types:**
- `HTS TokenCreate` — Creates new bToken fungible token with initial supply
- `HTS TokenMint` — Mints additional bToken shares when users deposit stablecoins
- `HTS TokenBurn` — Burns bToken on redemption
- `HTS NFTCreate` — Creates Basket Identity NFT (unique per basket theme)
- `HTS TokenTransfer` — Transfers bTokens between users and contracts
- `HTS TokenUpdate` — Updates token metadata and fee collectors

**Economic Justification:** HTS's predictable, sub-linear fee structure ensures that transaction costs remain stable regardless of transaction volume, critical for a protocol designed to scale to millions of microinvestors. For a user investing $10 USDC, HTS ensures the fee is ~$0.001, not a percentage of investment size. This supports financial sustainability by allowing the protocol to operate profitably on micro-scale investments common in emerging markets.

---

### Hedera Smart Contract Service (HSCS) — Basket Logic & Rebalancing

**Why HSCS?** We chose HSCS for basket creation, purchase, rebalancing, and redemption orchestration because its predictable, non-exponential gas pricing model eliminates the risk of sudden cost spikes that plague Ethereum-based protocols. With gas prices capped at $0.0001 per operation, we can guarantee users the exact cost of their transactions upfront—critical for emerging market adoption where unexpected fees erode trust. HSCS's 10-second finality also enables near-instant settlement, improving user experience.

**Transaction Types:**
- `ContractCall` — Basket Factory contract: create new basket, set weights/fees, configure rebalancing frequency
- `ContractCall` — Basket Core contract: execute stablecoin deposits and bToken mints
- `ContractCall` — Rebalancing contract: trigger weight rebalancing, execute swaps via DEX oracle
- `ContractCall` — Redemption contract: burn bToken, execute proportional asset/stablecoin return
- `ContractCreate` — Deploy factory and individual basket contracts to Hedera
- `ContractCall` — Feeder registration: verify DID and establish feeder eligibility

**Economic Justification:** HSCS's deterministic gas model ($0.0001 per operation, ~3-5M gas per complex operation) makes the protocol's unit economics viable for sub-$100 trades. On Ethereum, a rebalancing operation might cost $50–$200 depending on network congestion; on HSCS, it costs $0.30–$0.50 predictably. This cost certainty is non-negotiable for African users operating on tight margins, as it enables protocol sustainability at scale.

---

### Hedera Consensus Service (HCS) — Audit Logging & Transparency

**Why HCS?** We chose HCS for immutable logging of rebalancing events, feeder actions, and transaction proofs because regulators and institutional partners in Africa require transparent, tamper-proof audit trails for fund management. HCS's immutable append-only log ensures that every basket rebalancing, fee collection, and feeder action is cryptographically timestamped and cannot be altered retroactively—essential for regulatory compliance and user trust.

**Transaction Types:**
- `HCS SubmitMessage` — Log basket creation event with initial weights and curator identity
- `HCS SubmitMessage` — Log rebalancing event: previous weights, new weights, rebalancing timestamp, oracle price snapshot
- `HCS SubmitMessage` — Log feeder deposit/withdrawal events with account ID and amount
- `HCS SubmitMessage` — Log protocol fee collection: amounts, destination wallet, timestamp
- `HCS SubmitMessage` — Log user redemption events: bToken burned, assets returned, timestamp
- `Mirror Node Query` — Retrieve HCS messages for audit, regulatory reporting, and transparency dashboards

**Economic Justification:** HCS's $0.0001 per message cost enables comprehensive logging without bloating protocol expenses. For institutional clients, the immutable audit trail reduces their compliance costs—regulators and auditors can verify basket integrity on-chain rather than requiring expensive third-party audits. For users, public HCS logs provide proof of fair management, reducing the need for trust intermediaries and supporting direct protocol adoption.

---

### Hedera DID (Decentralized Identity) — Feeder Verification & Trust Layer

**Why Hedera DID?** We chose Hedera DID for verifying feeder wallets and establishing a Sybil-resistant trust layer because liquidity providers in emerging markets often lack traditional identity documentation. Hedera DID enables lightweight, privacy-preserving identity verification using on-chain credentials, allowing us to onboard African liquidity providers without KYC friction while maintaining accountability. DID credentials are portable and can be reused across Hedera dApps, building network effects.

**Transaction Types:**
- `DID DidCreate` — Register feeder identity with Hedera DID
- `DID CredentialIssue` — Issue verifiable credential confirming feeder's liquidity provider status
- `DID CredentialVerify` — Smart contracts query feeder's DID credential during deposit/withdrawal
- `DID Presentation` — Feeder presents credential for basket registration
- `DID StatusUpdate` — Revoke or suspend feeder credential if fraud is detected

**Economic Justification:** By using Hedera DID instead of traditional KYC providers (who charge $1–$10 per onboarding), we reduce feeder onboarding costs to near-zero while maintaining regulatory compliance. This enables Basketfy to bootstrap a network of 1,000s of liquidity providers across Africa without prohibitive identity verification expenses, directly supporting our unit economics for emerging market adoption.

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Vite + React)                    │
│                      http://localhost:5173                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ • Dashboard: view basket portfolio                           │  │
│  │ • Buy/Redeem UI: deposit USDC, receive bToken               │  │
│  │ • Rebalance monitor: real-time weight display               │  │
│  │ • Feeder management panel                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP/REST API calls
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Go + Gorilla/Gin)                      │
│                      http://localhost:8080                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ • REST API: /basket, /buy, /redeem, /rebalance              │  │
│  │ • Oracle service: fetch prices from CoinGecko/OKX           │  │
│  │ • Transaction builder: construct Hedera transactions        │  │
│  │ • Feeder management: DID verification, liquidity tracking   │  │
│  │ • Mirror Node client: query transaction status              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │ Hedera SDK (hederaSDK/go)
                             │ Smart Contract calls + HTS/HCS ops
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    HEDERA NETWORK (Testnet)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ HSCS (Smart Contracts)                                      │  │
│  │ ├─ Basket Factory Contract (0.0.XXXXX)                      │  │
│  │ │  • Creates new baskets, sets weights/fees                │  │
│  │ │  • Emits events: BasketCreated, BasketRebalanced        │  │
│  │ │                                                          │  │
│  │ ├─ Basket Core Contract (0.0.YYYYY - per basket)          │  │
│  │ │  • Handles deposits/withdrawals                         │  │
│  │ │  • Mints/burns bToken via HTS                           │  │
│  │ │  • Calls rebalancing logic                              │  │
│  │                                                            │  │
│  │ HTS (Token Service)                                        │  │
│  │ ├─ bToken (Fungible) ID: 0.0.AAAAA                        │  │
│  │ │  • Represents basket ownership share                   │  │
│  │ │  • Minted on deposit, burned on redemption             │  │
│  │ │                                                        │  │
│  │ ├─ Basket Identity NFT ID: 0.0.BBBBB                     │  │
│  │ │  • Unique NFT per basket theme                        │  │
│  │ │  • Carries metadata: theme, curator, weights         │  │
│  │                                                         │  │
│  │ HCS (Consensus Service)                                │  │
│  │ ├─ Audit Topic ID: 0.0.CCCCC                          │  │
│  │ │  • Logs all rebalancing events                       │  │
│  │ │  • Logs feeder actions                               │  │
│  │ │  • Immutable transaction proofs                       │  │
│  │                                                        │  │
│  │ DID Service                                            │  │
│  │ ├─ Feeder DID Documents registered                    │  │
│  │ │  • Credential verification for liquidity providers  │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ Mirror Node queries
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   HEDERA MIRROR NODE (Public Archive)                │
│              https://testnet.mirrornode.hedera.com                   │
│  ├─ REST API: Query transaction history, HCS messages               │
│  ├─ GRPC: Stream real-time events                                   │
│  └─ Data: Provides audit trail visibility for users & regulators    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Installation & Setup (10-Minute Quickstart)

### Prerequisites

- **Node.js** ≥ 18.x
- **Go** ≥ 1.21
- **Solidity** compiler (via Foundry or Hardhat)
- **Git** and standard CLI tools
- **Hedera Testnet account** (create at https://portal.hedera.com)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/basketfy.git
cd basketfy
```

### 2️⃣ Install Frontend Dependencies (Vite + React)

```bash
cd frontend
npm install
```

### 3️⃣ Install Backend Dependencies (Go)

```bash
cd ../backend
go mod download
go mod verify
```

### 4️⃣ Install Smart Contract Dependencies (Solidity)

```bash
cd ../smart-contracts
npm install  # For Hardhat/Foundry tooling
```

### 5️⃣ Configure Environment Variables

Create a `.env.example` file in the **root** directory for judges:

```bash
# Hedera Network Configuration
HEDERA_OPERATOR_ID=0.0.XXXXX
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com

# Smart Contract IDs (Post-Deployment)
FACTORY_CONTRACT_ID=0.0.PLACEHOLDER
BASKET_CORE_CONTRACT_ID=0.0.PLACEHOLDER
REBALANCING_CONTRACT_ID=0.0.PLACEHOLDER

# HTS Token IDs (Post-Deployment)
BTOKEN_ID=0.0.PLACEHOLDER
BASKET_NFT_ID=0.0.PLACEHOLDER

# HCS Topic ID (Post-Deployment)
AUDIT_TOPIC_ID=0.0.PLACEHOLDER

# Backend Configuration
BACKEND_PORT=8080
BACKEND_HOST=localhost
GO_ENV=development

# Oracle Configuration
PRICE_ORACLE_API=https://api.coingecko.com/api/v3
OKX_API_KEY=your_okx_key
OKX_SECRET_KEY=your_okx_secret
OKX_PASSPHRASE=your_okx_passphrase

# Frontend Configuration
VITE_API_URL=http://localhost:8080
VITE_HEDERA_NETWORK=testnet
```

**Create actual `.env` file** in the root and **backend** directory (do NOT commit):

```bash
cp .env.example .env
```

Fill in your **Hedera Operator ID** and **Operator Key** from the Hedera portal.

### 6️⃣ Deploy Smart Contracts to Hedera Testnet

```bash
cd smart-contracts
npm run deploy:testnet
```

This will:
- Compile Solidity contracts
- Deploy Basket Factory, Core, and Rebalancing contracts
- Output contract IDs to `.env`
- Create HTS tokens (bToken, Basket Identity NFT)
- Create HCS topic for audit logging
- Print all IDs to console

### 7️⃣ Start Backend Server

```bash
cd backend
go run main.go
```

**Expected output:**
```
[INFO] Backend server running on http://localhost:8080
[INFO] Connected to Hedera Testnet
[INFO] Mirror Node: https://testnet.mirrornode.hedera.com
```

### 8️⃣ Start Frontend (Vite Dev Server)

```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v4.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Press h to show help
```

### ✅ Verify Setup

- Open **http://localhost:5173** in browser → Dashboard should load
- Backend healthcheck: `curl http://localhost:8080/health`
- Smart contract interactions available in dashboard UI

---

## 📋 Running Environment Specifications

| Component | Running State | Port | Status Check |
|-----------|---------------|------|--------------|
| Frontend (Vite) | React dev server | `5173` | http://localhost:5173 |
| Backend (Go) | REST API server | `8080` | `curl http://localhost:8080/health` |
| Smart Contracts | Deployed to Hedera Testnet | — | Check console IDs from deployment |
| Hedera Testnet | Live (external) | — | https://testnet.mirrornode.hedera.com |

---

## 🪴 Deployed Hedera Testnet IDs

After running `npm run deploy:testnet`, the following IDs will be populated and logged:

```
=== HEDERA DEPLOYMENT SUMMARY ===

Operator Account: 0.0.XXXXX (Your Hedera testnet account)

Smart Contracts (HSCS):
├─ Basket Factory Contract ID: 0.0.FACTORY_ID
├─ Basket Core Contract ID: 0.0.CORE_ID
└─ Rebalancing Contract ID: 0.0.REBALANCE_ID

Tokens (HTS):
├─ bToken (Fungible) ID: 0.0.BTOKEN_ID
└─ Basket Identity NFT ID: 0.0.NFT_ID

Consensus (HCS):
└─ Audit Topic ID: 0.0.TOPIC_ID

Mirror Node URL: https://testnet.mirrornode.hedera.com
```

**Save these IDs** — they are required for the `.env` configuration and judge verification.

---

## 🔐 Security & Secrets

### ⚠️ CRITICAL: Private Key Protection

**NEVER commit the following files:**

```
.env (local configuration)
.env.local
*.key
private_key.txt
/backend/secrets/
/smart-contracts/.private_keys
```

Add to `.gitignore`:

```
.env
.env.local
.env.*.local
*.key
private_key.*
/backend/secrets/
/smart-contracts/.private_keys
node_modules/
/dist
/build
```

### Example Configuration Structure

**`.env.example`** (commit this):

```bash
# Hedera Testnet (No secrets here)
HEDERA_NETWORK=testnet
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com

# Placeholder IDs (Replace after deployment)
FACTORY_CONTRACT_ID=0.0.PLACEHOLDER
BTOKEN_ID=0.0.PLACEHOLDER
AUDIT_TOPIC_ID=0.0.PLACEHOLDER

# Non-sensitive Backend Config
BACKEND_PORT=8080
VITE_API_URL=http://localhost:8080

# Placeholder for secrets (DO NOT FILL IN EXAMPLE)
HEDERA_OPERATOR_ID=0.0.XXXXX
HEDERA_OPERATOR_KEY=<provided-by-judge>
OKX_API_KEY=<provided-by-judge>
```

### For Judges: Secure Credential Delivery

**Instructions in DoraHacks submission notes:**

> **Judge Access Credentials**
>
> To set up and test Basketfy locally, you will need a Hedera Testnet account and API keys. For security, credentials are provided separately:
>
> 1. **Hedera Testnet Account:**
>    - Account ID: `0.0.[JUDGE_ID]` (provided in DoraHacks judge credentials email)
>    - Private Key: Attached in encrypted DoraHacks submission text field (PGP-encrypted)
>
> 2. **Setup Instructions:**
>    - Decrypt the private key using the provided PGP key
>    - Create a local `.env` file and populate:
>      ```
>      HEDERA_OPERATOR_ID=0.0.[JUDGE_ID]
>      HEDERA_OPERATOR_KEY=<decrypted-key>
>      ```
>    - Run `npm run deploy:testnet` to generate contract IDs
>
> 3. **Oracle API Keys (Optional):**
>    - OKX API keys for live price feeds (if needed for testing)
>    - Contact: [maintainer-email@basketfy.dev]
>
> 4. **No Repo Changes Required:**
>    - All credentials are local-only; the public repo contains NO secrets.
>    - Deployment state is ephemeral (contracts on Testnet, easily redeployed).

---

## 📁 Repository Structure

```
basketfy/
├── README.md                          # Main documentation (this file)
├── .gitignore                         # Excludes .env, keys, node_modules
├── .env.example                       # Template for environment variables
│
├── frontend/                          # Vite + React UI
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BuyBasket.jsx
│   │   │   ├── RedeemBasket.jsx
│   │   │   └── FeederPanel.jsx
│   │   ├── services/
│   │   │   └── api.js                # Axios client for backend
│   │   └── App.jsx
│   └── .prettierrc                    # Code formatting
│
├── backend/                           # Go REST API
│   ├── go.mod
│   ├── go.sum
│   ├── main.go                        # Entry point
│   ├── config/
│   │   └── config.go                  # Load .env and config
│   ├── handlers/
│   │   ├── basket.go                  # GET/POST basket endpoints
│   │   ├── purchase.go                # POST /buy endpoint
│   │   ├── redeem.go                  # POST /redeem endpoint
│   │   └── rebalance.go               # POST /rebalance endpoint
│   ├── services/
│   │   ├── hedera_service.go          # Hedera SDK wrapper
│   │   ├── oracle_service.go          # Price oracle integration
│   │   └── feeder_service.go          # DID verification
│   ├── middleware/
│   │   └── cors.go
│   └── Makefile                       # Build commands
│
├── smart-contracts/                   # Solidity + Foundry/Hardhat
│   ├── package.json
│   ├── hardhat.config.js
│   ├── .solhint.json                  # Solidity linter
│   ├── contracts/
│   │   ├── BasketFactory.sol          # Factory contract
│   │   ├── BasketCore.sol             # Core basket logic
│   │   ├── Rebalancing.sol            # Rebalancing engine
│   │   └── interfaces/
│   │       └── IHedera*.sol
│   ├── test/
│   │   ├── BasketFactory.test.js
│   │   └── Integration.test.js
│   ├── scripts/
│   │   └── deploy.js                  # Deployment script
│   └── .prettierrc
│
└── .github/
    └── workflows/
        ├── lint.yml                   # ESLint + Go fmt checks
        └── test.yml                   # Run tests on PR
```

---

## 💻 Code Quality & Auditability

### Linting & Formatting

**Frontend (ESLint + Prettier):**

```bash
cd frontend
npm run lint       # Run ESLint
npm run format     # Auto-format with Prettier
```

**Backend (Go fmt + golangci-lint):**

```bash
cd backend
go fmt ./...                           # Format all Go files
golangci-lint run ./...                # Static analysis
```

**Smart Contracts (Solhint):**

```bash
cd smart-contracts
npm run lint       # Run Solhint linter
npm run format     # Format with Prettier
```

### Code Standards

- **Variable naming:** Descriptive, camelCase (frontend/backend), UPPER_CASE (constants)
- **Comments:** Inline comments for complex logic, JSDoc for public functions
- **Commit messages:** Conventional Commits (feat:, fix:, docs:, test:)

Example commit history:

```
feat(basket): add basket creation endpoint
fix(rebalance): resolve weight calculation precision error
docs(setup): update installation instructions
test(hedera): add HCS message logging tests
```

### Key Auditable Files

| File | Purpose | Language |
|------|---------|----------|
| `backend/services/hedera_service.go` | Hedera SDK interactions, transaction signing | Go |
| `smart-contracts/contracts/BasketCore.sol` | Core basket logic, weight management | Solidity |
| `frontend/src/services/api.js` | Backend API calls, error handling | JavaScript |
| `backend/handlers/rebalance.go` | Rebalancing orchestration | Go |

---

## 🧪 Running Tests

**Frontend:**

```bash
cd frontend
npm run test       # Vitest
```

**Backend:**

```bash
cd backend
go test ./...      # Run all tests
go test -cover ./...  # With coverage
```

**Smart Contracts:**

```bash
cd smart-contracts
npm run test       # Hardhat tests
npm run test:coverage  # Coverage report
```

---

## 🚀 Deployment Checklist

- [ ] All `.env` variables populated (never commit)
- [ ] Smart contracts deployed to Hedera Testnet
- [ ] Contract IDs logged to `.env`
- [ ] Backend running on `http://localhost:8080`
- [ ] Frontend running on `http://localhost:5173`
- [ ] All tests passing (`go test`, `npm test`, `hardhat test`)
- [ ] Linting clean (`npm run lint`, `golangci-lint run`)
- [ ] Git history clean (no large binary files, proper commit messages)

---

## 👩‍💻 Team

| Name | Role |
|------|------|
| Solomon Ayo | Lead Developer & Architect |
| Samuel Ayo | Backend Engineer / AI Integration |
| Jennifer | Frontend Engineer |
| Glory Essien | Business Developer & Strategy |

---

## 🔬 Future Roadmap

- 🧭 Cross-chain basket support via Hashport and LayerZero
- 💰 Integration with Hedera DEX for on-chain swaps
- 🤖 AI-assisted rebalancing strategies
- 🌍 Fiat on-ramps via Flutterwave and Paystack
- 📱 USSD + WhatsApp integration for microinvestors

---

## 🧭 Vision

Basketfy transforms crypto from speculation into inclusive, thematic investing — starting with Africa, where $50 billion in stablecoins already move through everyday life.

By using Hedera's efficient and transparent architecture, we're lowering barriers for the next billion users to invest, hedge, and participate in on-chain finance.

**Buy the theme. Build the future.**

---

## 📜 License

This project is licensed under the MIT License — see LICENSE for details.

---

## 📞 Support & Questions

For setup issues or questions:
- **GitHub Issues:** https://github.com/ayoseun-btes/basketfy-hedera/issues
- **Documentation:** Full guides in `/docs` folder
- **Contact:** jaoquin15@gmail.com
