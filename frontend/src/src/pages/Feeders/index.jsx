import React, { useState, useRef, useEffect } from 'react';
import { Wallet, TrendingUp, Activity, DollarSign, ArrowUpRight, ArrowDownLeft, Plus, X, ExternalLink, ChevronDown, PieChart, BarChart3, Clock, Zap, ArrowRight, Copy } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { Client, AccountId, AccountBalanceQuery, Hbar } from '@hashgraph/sdk';
import {
  useAppKitState,
  useAppKitEvents,
  useAppKitAccount,
  useWalletInfo,
  useAppKitProvider
} from '@reown/appkit/react'

import { useDisconnect, useAppKit, useAppKitNetwork } from '@reown/appkit/react'
import { Contract, BrowserProvider, parseUnits, formatUnits } from 'ethers';

import { useNavigate } from 'react-router-dom';
import { useFeedersVault } from './contract';
import { MOCK_USDC_ADDRESS } from '../../constants/config';

const FeederDashboard = () => {
  const { open, close } = useAppKit();
  const { disconnect } = useDisconnect();
  const {getYieldRate} = useFeedersVault();
  const { switchNetwork } = useAppKitNetwork();
   const { walletProvider } = useAppKitProvider("eip155");
  const events = useAppKitEvents()
  const { walletInfo } = useWalletInfo()
  const state = useAppKitState();
  const { address, caipAddress, isConnected, status, embeddedWalletInfo, } = useAppKitAccount();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedChain, setSelectedChain] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const navigate = useNavigate();
  // Get all state from Redux
  const isDarkMode = useSelector((state) => state.global.isDarkMode);
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownRef2, setDropdownRef2] = useState(null);
  const dropdownRef = useRef(null);
  const chains = [
    { id: 'hedera', name: 'Hedera', icon: '⟠', color: '#627EEA' }
  ];

  const [tokens, setTokenBalances] = useState([
    { id: 'hbar', name: 'HBAR', balance: '0', logo: "", isNative: true },
    { id: 'usdc', name: 'USDC', balance: '0', logo: "", contractAddress: MOCK_USDC_ADDRESS, decimals: 6 },
    { id: 'husd', name: 'HUSD', balance: '0', logo: '', contractAddress: '0x0000000000000000000000000000000000163b5a', decimals: 6 }
  ]);

  // Human-readable ERC-20 ABI (only the functions we need)
  const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)'
  ];

  // Function to fetch ERC-20 token balances
  const fetchEvmTokenBalances = async (walletAddress) => {
    if (!walletAddress || !walletProvider) return;

    try {
      const provider = new BrowserProvider(walletProvider);

      const updatedTokens = [...tokens];

      for (let i = 0; i < updatedTokens.length; i++) {
        const token = updatedTokens[i];

        // Skip native HBAR
        if (token.isNative) continue;

        try {
          const contract = new Contract(token.contractAddress, ERC20_ABI, provider);
          const rawBalance = await contract.balanceOf(walletAddress);
          const decimals = token.decimals || await contract.decimals();
          const formatted = formatUnits(rawBalance, decimals);
          updatedTokens[i].balance = parseFloat(formatted).toFixed(2);
        } catch (err) {
          console.warn(`Error fetching ${token.name} balance:`, err);
          updatedTokens[i].balance = '0';
        }
      }

      setTokenBalances(updatedTokens);
    } catch (err) {
      console.error('Error fetching EVM token balances:', err);
    }
  };

  // Function to fetch HBAR balance from Hedera
  const fetchHbarBalance = async (hederaAccountId) => {
    try {
      const client = Client.forTestnet();

      // Convert EVM address to Hedera Account ID
      let accountId;
      if (hederaAccountId.startsWith('0x')) {
        // Try to derive account ID from EVM address
        const evmAddress = hederaAccountId.toLowerCase();
        accountId = AccountId.fromEvmAddress(0, 0, evmAddress.toString());
        console.log("Derived Account ID from EVM address:", accountId.toString());
      } else {
        accountId = AccountId.fromString(hederaAccountId);
      }

      console.log("Fetching HBAR balance for account:", accountId.toString());

      const query = new AccountBalanceQuery().setAccountId(accountId);
      const balance = await query.execute(client);

      // Convert Hbar to number (balance.hbars is already an Hbar object)
      const hbarAmount = balance.hbars.toTinybars().toNumber() / 100000000; // Convert tinybars to HBAR
      console.log("HBAR Balance:", hbarAmount);

      // Update tokens state
      setTokenBalances(prevTokens => {
        const updatedTokens = [...prevTokens];
        const hbarIndex = updatedTokens.findIndex(t => t.id === 'hbar');
        if (hbarIndex !== -1) {
          updatedTokens[hbarIndex].balance = hbarAmount.toFixed(2);
        }
        return updatedTokens;
      });

      client.close();
    } catch (err) {
      console.error('Error fetching HBAR balance:', err);
    }
  };

  const liquidityData = [
    { chain: 'USDC', amount: 25000, percentage: 35, apy: 8.5, utilization: 68, idle: 8000, active: 17000 },
    { chain: 'HCHF', amount: 18500, percentage: 26, apy: 9.2, utilization: 72, idle: 5180, active: 13320 },
    { chain: 'DAI', amount: 15200, percentage: 21, apy: 7.8, utilization: 65, idle: 5320, active: 9880 },
    { chain: 'USDT', amount: 12800, percentage: 18, apy: 8.9, utilization: 70, idle: 3840, active: 8960 }
  ];

  const earningsHistory = [
    { date: 'Oct 20', idle: 120, usage: 80, total: 200 },
    { date: 'Oct 21', idle: 135, usage: 95, total: 230 },
    { date: 'Oct 22', idle: 140, usage: 110, total: 250 },
    { date: 'Oct 23', idle: 128, usage: 102, total: 230 },
    { date: 'Oct 24', idle: 155, usage: 125, total: 280 },
    { date: 'Oct 25', idle: 145, usage: 115, total: 260 },
    { date: 'Oct 26', idle: 162, usage: 138, total: 300 }
  ];

  const utilizationTrend = [
    { time: '00:00', utilization: 45 },
    { time: '04:00', utilization: 38 },
    { time: '08:00', utilization: 52 },
    { time: '12:00', utilization: 68 },
    { time: '16:00', utilization: 72 },
    { time: '20:00', utilization: 65 },
    { time: '24:00', utilization: 58 }
  ];

  const pieData = liquidityData.map(item => ({
    name: item.chain,
    value: item.amount,
    color: chains.find(c => c.name === item.chain)?.color
  }));

  const recentActivity = [
    { type: 'deposit', amount: 5000, token: 'USDC', chain: 'Ethereum', time: '2 hours ago', txHash: '0x1234...5678' },
    { type: 'yield', amount: 125.50, token: 'USDC', chain: 'Polygon', time: '5 hours ago', txHash: '0xabcd...efgh' },
    { type: 'usage', amount: 2500, token: 'FDK', chain: 'Arbitrum', time: '8 hours ago', txHash: '0x9876...5432' },
    { type: 'withdraw', amount: 1500, token: 'HUSD', chain: 'Base', time: '12 hours ago', txHash: '0xfedc...ba98' },
    { type: 'deposit', amount: 3200, token: 'HUSD', chain: 'Base', time: '1 day ago', txHash: '0xfedc...ba98' },
    { type: 'yield', amount: 89.30, token: 'USDC', chain: 'Ethereum', time: '1 day ago', txHash: '0x5555...6666' }
  ];

  const handleConnect = () => {
    open({ view: 'Connect' });
  };

  const handleDisconnect = () => {
    disconnect();
    navigate('/');
  };

  const handleDeposit = () => {
    if (selectedChain && selectedToken && amount) {
      setShowDepositModal(false);
      setSelectedChain('');
      setSelectedToken('');
      setAmount('');
    }
  };

  const handleWithdraw = () => {
    if (selectedChain && selectedToken && amount) {
      setShowWithdrawModal(false);
      setSelectedChain('');
      setSelectedToken('');
      setAmount('');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    console.log("Events: ", events);
  }, [events]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef2 && !dropdownRef2.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef2]);

  // Effect: when connected & address changes
  useEffect(() => {
    if (!isConnected || !address) {
      return;
    }
    fetchHbarBalance(address);
    // For EVM tokens
    fetchEvmTokenBalances(address);
  }, [isConnected, address]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-purple-500/30 rounded-lg p-3 shadow-xl text-sm">
          <p className="text-white font-medium mb-1">{payload[0].payload.date || payload[0].payload.time}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-sm md:text-base">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-64 h-64 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl -top-24 md:-top-48 -left-24 md:-left-48 animate-pulse" />
        <div className="absolute w-64 h-64 md:w-96 md:h-96 bg-pink-500/10 rounded-full blur-3xl -bottom-24 md:-bottom-48 -right-24 md:-right-48 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative border-b border-purple-500/20 backdrop-blur-xl bg-black/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <PieChart className="w-4 h-4 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-white">Basketfy Feeders</h1>
              <p className="text-xs md:text-sm text-purple-300 hidden sm:block">Liquidity Provider Dashboard</p>
            </div>
          </div>

          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="px-4 py-2 md:px-8 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg md:rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 text-sm md:text-base"
            >
              <Wallet className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setShowDepositModal(true)}
                className="px-3 py-1.5 md:px-6 md:py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center gap-1 md:gap-2 transition-all shadow-lg shadow-purple-600/30 text-sm md:text-base"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Deposit</span>
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-3 py-1.5 md:px-6 md:py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white rounded-lg font-medium flex items-center gap-1 md:gap-2 transition-all text-sm md:text-base"
              >
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Withdraw</span>
              </button>
              <button
                onClick={() => setIsDropdownOpen(true)}
                className="px-3 py-1.5 md:px-5 md:py-2.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-white font-mono text-xs md:text-sm flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {address.slice(0, 4)}...{address.slice(-4)}
              </button>
              {isConnected && isDropdownOpen && (
                <div className={`absolute right-2 md:right-6 top-16 mt-1 w-56 md:w-64 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-xl z-20`}>
                  <div className="p-3 md:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Wallet Address
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(address)}
                          className={`p-1 rounded hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
                          title="Copy address"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => window.open(`${address}`, '_blank')}
                          className={`p-1 rounded hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
                          title="View on Solscan"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                      <code className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} break-all`}>
                        {address}
                      </code>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-purple-600 hover:text-white transition-colors"
                      >
                        Switch Wallet
                      </button>

                      <button
                        onClick={() => {
                          handleDisconnect();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-red-600 hover:text-white transition-colors text-red-500"
                      >
                        Disconnect
                      </button>

                      <button
                        onClick={() => {
                          navigate('/curator-dashboard');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-green-600 hover:text-white transition-colors text-green-500"
                      >
                        My Baskets
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {isConnected && (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-8">
          {/* Hero Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-purple-500/40 transition-all hover:scale-105 transform duration-300">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <span className="text-xs font-medium text-green-400 flex items-center gap-1 bg-green-400/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  +12.5%
                </span>
              </div>
              <p className="text-sm font-medium text-purple-300 mb-1">Total Liquidity</p>
              <p className="text-2xl md:text-4xl font-bold text-white mb-1">$71,500</p>
              <p className="text-xs text-purple-400">Across 4 chains</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-500/40 transition-all hover:scale-105 transform duration-300">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <span className="text-xs font-medium text-green-400 flex items-center gap-1 bg-green-400/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  +8.2%
                </span>
              </div>
              <p className="text-sm font-medium text-blue-300 mb-1">Total Earnings</p>
              <p className="text-2xl md:text-4xl font-bold text-white mb-1">$5,847</p>
              <p className="text-xs text-blue-400">+$300 this week</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-green-500/40 transition-all hover:scale-105 transform duration-300">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-green-300 mb-1">Average APY</p>
              <p className="text-2xl md:text-4xl font-bold text-white mb-1">8.6%</p>
              <p className="text-xs text-green-400">Blended rate</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-orange-500/40 transition-all hover:scale-105 transform duration-300">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <span className="text-xs font-medium text-green-400 flex items-center gap-1 bg-green-400/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  +15.3%
                </span>
              </div>
              <p className="text-sm font-medium text-orange-300 mb-1">Active Usage</p>
              <p className="text-2xl md:text-4xl font-bold text-white mb-1">$42,300</p>
              <p className="text-xs text-orange-400">59% utilization</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6 md:mb-8 bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-2">
            {[
              { id: 'overview', label: 'Overview', icon: PieChart },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'activity', label: 'Activity', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-purple-300 hover:text-white hover:bg-purple-500/10'
                }`}
              >
                <tab.icon className="w-3 h-3 md:w-4 md:h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
              {/* Left Column - Charts */}
              <div className="xl:col-span-2 space-y-4 md:space-y-6">
                {/* Earnings History Chart */}
                <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-white">Earnings Overview</h2>
                      <p className="text-xs md:text-sm text-purple-300">Daily breakdown of your rewards</p>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-full" />
                        <span className="text-xs text-purple-300">Idle Yield</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-pink-500 rounded-full" />
                        <span className="text-xs text-purple-300">Usage Yield</span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={250} className="text-xs">
                    <AreaChart data={earningsHistory}>
                      <defs>
                        <linearGradient id="colorIdle" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#a78bfa" style={{ fontSize: '10px' }} />
                      <YAxis stroke="#a78bfa" style={{ fontSize: '10px' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="idle" stackId="1" stroke="#a855f7" fill="url(#colorIdle)" />
                      <Area type="monotone" dataKey="usage" stackId="1" stroke="#ec4899" fill="url(#colorUsage)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Liquidity Distribution */}
                <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Liquidity Distribution</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={200} className="text-xs">
                        <RePieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                      {liquidityData.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div
                                className="w-2 h-2 md:w-3 md:h-3 rounded-full"
                                style={{ backgroundColor: chains.find(c => c.name === item.chain)?.color }}
                              />
                              <div>
                                <p className="text-white font-medium text-xs md:text-sm">{item.chain}</p>
                                <p className="text-xs text-purple-300">${item.amount.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-medium text-xs md:text-sm">{item.percentage}%</p>
                              <p className="text-xs text-green-400">{item.apy}% APY</p>
                            </div>
                          </div>
                          <div className="w-full bg-purple-950/50 rounded-full h-1 md:h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: chains.find(c => c.name === item.chain)?.color
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Liquidity Flow Visualization */}
                <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Liquidity Flow</h2>
                  <div className="relative h-48 md:h-80 flex items-center justify-center">
                    <div className="absolute w-20 h-20 md:w-40 md:h-40 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg md:shadow-2xl shadow-purple-500/50 z-10">
                      <div className="text-center">
                        <p className="text-white font-bold text-base md:text-2xl">$71.5K</p>
                        <p className="text-purple-100 text-xs">Vault Pool</p>
                      </div>
                    </div>

                    <div className="absolute top-0 left-0 transform -translate-x-2 md:translate-x-0">
                      <div className="bg-green-500/20 border-2 border-green-500 rounded-lg md:rounded-xl px-3 py-2 md:px-6 md:py-4 backdrop-blur-xl max-w-32 md:max-w-none">
                        <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                          <ArrowDownLeft className="w-3 h-3 md:w-5 md:h-5 text-green-400" />
                          <p className="text-green-400 font-bold text-sm md:text-lg">+$8.2K</p>
                        </div>
                        <p className="text-green-300 text-xs md:text-sm">New Deposits</p>
                        <p className="text-green-400/60 text-xs">This week</p>
                      </div>
                    </div>

                    <div className="absolute top-0 right-0 transform translate-x-2 md:translate-x-0">
                      <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg md:rounded-xl px-3 py-2 md:px-6 md:py-4 backdrop-blur-xl max-w-32 md:max-w-none">
                        <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                          <ArrowUpRight className="w-3 h-3 md:w-5 md:h-5 text-blue-400" />
                          <p className="text-blue-400 font-bold text-sm md:text-lg">$42.3K</p>
                        </div>
                        <p className="text-blue-300 text-xs md:text-sm">Active Usage</p>
                        <p className="text-blue-400/60 text-xs">59% utilized</p>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 transform -translate-x-2 md:translate-x-0">
                      <div className="bg-purple-500/20 border-2 border-purple-500 rounded-lg md:rounded-xl px-3 py-2 md:px-6 md:py-4 backdrop-blur-xl max-w-32 md:max-w-none">
                        <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                          <Clock className="w-3 h-3 md:w-5 md:h-5 text-purple-400" />
                          <p className="text-purple-400 font-bold text-sm md:text-lg">$29.2K</p>
                        </div>
                        <p className="text-purple-300 text-xs md:text-sm">Idle Liquidity</p>
                        <p className="text-purple-400/60 text-xs">Earning yield</p>
                      </div>
                    </div>

                    <div className="absolute bottom-0 right-0 transform translate-x-2 md:translate-x-0">
                      <div className="bg-pink-500/20 border-2 border-pink-500 rounded-lg md:rounded-xl px-3 py-2 md:px-6 md:py-4 backdrop-blur-xl max-w-32 md:max-w-none">
                        <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                          <TrendingUp className="w-3 h-3 md:w-5 md:h-5 text-pink-400" />
                          <p className="text-pink-400 font-bold text-sm md:text-lg">+$300</p>
                        </div>
                        <p className="text-pink-300 text-xs md:text-sm">Weekly Yield</p>
                        <p className="text-pink-400/60 text-xs">+8.2% growth</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 md:space-y-6">
                <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <h2 className="text-lg font-bold text-white mb-3 md:mb-4">Quick Actions</h2>
                  <div className="space-y-2 md:space-y-3">
                    <button
                      onClick={() => setShowDepositModal(true)}
                      className="w-full px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-1 md:gap-2 shadow-lg text-sm md:text-base"
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4" />
                      Add Liquidity
                    </button>
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="w-full px-3 py-2 md:px-4 md:py-3 bg-purple-500/20 hover:bg-purple-500/30 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
                    >
                      <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                      Withdraw
                    </button>
                    <button className="w-full px-3 py-2 md:px-4 md:py-3 bg-purple-500/20 hover:bg-purple-500/30 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      Claim Rewards
                    </button>
                  </div>
                </div>

                <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                    <button className="text-xs md:text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      View All
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 md:space-y-3 max-h-64 md:max-h-96 overflow-y-auto">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-purple-500/5 rounded-lg md:rounded-xl hover:bg-purple-500/10 transition-all cursor-pointer">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'deposit' ? 'bg-green-500/20' :
                          activity.type === 'yield' ? 'bg-purple-500/20' :
                          activity.type === 'withdraw' ? 'bg-orange-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          {activity.type === 'deposit' ? <ArrowDownLeft className="w-3 h-3 md:w-5 md:h-5 text-green-400" /> :
                           activity.type === 'yield' ? <TrendingUp className="w-3 h-3 md:w-5 md:h-5 text-purple-400" /> :
                           activity.type === 'withdraw' ? <ArrowUpRight className="w-3 h-3 md:w-5 md:h-5 text-orange-400" /> :
                           <Activity className="w-3 h-3 md:w-5 md:h-5 text-blue-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white font-medium capitalize text-xs md:text-sm">{activity.type}</p>
                            <p className={`text-xs md:text-sm font-semibold ${
                              activity.type === 'deposit' ? 'text-green-400' :
                              activity.type === 'yield' ? 'text-purple-400' :
                              activity.type === 'withdraw' ? 'text-orange-400' :
                              'text-blue-400'
                            }`}>
                              ${activity.amount.toLocaleString()}
                            </p>
                          </div>
                          <p className="text-xs md:text-sm text-purple-300">{activity.token} · {activity.chain}</p>
                          <div className="flex items-center justify-between mt-1 md:mt-2">
                            <p className="text-xs text-purple-400">{activity.time}</p>
                            <a href="#" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4 md:space-y-6">
              <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Utilization Trend</h2>
                <ResponsiveContainer width="100%" height={250} className="text-xs">
                  <LineChart data={utilizationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#a78bfa" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#a78bfa" style={{ fontSize: '10px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="utilization" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {liquidityData.map((item, idx) => (
                  <div key={idx} className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <h3 className="text-base md:text-lg font-bold text-white">{item.chain}</h3>
                      <span className="text-xl md:text-2xl">{chains.find(c => c.name === item.chain)?.icon}</span>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1 md:mb-2">
                          <span className="text-xs md:text-sm text-purple-300">Total Deposited</span>
                          <span className="text-white font-bold text-sm md:text-base">${item.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mb-1 md:mb-2">
                          <span className="text-xs md:text-sm text-purple-300">Active</span>
                          <span className="text-blue-400 font-semibold text-sm md:text-base">${item.active.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mb-1 md:mb-2">
                          <span className="text-xs md:text-sm text-purple-300">Idle</span>
                          <span className="text-purple-400 font-semibold text-sm md:text-base">${item.idle.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs md:text-sm text-purple-300">APY</span>
                          <span className="text-green-400 font-bold text-sm md:text-base">{item.apy}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 md:mb-2">
                          <span className="text-xs text-purple-400">Utilization</span>
                          <span className="text-xs md:text-sm text-white font-medium">{item.utilization}%</span>
                        </div>
                        <div className="w-full bg-purple-950/50 rounded-full h-1.5 md:h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${item.utilization}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">All Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-purple-500/5 rounded-lg md:rounded-xl hover:bg-purple-500/10 transition-all cursor-pointer border border-purple-500/10">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'deposit' ? 'bg-green-500/20' :
                      activity.type === 'yield' ? 'bg-purple-500/20' :
                      activity.type === 'withdraw' ? 'bg-orange-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      {activity.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4 md:w-6 md:h-6 text-green-400" /> :
                       activity.type === 'yield' ? <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-purple-400" /> :
                       activity.type === 'withdraw' ? <ArrowUpRight className="w-4 h-4 md:w-6 md:h-6 text-orange-400" /> :
                       <Activity className="w-4 h-4 md:w-6 md:h-6 text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                        <p className="text-white font-semibold capitalize text-base md:text-lg">{activity.type}</p>
                        <p className={`text-base md:text-lg font-bold ${
                          activity.type === 'deposit' ? 'text-green-400' :
                          activity.type === 'yield' ? 'text-purple-400' :
                          activity.type === 'withdraw' ? 'text-orange-400' :
                          'text-blue-400'
                        }`}>
                          ${activity.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-2">
                        <span className="text-xs md:text-sm text-purple-300">Token: {activity.token}</span>
                        <span className="text-xs md:text-sm text-purple-300">Chain: {activity.chain}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <p className="text-xs text-purple-400">{activity.time}</p>
                        <a href="#" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono">
                          {activity.txHash}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500/30 rounded-xl md:rounded-2xl p-4 md:p-8 w-full max-w-sm sm:max-w-md mx-2 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowDepositModal(false)} className="absolute top-2 right-2 md:top-4 md:right-4 text-purple-300 hover:text-white transition-colors">
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Deposit Liquidity</h2>
            <div className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Select Chain</label>
                <div className="relative">
                  <select value={selectedChain} onChange={(e) => setSelectedChain(e.target.value)} className="w-full px-3 py-2 md:px-4 md:py-3 bg-purple-950/50 border border-purple-500/30 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500 text-sm md:text-base">
                    <option value="">Choose a chain</option>
                    {chains.map((chain) => (<option key={chain.id} value={chain.id}>{chain.icon} {chain.name}</option>))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-purple-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Select Token</label>
                <div className="relative">
                  <div className="relative" ref={setDropdownRef2}>
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full px-3 py-2 md:px-4 md:py-3 bg-purple-950/50 border border-purple-500/30 rounded-lg text-white text-left cursor-pointer focus:outline-none focus:border-purple-500 flex items-center justify-between text-sm md:text-base"
                    >
                      <span className="flex items-center gap-2 md:gap-3">
                        {selectedToken ? (
                          <>
                            <img
                              src="../../../assets/usdt.svg"
                              alt={tokens.find(t => t.id === selectedToken)?.name}
                              className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 object-contain"
                            />
                            <span className="text-xs md:text-sm">
                              {tokens.find(t => t.id === selectedToken)?.name}
                              <span className="hidden sm:inline"> (Balance: ${tokens.find(t => t.id === selectedToken)?.balance})</span>
                            </span>
                          </>
                        ) : (
                          'Choose a token'
                        )}
                      </span>
                      <span className={`text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>

                    {isOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-purple-950 border border-purple-500/30 rounded-lg overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                        {tokens.map((token) => (
                          <div
                            key={token.id}
                            onClick={() => {
                              setSelectedToken(token.id);
                              setIsOpen(false);
                            }}
                            className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-900/50 cursor-pointer text-white flex items-center gap-2 md:gap-3 transition-colors text-sm md:text-base"
                          >
                            <img src={'../../../assets/usdt.svg'} className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" alt={token.name} />
                            <span>{token.name} (Balance: ${token.balance})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Amount</label>
                <div className="relative">
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 md:px-4 md:py-3 bg-purple-950/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500 text-sm md:text-base" />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 text-xs md:text-sm font-medium">MAX</button>
                </div>
                {selectedToken && (<p className="text-xs text-purple-400 mt-2">Available: ${tokens.find(t => t.id === selectedToken)?.balance}</p>)}
              </div>
              {selectedChain && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-300">Expected APY</span>
                    <span className="text-base md:text-lg font-bold text-green-400">{liquidityData.find(l => l.chain.toLowerCase() === chains.find(c => c.id === selectedChain)?.name.toLowerCase())?.apy}%</span>
                  </div>
                </div>
              )}
              <div className="flex gap-2 md:gap-3 pt-2">
                <button
                  onClick={() => setShowDepositModal(false)} 
                  className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-purple-500/20 hover:bg-purple-500/30 text-white rounded-lg font-medium transition-all text-sm md:text-base"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeposit} 
                  className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  Deposit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500/30 rounded-xl md:rounded-2xl p-4 md:p-8 w-full max-w-sm sm:max-w-md mx-2 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowWithdrawModal(false)} className="absolute top-2 right-2 md:top-4 md:right-4 text-purple-300 hover:text-white transition-colors">
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Withdraw Liquidity</h2>
            <div className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Select Chain</label>
                <div className="relative">
                  <select value={selectedChain} onChange={(e) => setSelectedChain(e.target.value)} className="w-full px-3 py-2 md:px-4 md:py-3 bg-purple-950/50 border border-purple-500/30 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500 text-sm md:text-base">
                    <option value="">Choose a chain</option>
                    {chains.map((chain) => (<option key={chain.id} value={chain.id}>{chain.icon} {chain.name}</option>))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-purple-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Select Token</label>
                <div className="relative">
                  <select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)} className="w-full px-3 py-2 md:px-4 md:py-3 bg-purple-950/50 border border-purple-500/30 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500 text-sm md:text-base">
                    <option value="">Choose a token</option>
                    {tokens.map((token) => (<option key={token.id} value={token.id}>{token.logo} {token.name}</option>))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-purple-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Amount</label>
                <div className="relative">
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 md:px-4 md:py-3 bg-purple-950/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500 text-sm md:text-base" />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 text-xs md:text-sm font-medium">MAX</button>
                </div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-orange-300">Withdrawing will stop earning yield on this amount. Make sure to claim any pending rewards first.</p>
              </div>
              <div className="flex gap-2 md:gap-3 pt-2">
                <button onClick={() => setShowWithdrawModal(false)} className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-purple-500/20 hover:bg-purple-500/30 text-white rounded-lg font-medium transition-all text-sm md:text-base">Cancel</button>
                <button onClick={handleWithdraw} disabled={!selectedChain || !selectedToken || !amount} className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base">Withdraw</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeederDashboard;