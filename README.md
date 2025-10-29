# 🪙 Basketfy — Thematic Token Baskets on Hedera  
**Track:** Onchain Finance & RWA  
**Built with:** Hedera Token Service (HTS) • Hedera Smart Contract Service (HSCS) • Hedera Consensus Service (HCS) • Hedera DID  

---

## 🌍 Overview

Basketfy makes crypto investing simple, social, and inclusive.

It enables anyone to **buy a theme instead of a token** — investing in curated, on-chain portfolios that represent entire narratives like **AI**, **DeFi Blue Chips**, **Stable Income**, or **African Growth**.  
Each theme is represented by a **basket token (bToken)** and backed by real crypto assets, transparently managed through smart contracts on **Hedera**.

In emerging markets where **currency volatility is high**, stablecoins have become lifelines — over **$50 billion in stablecoin transactions** were recorded in Africa over the past three years. Basketfy builds on this momentum by letting users **invest those stablecoins into diversified baskets**, lowering entry barriers and protecting purchasing power.

---

## 💡 Key Features

- 🎨 **Thematic Baskets** — invest in narratives like AI, DePIN, LSTs, or African Innovation.  
- ⚙️ **Smart Rebalancing** — uses live price oracles and off-chain AI logic to maintain target weights.  
- 💸 **Stablecoin-Friendly** — designed for stablecoin entry and exit, hedging local currency risk.  
- 🪪 **Basket Identity NFT** — each basket is represented by a unique NFT with metadata.  
- 🌐 **Feeder Network with DID** — verified liquidity providers (Feeders) supply stablecoins via Hedera DID.  
- 🧩 **Composable DeFi Primitive** — bTokens can be staked, traded, or used as collateral.  
- 💱 **DEX-Agnostic Integration** — connects to external liquidity via API or Hedera-based swap contracts.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    U[User / Investor] -->|Stablecoin Deposit| SC[Basket Factory Contract (HSCS)]
    F[Feeder / Liquidity Provider (DID Verified)] -->|Provides Liquidity| SC
    SC -->|Mint| HTS1[bToken (HTS)]
    SC -->|Mint| HTS2[Basket Identity NFT (HTS + Metadata)]
    SC -->|Record Event| HCS[Consensus Service Log]
    SC -->|Price Feeds + Rebalance| OFF[Offchain Price Oracle / AI Engine]
    OFF --> SC
    U <-->|Redeem / Swap| SC

⚙️ Installation & Setup

Prerequisites
	- Node.js ≥ 18.x
	- Hedera Testnet account (create via portal.hedera.com)
	- Git and npm

git clone https://github.com/yourusername/basketfy.git
cd basketfy

npm install

HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FACTORY_CONTRACT_ID=0.0.placeholder
HEDERA_NETWORK=testnet
OKX_API_KEY=your_okx_key
OKX_SECRET_KEY=your_okx_secret
OKX_PASSPHRASE=your_okx_passphrase
