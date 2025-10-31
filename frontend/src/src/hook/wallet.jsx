// src/hooks/wallet.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import {
  setWalletConnected,
  setFormattedAddress,
} from '../store/store';
import logger from '../uutils/logger';

// Vault ABI
const VAULT_ABI = [
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
const HEDERA_TESTNET = {
  chainId: '0x128',
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

// Wallet Context
const WalletContext = createContext({});

// Wallet Provider Component
export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [vaultContract, setVaultContract] = useState(null);
  const dispatch = useDispatch();

  // Initialize on mount
  useEffect(() => {
    initializeWallet();
    checkExistingConnection();
  }, []);

  const initializeWallet = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);
      logger('MetaMask provider initialized');
    }
  };

  const checkExistingConnection = async () => {
    const savedAddress = sessionStorage.getItem('walletAddress');

    if (savedAddress) {
      try {
        await connectWallet(true);
      } catch (error) {
        logger(`Failed to restore wallet connection: ${error}`);
        sessionStorage.removeItem('walletAddress');
      }
    }
  };

  const switchToHederaTestnet = async (metaMaskProvider) => {
    if (!metaMaskProvider) {
      toast.error('MetaMask not installed');
      return false;
    }

    try {
      await metaMaskProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HEDERA_TESTNET.chainId }],
      });
      logger('Switched to Hedera Testnet');
      return true;
    } catch (error) {
      if (error.code === 4902) {
        try {
          await metaMaskProvider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: HEDERA_TESTNET.chainId,
                chainName: HEDERA_TESTNET.chainName,
                rpcUrls: [HEDERA_TESTNET.rpcUrl],
                nativeCurrency: HEDERA_TESTNET.nativeCurrency,
                blockExplorerUrls: [HEDERA_TESTNET.blockExplorerUrl],
              },
            ],
          });
          logger('Added Hedera Testnet to MetaMask');
          return true;
        } catch (addError) {
          logger(`Failed to add Hedera Testnet: ${addError.message}`);
          toast.error('Failed to add Hedera Testnet');
          return false;
        }
      }
      logger(`Failed to switch network: ${error.message}`);
      toast.error('Failed to switch to Hedera Testnet');
      return false;
    }
  };

  const connectWallet = async (skipPrompt = false) => {
    setConnecting(true);

    try {
      // Find MetaMask specifically
      let metaMaskProvider = null;
      
      if (window.ethereum?.isMetaMask && !window.ethereum?.isTrustWallet) {
        metaMaskProvider = window.ethereum;
      } else if (window.ethereum?.providers?.length > 0) {
        // Check provider array if multiple wallets installed
        metaMaskProvider = window.ethereum.providers.find(p => p.isMetaMask && !p.isTrustWallet);
      }
      
      if (!metaMaskProvider) {
        toast.error('MetaMask not found. Please install MetaMask.');
        return { success: false, error: 'MetaMask not installed' };
      }

      // Check and switch network
      const networkSwitched = await switchToHederaTestnet(metaMaskProvider);
      if (!networkSwitched) {
        return { success: false, error: 'Failed to switch to Hedera Testnet' };
      }

      // Request accounts
      let accounts;
      if (skipPrompt) {
        accounts = await metaMaskProvider.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
          return { success: false, error: 'MetaMask not connected' };
        }
      } else {
        accounts = await metaMaskProvider.request({
          method: 'eth_requestAccounts',
        });
      }

      const address = accounts[0];

      // Setup provider and signer
      const ethProvider = new ethers.BrowserProvider(metaMaskProvider);
      const ethSigner = await ethProvider.getSigner();

      setWallet(metaMaskProvider);
      setWalletAddress(address);
      setProvider(ethProvider);
      setSigner(ethSigner);
      setConnected(true);

      // Initialize vault contract
      const vaultAddr = import.meta.env.VITE_VAULT_CONTRACT_ADDRESS;
      if (vaultAddr) {
        const vault = new ethers.Contract(vaultAddr, VAULT_ABI, ethSigner);
        setVaultContract(vault);
        logger(`Vault contract initialized: ${vaultAddr}`);
      }

      // Store in session
      sessionStorage.setItem('walletAddress', address);

      // Setup event listeners
      setupWalletEventListeners();

      dispatch(setWalletConnected(true));
      dispatch(setFormattedAddress(formatAddress(address)));

      toast.success(`Connected: ${formatAddress(address)}`);
      logger(`Wallet connected: ${address}`);

      return { success: true, address };
    } catch (error) {
      logger(`Wallet connection error: ${error.message}`);
      toast.error('Failed to connect wallet');
      return { success: false, error: error.message };
    } finally {
      setConnecting(false);
    }
  };

  const setupWalletEventListeners = () => {
    if (!window.ethereum) return;

    window.ethereum.removeAllListeners?.();

    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        handleDisconnect();
      } else {
        const newAddress = accounts[0];
        setWalletAddress(newAddress);
        sessionStorage.setItem('walletAddress', newAddress);
        dispatch(setFormattedAddress(formatAddress(newAddress)));
        logger(`Account changed: ${newAddress}`);
      }
    });

    window.ethereum.on('chainChanged', () => {
      logger('Network changed');
      window.location.reload();
    });

    window.ethereum.on('disconnect', () => {
      handleDisconnect();
    });
  };

  const disconnectWallet = async () => {
    try {
      handleDisconnect();
      dispatch(setWalletConnected(false));
      dispatch(setFormattedAddress(''));
      toast.success('Wallet disconnected');
    } catch (error) {
      logger(`Disconnect error: ${error.message}`);
      handleDisconnect();
    }
  };

  const handleDisconnect = () => {
    setWallet(null);
    setWalletAddress('');
    setConnected(false);
    setSigner(null);
    setVaultContract(null);
    sessionStorage.removeItem('walletAddress');

    if (window.ethereum?.removeAllListeners) {
      window.ethereum.removeAllListeners();
    }
  };

  // Vault Contract Functions
  const registerFeeder = async (did, feederAddress) => {
    if (!vaultContract || !signer) {
      toast.error('Wallet not connected');
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const tx = await vaultContract.registerFeeder(did, feederAddress);
      await tx.wait();
      toast.success('Feeder registered successfully');
      logger(`Feeder registered: ${feederAddress}`);
      return { success: true, txHash: tx.hash };
    } catch (error) {
      logger(`Register feeder error: ${error.message}`);
      toast.error('Failed to register feeder');
      return { success: false, error: error.message };
    }
  };

  const depositLiquidity = async (feederAddress, stablecoinAddress, amount) => {
    if (!vaultContract || !signer) {
      toast.error('Wallet not connected');
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await vaultContract.depositLiquidity(
        feederAddress,
        stablecoinAddress,
        amountWei
      );
      await tx.wait();
      toast.success(`Deposited ${amount} successfully`);
      logger(`Liquidity deposited: ${amount}`);
      return { success: true, txHash: tx.hash };
    } catch (error) {
      logger(`Deposit error: ${error.message}`);
      toast.error('Failed to deposit liquidity');
      return { success: false, error: error.message };
    }
  };

  const withdrawLiquidity = async (feederAddress, stablecoinAddress, amount) => {
    if (!vaultContract || !signer) {
      toast.error('Wallet not connected');
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await vaultContract.withdrawLiquidity(
        feederAddress,
        stablecoinAddress,
        amountWei
      );
      await tx.wait();
      toast.success(`Withdrawn ${amount} successfully`);
      logger(`Liquidity withdrawn: ${amount}`);
      return { success: true, txHash: tx.hash };
    } catch (error) {
      logger(`Withdrawal error: ${error.message}`);
      toast.error('Failed to withdraw liquidity');
      return { success: false, error: error.message };
    }
  };

  const claimYield = async (feederAddress) => {
    if (!vaultContract || !signer) {
      toast.error('Wallet not connected');
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const tx = await vaultContract.claimYield(feederAddress);
      await tx.wait();
      toast.success('Yield claimed successfully');
      logger(`Yield claimed for: ${feederAddress}`);
      return { success: true, txHash: tx.hash };
    } catch (error) {
      logger(`Claim yield error: ${error.message}`);
      toast.error('Failed to claim yield');
      return { success: false, error: error.message };
    }
  };

  const getFeederInfo = async (feederAddress) => {
    if (!vaultContract) {
      logger('Vault contract not initialized');
      return null;
    }

    try {
      const info = await vaultContract.getFeederInfo(feederAddress);
      logger(`Fetched feeder info: ${feederAddress}`);
      return {
        did: info.did,
        stablecoinBalance: ethers.formatUnits(info.stablecoinBalance, 18),
        depositTimestamp: info.depositTimestamp.toNumber(),
        yieldEarned: ethers.formatUnits(info.yieldEarned, 18),
        verified: info.verified,
      };
    } catch (error) {
      logger(`Get feeder info error: ${error.message}`);
      return null;
    }
  };

  const calculateYield = async (feederAddress) => {
    if (!vaultContract) {
      logger('Vault contract not initialized');
      return null;
    }

    try {
      const yield_ = await vaultContract.calculateYield(feederAddress);
      return ethers.formatUnits(yield_, 18);
    } catch (error) {
      logger(`Calculate yield error: ${error.message}`);
      return null;
    }
  };

  const getTotalFeederLiquidity = async () => {
    if (!vaultContract) {
      logger('Vault contract not initialized');
      return null;
    }

    try {
      const total = await vaultContract.getTotalFeederLiquidity();
      return ethers.formatUnits(total, 18);
    } catch (error) {
      logger(`Get total liquidity error: ${error.message}`);
      return null;
    }
  };

  const formatAddress = (address) =>
    address && address !== 'null' && address !== ''
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : '';

  const value = {
    walletAddress,
    connected,
    connecting,
    provider,
    signer,
    vaultContract,
    walletConnected: connected && wallet && signer ? true : false,
    connectWallet,
    disconnectWallet,
    registerFeeder,
    depositLiquidity,
    withdrawLiquidity,
    claimYield,
    getFeederInfo,
    calculateYield,
    getTotalFeederLiquidity,
    formatAddress,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};