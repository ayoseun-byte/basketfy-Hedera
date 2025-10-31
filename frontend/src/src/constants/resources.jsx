import { BarChart3, DollarSign, Globe, Shield, Target, TrendingUp, Users, Zap } from "lucide-react";
import React from 'react';

export const mockBaskets = [
  {
    id: 1,
    name: "AI Projects Basket",
    description: "Top AI and machine learning tokens on Solana",
    creator: "AI Research DAO",
    performance7d: 12.5,
    performance30d: 34.2,
    holders: 1247,
    category: "AI",
    tokens: [
      { ticker: "RNDR", name: "Render Token", weight: 30, price: 8.45 },
      { ticker: "FET", name: "Fetch.ai", weight: 25, price: 0.82 },
      { ticker: "OCEAN", name: "Ocean Protocol", weight: 20, price: 0.54 },
      { ticker: "AGIX", name: "SingularityNET", weight: 15, price: 0.31 },
      { ticker: "NMR", name: "Numeraire", weight: 10, price: 17.23 }
    ],
    image: "🤖"
  },
  {
    id: 2,
    name: "Solana DeFi",
    description: "Leading DeFi protocols built on Solana",
    creator: "Solana Foundation",
    performance7d: -3.2,
    performance30d: 18.7,
    holders: 2156,
    category: "DeFi",
    tokens: [
      { ticker: "RAY", name: "Raydium", weight: 25, price: 1.85 },
      { ticker: "SRM", name: "Serum", weight: 20, price: 0.23 },
      { ticker: "ORCA", name: "Orca", weight: 20, price: 2.17 },
      { ticker: "MNGO", name: "Mango", weight: 15, price: 0.089 },
      { ticker: "TULIP", name: "Tulip Protocol", weight: 20, price: 3.42 }
    ],
    image: "🏦"
  },
  {
    id: 3,
    name: "Restaking",
    description: "Next-gen staking and restaking protocols",
    creator: "Staking Alliance",
    performance7d: 8.3,
    performance30d: 22.1,
    holders: 892,
    category: "Staking",
    tokens: [
      { ticker: "EIGEN", name: "EigenLayer", weight: 40, price: 4.23 },
      { ticker: "LDO", name: "Lido DAO", weight: 30, price: 1.87 },
      { ticker: "RPL", name: "Rocket Pool", weight: 20, price: 12.45 },
      { ticker: "SWISE", name: "StakeWise", weight: 10, price: 0.65 }
    ],
    image: "🔒"
  }
];

export const features = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: "One-Click Diversification",
    description: "Buy themed exposure with a single transaction instead of managing multiple tokens individually"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Smart Contract Security",
    description: "Built on Solana with audited contracts managing basket creation, minting, and redemption"
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Dynamic Rebalancing",
    description: "Automatic portfolio rebalancing based on market cap and oracle data feeds"
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "OKX DEX Integration",
    description: "Seamless swaps and liquidity through OKX DEX API for optimal price execution"
  }
];

export const stats = [
  { label: "Total Value Locked", value: "$12.4M", icon: <DollarSign className="w-5 h-5" /> },
  { label: "Active Baskets", value: "47", icon: <Target className="w-5 h-5" /> },
  { label: "Total Holders", value: "8.2K", icon: <Users className="w-5 h-5" /> },
  { label: "Avg 7D Performance", value: "+5.8%", icon: <TrendingUp className="w-5 h-5" /> }
];
// Vault ABI
export const VAULT_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'did', type: 'string' },
      { internalType: 'address', name: 'feederAddress', type: 'address' },
    ],
    name: 'registerFeeder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'feeder', type: 'address' },
      { internalType: 'address', name: 'stablecoin', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'depositLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'feeder', type: 'address' },
      { internalType: 'address', name: 'stablecoin', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'withdrawLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'feeder', type: 'address' }],
    name: 'claimYield',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'feeder', type: 'address' }],
    name: 'calculateYield',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'feeder', type: 'address' }],
    name: 'getFeederInfo',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'did', type: 'string' },
          { internalType: 'uint256', name: 'stablecoinBalance', type: 'uint256' },
          { internalType: 'uint256', name: 'depositTimestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'yieldEarned', type: 'uint256' },
          { internalType: 'bool', name: 'verified', type: 'bool' },
        ],
        internalType: 'struct FeedersVault.Feeder',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalFeederLiquidity',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// Hedera Testnet Configuration
export const HEDERA_TESTNET = {
  chainId: '0x128', // 296 in decimal
  chainIdDecimal: 296,
  rpcUrl: 'https://testnet.hashio.io/api',
  chainName: 'Hedera Testnet',
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'HBAR',
    decimals: 18,
  },
  blockExplorerUrl: 'https://hashscan.io/testnet',
};

