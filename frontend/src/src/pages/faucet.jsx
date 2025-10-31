import React, { useState, useEffect } from 'react';
import {
  Droplet,
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader,
  ExternalLink,
  Copy,
  DollarSign,
  Zap,
  Clock,
  TrendingUp,
  Coins
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppKitAccount,useAppKit } from '@reown/appkit/react';
import { Contract, BrowserProvider, parseUnits, formatUnits } from 'ethers';
import { useAppKitProvider } from "@reown/appkit/react";
import { MOCK_USDC_ADDRESS } from '../constants/config';

// Mock USDC Contract Configuration

const MINT_AMOUNT = "5000"; // 5000 USDC

// Mock USDC ABI (add the mint function from your contract)
const MOCK_USDC_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)"
];

const Faucet = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const  { open, close } = useAppKit();
  const { walletProvider } = useAppKitProvider("eip155");
  const { address, isConnected } = useAppKitAccount();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [balance, setBalance] = useState("0");
  const [copied, setCopied] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({ name: "", symbol: "" });

  // Fetch user's USDC balance
  const fetchBalance = async () => {
    if (!walletProvider || !address) return;

    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const contract = new Contract(MOCK_USDC_ADDRESS, MOCK_USDC_ABI, ethersProvider);

      const bal = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      setBalance(formatUnits(bal, decimals));

      // Fetch token info
      const name = await contract.name();
      const symbol = await contract.symbol();
      setTokenInfo({ name, symbol });
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  // Mint Mock USDC
  const handleMint = async () => {
    if (!walletProvider || !address) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setTxHash("");

      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(MOCK_USDC_ADDRESS, MOCK_USDC_ABI, signer);

      const decimals = await contract.decimals();
      const amountWei = parseUnits(MINT_AMOUNT, decimals);

      console.log("Minting tokens...");
      const tx = await contract.mint(address, amountWei);
      setTxHash(tx.hash);
      console.log("Transaction submitted:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      setSuccess(true);
      
      // Refresh balance after successful mint
      setTimeout(() => {
        fetchBalance();
      }, 2000);

    } catch (err) {
      console.error("Error minting tokens:", err);
      setError(err.message || "Failed to mint tokens");
    } finally {
      setLoading(false);
    }
  };

  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(MOCK_USDC_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch balance on mount and when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
    }
  }, [isConnected, address]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black' : 'bg-gradient-to-br from-white via-purple-50 to-gray-100'} ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
      
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div 
          onClick={() => navigate('/')}
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
        >
          Basketfy
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          {isConnected && (
            <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-md mb-6">
            <Droplet className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-sm font-semibold">Test Token Faucet</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Get Free Test USDC
            </span>
          </h1>
          
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Mint 5,000 Mock USDC tokens for testing on the Hedera testnet. Perfect for exploring Basketfy features without using real funds.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} backdrop-blur-sm p-6 rounded-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mint Amount</span>
            </div>
            <p className="text-3xl font-bold">5,000 USDC</p>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} backdrop-blur-sm p-6 rounded-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your Balance</span>
            </div>
            <p className="text-3xl font-bold">{parseFloat(balance).toLocaleString()} USDC</p>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} backdrop-blur-sm p-6 rounded-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Network</span>
            </div>
            <p className="text-2xl font-bold">Hedera Testnet</p>
          </div>
        </div>

        {/* Main Faucet Card */}
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} backdrop-blur-sm rounded-3xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-8 md:p-12 shadow-2xl`}>
          
          {/* Contract Info */}
          <div className={`${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'} rounded-xl p-4 mb-8`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Token Contract
              </span>
              <button
                onClick={copyAddress}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} transition-colors`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-sm break-all">{MOCK_USDC_ADDRESS}</p>
          </div>

          {/* Connection Status */}
          {!isConnected ? (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-2xl font-bold mb-3">Connect Your Wallet</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                Please connect your wallet to mint test USDC tokens
              </p>
              <button
                onClick={() => open({ view: 'Connect' })}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Connect
              </button>
            </div>
          ) : (
            <>
              {/* Mint Button */}
              <button
                onClick={handleMint}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-6 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-xl flex items-center justify-center gap-3 text-lg mb-6"
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Minting Tokens...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-6 h-6" />
                    <span>Mint 5,000 USDC</span>
                  </>
                )}
              </button>

              {/* Success Message */}
              {success && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6 animate-pulse">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-400 mb-1">Success! Tokens Minted</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        5,000 USDC has been added to your wallet
                      </p>
                      {txHash && (
                        <a
                          href={`https://hashscan.io/testnet/transaction/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 mt-2 transition-colors"
                        >
                          <span>View Transaction</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-400 mb-1">Error</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Section */}
              <div className={`${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'} border ${darkMode ? 'border-blue-500/20' : 'border-blue-200'} rounded-xl p-6`}>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  What's Next?
                </h4>
                <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold mt-0.5">1.</span>
                    <span>Use these tokens to test depositing liquidity in the FeedersVault</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold mt-0.5">2.</span>
                    <span>Explore creating and investing in crypto baskets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold mt-0.5">3.</span>
                    <span>Test all platform features risk-free on testnet</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <button
            onClick={() => navigate('/feeder')}
            className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'} font-semibold py-4 px-8 rounded-xl transition-all duration-300 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-center gap-2`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Become a Feeder</span>
          </button>
          
          <button
            onClick={() => navigate('/baskets')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>Explore Baskets</span>
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'} backdrop-blur-sm border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} px-6 py-8 mt-20`}>
        <div className="max-w-4xl mx-auto text-center">
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            © {new Date().getFullYear()} Basketfy. Test tokens have no real value.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Faucet;