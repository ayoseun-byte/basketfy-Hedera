import React, { useState } from 'react';
import { Wallet, TrendingUp, Activity, DollarSign, ArrowUpRight, ArrowDownLeft, Plus, X, ExternalLink, ChevronDown, PieChart, BarChart3, Clock, Zap, ArrowRight, Menu } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FeederDashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedChain, setSelectedChain] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const chains = [
    { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: '#627EEA' },
    { id: 'polygon', name: 'Polygon', icon: '⬡', color: '#8247E5' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '◢', color: '#28A0F0' },
    { id: 'base', name: 'Base', icon: '🔵', color: '#0052FF' }
  ];

  const tokens = [
    { id: 'usdc', name: 'USDC', balance: '10,500.00', logo: '💵' },
    { id: 'fdk', name: 'FDK', balance: '5,200.00', logo: '🪙' },
    { id: 'husd', name: 'HUSD', balance: '8,750.00', logo: '💰' }
  ];

  const liquidityData = [
    { chain: 'Ethereum', amount: 25000, percentage: 35, apy: 8.5, utilization: 68, idle: 8000, active: 17000 },
    { chain: 'Polygon', amount: 18500, percentage: 26, apy: 9.2, utilization: 72, idle: 5180, active: 13320 },
    { chain: 'Arbitrum', amount: 15200, percentage: 21, apy: 7.8, utilization: 65, idle: 5320, active: 9880 },
    { chain: 'Base', amount: 12800, percentage: 18, apy: 8.9, utilization: 70, idle: 3840, active: 8960 }
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
    { type: 'withdraw', amount: 1500, token: 'HUSD', chain: 'Base', time: '12 hours ago', txHash: '0xfedc...ba98' }
  ];

  const handleConnect = () => {
    setIsConnected(true);
    setTimeout(() => setShowDepositModal(true), 500);
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-purple-500/30 rounded-lg p-3 shadow-xl">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header - Fixed Responsive Issues */}
      <header className="relative border-b border-purple-500/20 backdrop-blur-xl bg-black/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            
            {/* Logo Section */}
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <PieChart className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">Basketfy Feeders</h1>
                  <p className="text-xs sm:text-sm text-purple-300">Liquidity Provider</p>
                </div>
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 text-purple-300 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-3">
              {!isConnected ? (
                
                <button
                  onClick={handleConnect}
                  className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 text-sm sm:text-base"
                >
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center gap-2 lg:gap-3">
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="px-4 py-2 sm:px-6 sm:py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30 text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Deposit
                  </button>
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="px-4 py-2 sm:px-6 sm:py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white rounded-lg font-medium flex items-center gap-2 transition-all text-xs sm:text-sm"
                  >
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    Withdraw
                  </button>
                  <div className="px-3 py-2 sm:px-5 sm:py-2.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-white font-mono text-xs sm:text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                    0x742d...5f3a
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="sm:hidden pt-3 border-t border-purple-500/20">
                {!isConnected ? (
                  <button
                    onClick={handleConnect}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <Wallet className="w-5 h-5" />
                    Connect Wallet
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowDepositModal(true)}
                      className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Deposit
                    </button>
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="w-full px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Withdraw
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {isConnected && (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Hero Stats Section - Fixed Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[
              { 
                title: "Total Liquidity", 
                value: "$71,500", 
                subtitle: "Across 4 chains",
                change: "+12.5%",
                icon: DollarSign,
                gradient: "from-purple-500 to-pink-500",
                border: "border-purple-500/20"
              },
              { 
                title: "Total Earnings", 
                value: "$5,847", 
                subtitle: "+$300 this week",
                change: "+8.2%",
                icon: TrendingUp,
                gradient: "from-blue-500 to-cyan-500",
                border: "border-blue-500/20"
              },
              { 
                title: "Average APY", 
                value: "8.6%", 
                subtitle: "Blended rate",
                change: null,
                icon: Activity,
                gradient: "from-green-500 to-emerald-500",
                border: "border-green-500/20"
              },
              { 
                title: "Active Usage", 
                value: "$42,300", 
                subtitle: "59% utilization",
                change: "+15.3%",
                icon: Zap,
                gradient: "from-orange-500 to-red-500",
                border: "border-orange-500/20"
              }
            ].map((stat, index) => (
              <div key={index} className={`bg-gradient-to-br ${stat.gradient}/10 backdrop-blur-xl border ${stat.border} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all hover:scale-105 transform duration-300`}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.gradient} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  {stat.change && (
                    <span className="text-xs font-medium text-green-400 flex items-center gap-1 bg-green-400/10 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1">{stat.title}</p>
                <p className="text-2xl sm:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Navigation Tabs - Fixed Responsive */}
          <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-lg sm:rounded-xl p-1 sm:p-2">
            {[
              { id: 'overview', label: 'Overview', icon: PieChart },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'activity', label: 'Activity', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-purple-300 hover:text-white hover:bg-purple-500/10'
                }`}
              >
                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left Column - Charts */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Earnings History Chart */}
                <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white">Earnings Overview</h2>
                      <p className="text-xs sm:text-sm text-purple-300">Daily breakdown of your rewards</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full" />
                        <span className="text-xs text-purple-300">Idle Yield</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-500 rounded-full" />
                        <span className="text-xs text-purple-300">Usage Yield</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={earningsHistory}>
                        <defs>
                          <linearGradient id="colorIdle" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" opacity={0.3} />
                        <XAxis dataKey="date" stroke="#a78bfa" style={{ fontSize: '10px', sm: '12px' }} />
                        <YAxis stroke="#a78bfa" style={{ fontSize: '10px', sm: '12px' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="idle" stackId="1" stroke="#a855f7" fill="url(#colorIdle)" />
                        <Area type="monotone" dataKey="usage" stackId="1" stroke="#ec4899" fill="url(#colorUsage)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Liquidity Distribution */}
                <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Liquidity Distribution</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex items-center justify-center">
                      <div className="h-48 sm:h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
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
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {liquidityData.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div 
                                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" 
                                style={{ backgroundColor: chains.find(c => c.name === item.chain)?.color }}
                              />
                              <div>
                                <p className="text-white font-medium text-xs sm:text-sm">{item.chain}</p>
                                <p className="text-xs text-purple-300">${item.amount.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-medium text-xs sm:text-sm">{item.percentage}%</p>
                              <p className="text-xs text-green-400">{item.apy}% APY</p>
                            </div>
                          </div>
                          <div className="w-full bg-purple-950/50 rounded-full h-1 sm:h-1.5 overflow-hidden">
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
                <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Liquidity Flow</h2>
                  <div className="relative h-48 sm:h-80 flex items-center justify-center">
                    <div className="absolute w-24 h-24 sm:w-40 sm:h-40 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 z-10">
                      <div className="text-center">
                        <p className="text-white font-bold text-sm sm:text-2xl">$71.5K</p>
                        <p className="text-purple-100 text-xs">Vault Pool</p>
                      </div>
                    </div>
                    
                    <div className="absolute top-0 left-0 transform scale-75 sm:scale-100">
                      <div className="bg-green-500/20 border-2 border-green-500 rounded-lg sm:rounded-xl px-3 py-2 sm:px-6 sm:py-4 backdrop-blur-xl">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <ArrowDownLeft className="w-3 h-3 sm:w-5 sm:h-5 text-green-400" />
                          <p className="text-green-400 font-bold text-sm sm:text-lg">+$8.2K</p>
                        </div>
                        <p className="text-green-300 text-xs sm:text-sm">New Deposits</p>
                        <p className="text-green-400/60 text-xs">This week</p>
                      </div>
                    </div>
                    
                    <div className="absolute top-0 right-0 transform scale-75 sm:scale-100">
                      <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg sm:rounded-xl px-3 py-2 sm:px-6 sm:py-4 backdrop-blur-xl">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <ArrowUpRight className="w-3 h-3 sm:w-5 sm:h-5 text-blue-400" />
                          <p className="text-blue-400 font-bold text-sm sm:text-lg">$42.3K</p>
                        </div>
                        <p className="text-blue-300 text-xs sm:text-sm">Active Usage</p>
                        <p className="text-blue-400/60 text-xs">59% utilized</p>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 transform scale-75 sm:scale-100">
                      <div className="bg-purple-500/20 border-2 border-purple-500 rounded-lg sm:rounded-xl px-3 py-2 sm:px-6 sm:py-4 backdrop-blur-xl">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <Clock className="w-3 h-3 sm:w-5 sm:h-5 text-purple-400" />
                          <p className="text-purple-400 font-bold text-sm sm:text-lg">$29.2K</p>
                        </div>
                        <p className="text-purple-300 text-xs sm:text-sm">Idle Liquidity</p>
                        <p className="text-purple-400/60 text-xs">Earning yield</p>
                      </div>
                    </div>

                    <div className="absolute bottom-0 right-0 transform scale-75 sm:scale-100">
                      <div className="bg-pink-500/20 border-2 border-pink-500 rounded-lg sm:rounded-xl px-3 py-2 sm:px-6 sm:py-4 backdrop-blur-xl">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5 text-pink-400" />
                          <p className="text-pink-400 font-bold text-sm sm:text-lg">+$300</p>
                        </div>
                        <p className="text-pink-300 text-xs sm:text-sm">Weekly Yield</p>
                        <p className="text-pink-400/60 text-xs">+8.2% growth</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Quick Actions</h2>
                  <div className="space-y-2 sm:space-y-3">
                    <button 
                      onClick={() => setShowDepositModal(true)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Add Liquidity
                    </button>
                    <button 
                      onClick={() => setShowWithdrawModal(true)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-purple-500/20 hover:bg-purple-500/30 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      Withdraw
                    </button>
                    <button className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-purple-500/20 hover:bg-purple-500/30 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      Claim Rewards
                    </button>
                  </div>
                </div>

                <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-bold text-white">Recent Activity</h2>
                    <button className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      View All
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-500/5 rounded-lg sm:rounded-xl hover:bg-purple-500/10 transition-all cursor-pointer">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'deposit' ? 'bg-green-500/20' :
                          activity.type === 'yield' ? 'bg-purple-500/20' :
                          activity.type === 'withdraw' ? 'bg-orange-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          {activity.type === 'deposit' ? <ArrowDownLeft className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" /> :
                           activity.type === 'yield' ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" /> :
                           activity.type === 'withdraw' ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" /> :
                           <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white font-medium capitalize text-xs sm:text-sm">{activity.type}</p>
                            <p className={`text-xs sm:text-sm font-semibold ${
                              activity.type === 'deposit' ? 'text-green-400' :
                              activity.type === 'yield' ? 'text-purple-400' :
                              activity.type === 'withdraw' ? 'text-orange-400' :
                              'text-blue-400'
                            }`}>
                              ${activity.amount.toLocaleString()}
                            </p>
                          </div>
                          <p className="text-xs text-purple-300">{activity.token} · {activity.chain}</p>
                          <div className="flex items-center justify-between mt-1 sm:mt-2">
                            <p className="text-xs text-purple-400">{activity.time}</p>
                            <a href="#" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                              <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3" />
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
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Utilization Trend</h2>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={utilizationTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" opacity={0.3} />
                      <XAxis dataKey="time" stroke="#a78bfa" style={{ fontSize: '10px', sm: '12px' }} />
                      <YAxis stroke="#a78bfa" style={{ fontSize: '10px', sm: '12px' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="utilization" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {liquidityData.map((item, idx) => (
                  <div key={idx} className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-bold text-white">{item.chain}</h3>
                      <span className="text-xl sm:text-2xl">{chains.find(c => c.name === item.chain)?.icon}</span>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <span className="text-xs sm:text-sm text-purple-300">Total Deposited</span>
                          <span className="text-white font-bold text-sm sm:text-base">${item.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <span className="text-xs sm:text-sm text-purple-300">Active</span>
                          <span className="text-blue-400 font-semibold text-sm sm:text-base">${item.active.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <span className="text-xs sm:text-sm text-purple-300">Idle</span>
                          <span className="text-purple-400 font-semibold text-sm sm:text-base">${item.idle.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-purple-300">APY</span>
                          <span className="text-green-400 font-bold text-sm sm:text-base">{item.apy}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <span className="text-xs text-purple-400">Utilization</span>
                          <span className="text-xs sm:text-sm text-white font-medium">{item.utilization}%</span>
                        </div>
                        <div className="w-full bg-purple-950/50 rounded-full h-1.5 sm:h-2 overflow-hidden">
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
            <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">All Activity</h2>
              <div className="space-y-3 sm:space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-purple-500/5 rounded-lg sm:rounded-xl hover:bg-purple-500/10 transition-all cursor-pointer border border-purple-500/10">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'deposit' ? 'bg-green-500/20' :
                      activity.type === 'yield' ? 'bg-purple-500/20' :
                      activity.type === 'withdraw' ? 'bg-orange-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      {activity.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /> :
                       activity.type === 'yield' ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" /> :
                       activity.type === 'withdraw' ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" /> :
                       <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-semibold capitalize text-sm sm:text-lg">{activity.type}</p>
                        <p className={`text-sm sm:text-lg font-bold ${
                          activity.type === 'deposit' ? 'text-green-400' :
                          activity.type === 'yield' ? 'text-purple-400' :
                          activity.type === 'withdraw' ? 'text-orange-400' :
                          'text-blue-400'
                        }`}>
                          ${activity.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-2">
                        <span className="text-xs sm:text-sm text-purple-300">Token: {activity.token}</span>
                        <span className="text-xs sm:text-sm text-purple-300">Chain: {activity.chain}</span>
                      </div>
                      <div className="flex items-center justify-between">
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

      {/* Deposit Modal - Responsive */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full relative mx-auto max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowDepositModal(false)} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-purple-300 hover:text-white transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Deposit Liquidity</h2>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Select Chain</label>
                <div className="relative">
                  <select 
                    value={selectedChain} 
                    onChange={(e) => setSelectedChain(e.target.value)} 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-950/50 border border-purple-500/30 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500 text-sm sm:text-base"
                  >
                    <option value="">Choose a chain</option>
                    {chains.map((chain) => (
                      <option key={chain.id} value={chain.id}>
                        {chain.icon} {chain.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-purple-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Select Token</label>
                <div className="relative">
                  <select 
                    value={selectedToken} 
                    onChange={(e) => setSelectedToken(e.target.value)} 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-950/50 border border-purple-500/30 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500 text-sm sm:text-base"
                  >
                    <option value="">Choose a token</option>
                    {tokens.map((token) => (
                      <option key={token.id} value={token.id}>
                        {token.logo} {token.name} (Balance: ${token.balance})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-purple-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Amount</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="0.00" 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-950/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500 text-sm sm:text-base" 
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 text-xs sm:text-sm font-medium">MAX</button>
                </div>
                {selectedToken && (
                  <p className="text-xs text-purple-400 mt-2">
                    Available: ${tokens.find(t => t.id === selectedToken)?.balance}
                  </p>
                )}
              </div>
              {selectedChain && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-300">Expected APY</span>
                    <span className="text-base sm:text-lg font-bold text-green-400">
                      {liquidityData.find(l => l.chain.toLowerCase() === chains.find(c => c.id === selectedChain)?.name.toLowerCase())?.apy}%
                    </span>
                  </div>
                </div>
              )}
              <div className="flex gap-2 sm:gap-3 pt-2">
                <button 
                  onClick={() => setShowDepositModal(false)} 
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-500/20 hover:bg-purple-500/30 text-white rounded-lg font-medium transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeposit} 
                  disabled={!selectedChain || !selectedToken || !amount} 
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Deposit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal - Responsive */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full relative mx-auto max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowWithdrawModal(false)} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-purple-300 hover:text-white transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Withdraw Liquidity</h2>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Select Chain</label>
                <div className="relative">
                  <select 
                    value={selectedChain} 
                    onChange={(e) => setSelectedChain(e.target.value)} 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-950/50 border border-purple-500/30 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500 text-sm sm:text-base"
                  >
                    <option value="">Choose a chain</option>
                    {chains.map((chain) => (
                      <option key={chain.id} value={chain.id}>
                        {chain.icon} {chain.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-purple-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Select Token</label>
                <div className="relative">
                  <select 
                    value={selectedToken} 
                    onChange={(e) => setSelectedToken(e.target.value)} 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-950/50 border border-purple-500/30 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500 text-sm sm:text-base"
                  >
                    <option value="">Choose a token</option>
                    {tokens.map((token) => (
                      <option key={token.id} value={token.id}>
                        {token.logo} {token.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-purple-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Amount</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="0.00" 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-950/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500 text-sm sm:text-base" 
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 text-xs sm:text-sm font-medium">MAX</button>
                </div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-orange-300">
                  Withdrawing will stop earning yield on this amount. Make sure to claim any pending rewards first.
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3 pt-2">
                <button 
                  onClick={() => setShowWithdrawModal(false)} 
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-500/20 hover:bg-purple-500/30 text-white rounded-lg font-medium transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleWithdraw} 
                  disabled={!selectedChain || !selectedToken || !amount} 
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeederDashboard;