import { useState, useCallback } from 'react';
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { Contract, BrowserProvider, parseUnits, formatUnits } from "ethers";
import { VAULT_CONTRACT_ID } from '../../constants/config';

// Replace with your contract address
const VAULT_CONTRACT_ADDRESS = VAULT_CONTRACT_ID;

// FeedersVault ABI
const VAULT_ABI = [
  "function registerFeeder(string did, address feederAddress) external",
  "function depositLiquidity(address feeder, address stablecoin, uint256 amount) external",
  "function withdrawLiquidity(address feeder, address stablecoin, uint256 amount) external",
  "function claimYield(address feeder) external",
  "function calculateYield(address feeder) external view returns (uint256)",
  "function getFeederInfo(address feeder) external view returns (tuple(string did, uint256 stablecoinBalance, uint256 depositTimestamp, uint256 yieldEarned, bool verified))",
  "function getTotalFeederLiquidity() external view returns (uint256)",
  "function feeders(address) external view returns (string did, uint256 stablecoinBalance, uint256 depositTimestamp, uint256 yieldEarned, bool verified)",
  "function didToAddress(string) external view returns (address)",
  "function yieldRate() external view returns (uint256)",
  "function totalFeederLiquidity() external view returns (uint256)"
];

// ERC20 ABI for token approval
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)"
];

/**
 * Custom hook for interacting with FeedersVault contract
 * @returns {Object} Contract interaction methods and state
 */
export const useFeedersVault = () => {
  const { walletProvider } = useAppKitProvider("eip155");
  const { address, isConnected } = useAppKitAccount();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============ READ FUNCTIONS ============

  /**
   * Get feeder information for a specific address
   * @param {string} feederAddress - The feeder's wallet address (defaults to connected address)
   * @returns {Promise<Object>} Feeder information
   */
  const getFeederInfo = useCallback(async (feederAddress = address) => {
    if (!walletProvider || !feederAddress) {
      throw new Error("Wallet not connected or address not provided");
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const ethersProvider = new BrowserProvider(walletProvider);
      const contract = new Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, ethersProvider);
      
      const info = await contract.getFeederInfo(feederAddress);
      
      const feederData = {
        did: info[0],
        stablecoinBalance: formatUnits(info[1], 18),
        stablecoinBalanceRaw: info[1],
        depositTimestamp: Number(info[2]),
        depositDate: new Date(Number(info[2]) * 1000),
        yieldEarned: formatUnits(info[3], 18),
        yieldEarnedRaw: info[3],
        verified: info[4]
      };
      
      console.log("Feeder Info:", feederData);
      return feederData;
    } catch (err) {
      console.error("Error getting feeder info:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletProvider, address]);

  /**
   * Calculate yield for a feeder
   * @param {string} feederAddress - The feeder's wallet address (defaults to connected address)
   * @returns {Promise<string>} Calculated yield in token units
   */
  const calculateYield = useCallback(async (feederAddress = address) => {
    if (!walletProvider || !feederAddress) {
      throw new Error("Wallet not connected or address not provided");
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const ethersProvider = new BrowserProvider(walletProvider);
      const contract = new Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, ethersProvider);
      
      const yieldAmount = await contract.calculateYield(feederAddress);
      const formattedYield = formatUnits(yieldAmount, 18);
      
      console.log("Calculated Yield:", formattedYield);
      return formattedYield;
    } catch (err) {
      console.error("Error calculating yield:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletProvider, address]);

  /**
   * Get total liquidity in the vault
   * @returns {Promise<string>} Total liquidity in token units
   */
  const getTotalFeederLiquidity = useCallback(async () => {
    if (!walletProvider) {
      throw new Error("Wallet not connected");
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const ethersProvider = new BrowserProvider(walletProvider);
      const contract = new Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, ethersProvider);
      
      const total = await contract.getTotalFeederLiquidity();
      const formattedTotal = formatUnits(total, 18);
      
      console.log("Total Liquidity:", formattedTotal);
      return formattedTotal;
    } catch (err) {
      console.error("Error getting total liquidity:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletProvider]);

  /**
   * Get the current yield rate
   * @returns {Promise<number>} Yield rate in basis points (e.g., 500 = 5%)
   */
  const getYieldRate = useCallback(async () => {
    if (!walletProvider) {
      throw new Error("Wallet not connected");
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const ethersProvider = new BrowserProvider(walletProvider);
      const contract = new Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, ethersProvider);
      
      const rate = await contract.yieldRate();
      const rateNumber = Number(rate);
      
      console.log("Yield Rate:", rateNumber, "basis points");
      return rateNumber;
    } catch (err) {
      console.error("Error getting yield rate:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletProvider]);

  /**
   * Get address by DID
   * @param {string} did - Decentralized identifier
   * @returns {Promise<string>} Wallet address associated with the DID
   */
  const getAddressByDID = useCallback(async (did) => {
    if (!walletProvider || !did) {
      throw new Error("Wallet not connected or DID not provided");
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const ethersProvider = new BrowserProvider(walletProvider);
      const contract = new Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, ethersProvider);
      
      const walletAddress = await contract.didToAddress(did);
      
      console.log("Address for DID:", walletAddress);
      return walletAddress;
    } catch (err) {
      console.error("Error getting address by DID:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletProvider]);

  // ============ WRITE FUNCTIONS ============

  /**
   * Register a new feeder with DID
   * @param {string} did - Decentralized identifier
   * @param {string} feederAddress - The feeder's wallet address
   * @returns {Promise<Object>} Transaction receipt
   */
  const registerFeeder = useCallback(async (did, feederAddress) => {
    if (!walletProvider) {
      throw new Error("Wallet not connected");
    }
    
    if (!did || !feederAddress) {
      throw new Error("DID and feeder address are required");
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, signer);
      
      console.log("Registering feeder...");
      const tx = await contract.registerFeeder(did, feederAddress);
      console.log("Transaction submitted:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      return { tx, receipt };
    } catch (err) {
      console.error("Error registering feeder:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletProvider]);

  /**
   * Deposit liquidity into the vault
   * @param {string} feederAddress - The feeder's wallet address
   * @param {string} stablecoinAddress - The stablecoin contract address
   * @param {string} amount - Amount to deposit (in token units, e.g., "100")
   * @returns {Promise<Object>} Transaction receipt
   */
  const depositLiquidity = useCallback(async (feederAddress, stablecoinAddress, amount) => {
    if (!walletProvider) {
      throw new Error("Wallet not connected");
    }
    
    if (!feederAddress || !stablecoinAddress || !amount) {
      throw new Error("All parameters are required");
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      
      // First approve the vault to spend tokens
      const tokenContract = new Contract(stablecoinAddress, ERC20_ABI, signer);
      const amountWei = parseUnits(amount, 18);
      
      console.log("Approving tokens...");
      const approveTx = await tokenContract.approve(VAULT_CONTRACT_ADDRESS, amountWei);
      await approveTx.wait();
      console.log("Tokens approved");
      
      // Then deposit
      const vaultContract = new Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, signer);
      console.log("Depositing liquidity...");
      const tx = await vaultContract.depositLiquidity(feederAddress, stablecoinAddress, amountWei);
      console.log("Transaction submitted:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Deposit confirmed:", receipt);
      
      return { tx, receipt };
    } catch (err) {
      console.error("Error depositing liquidity:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletProvider]);

  /**
   * Withdraw liquidity from the vault
   * @param {string} feederAddress - The feeder's wallet address
   * @param {string} stablecoinAddress - The stablecoin contract address
   * @param {string} amount - Amount to withdraw (in token units, e.g., "100")
   * @returns {Promise<Object>} Transaction receipt
   */
  const withdrawLiquidity = useCallback(async (feederAddress, stablecoinAddress, amount) => {
    if (!walletProvider) {
      throw new Error("Wallet not connected");
    }
    
    if (!feederAddress || !stablecoinAddress || !amount) {
      throw new Error("All parameters are required");
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, signer);
      
      const amountWei = parseUnits(amount, 18);
      
      console.log("Withdrawing liquidity...");
      const tx = await contract.withdrawLiquidity(feederAddress, stablecoinAddress, amountWei);
      console.log("Transaction submitted:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Withdraw confirmed:", receipt);
      
      return { tx, receipt };
    } catch (err) {
      console.error("Error withdrawing liquidity:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletProvider]);

  /**
   * Claim accrued yield
   * @param {string} feederAddress - The feeder's wallet address (defaults to connected address)
   * @returns {Promise<Object>} Transaction receipt
   */
  const claimYield = useCallback(async (feederAddress = address) => {
    if (!walletProvider || !feederAddress) {
      throw new Error("Wallet not connected or address not provided");
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, signer);
      
      console.log("Claiming yield...");
      const tx = await contract.claimYield(feederAddress);
      console.log("Transaction submitted:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Claim confirmed:", receipt);
      
      return { tx, receipt };
    } catch (err) {
      console.error("Error claiming yield:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletProvider, address]);

  // ============ HELPER FUNCTIONS ============

  /**
   * Check if a feeder is registered and verified
   * @param {string} feederAddress - The feeder's wallet address
   * @returns {Promise<boolean>} True if feeder is verified
   */
  const isFeederVerified = useCallback(async (feederAddress = address) => {
    try {
      const info = await getFeederInfo(feederAddress);
      return info.verified;
    } catch (err) {
      console.error("Error checking feeder verification:", err);
      return false;
    }
  }, [getFeederInfo, address]);

  return {
    // State
    loading,
    error,
    isConnected,
    address,
    
    // Read functions
    getFeederInfo,
    calculateYield,
    getTotalFeederLiquidity,
    getYieldRate,
    getAddressByDID,
    isFeederVerified,
    
    // Write functions
    registerFeeder,
    depositLiquidity,
    withdrawLiquidity,
    claimYield,
    
    // Contract address
    contractAddress: VAULT_CONTRACT_ADDRESS
  };
};

