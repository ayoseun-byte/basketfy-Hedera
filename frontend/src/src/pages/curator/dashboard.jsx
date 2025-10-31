import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    ArrowLeft,
    Users,
    DollarSign,
    Target,
    Plus,
    Edit3,
    BarChart3,
    PieChart,
    Calendar,
    Settings,
    Award,
    Eye,
    Activity,
    Zap,
    Bell,
    Share2,
    Download,
    RefreshCw,
    AlertTriangle,
    Check,
    Clock
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart as RechartsPieChart,
    Cell,
    Pie,
    BarChart,
    Bar
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header';

const CuratorDashboard = ({ darkMode = false }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedBasket, setSelectedBasket] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRebalanceModal, setShowRebalanceModal] = useState(false);
    const navigate = useNavigate();

    // Mock curator data
    const curatorData = {
        profile: {
            name: "Alex Thompson",
            username: "@alexdefi",
            bio: "DeFi strategist with 5+ years experience in yield farming and protocol analysis",
            avatar: "https://i.pravatar.cc/150?u=alex",
            followers: 2847,
            aum: 4250000,
            totalEarnings: 85000,
            rank: 12
        },
        baskets: [
            {
                id: 1,
                name: "DeFi Blue Chip",
                description: "Conservative DeFi strategy focusing on established protocols",
                category: "defi",
                tvl: 1250000,
                subscribers: 89,
                performance7d: 12.4,
                performance30d: 28.7,
                managementFee: 2.0,
                performanceFee: 15.0,
                status: "active",
                lastRebalance: "2 days ago",
                tokens: [
                    { ticker: "ETH", weight: 35, price: 2340.50, change24h: 3.2 },
                    { ticker: "AAVE", weight: 25, price: 98.42, change24h: 2.1 },
                    { ticker: "UNI", weight: 20, price: 12.85, change24h: 5.7 },
                    { ticker: "COMP", weight: 12, price: 67.23, change24h: -0.9 },
                    { ticker: "MKR", weight: 8, price: 1234.56, change24h: 1.5 }
                ]
            },
            {
                id: 2,
                name: "AI Infrastructure",
                description: "Exposure to AI and machine learning blockchain projects",
                category: "ai",
                tvl: 850000,
                subscribers: 156,
                performance7d: 18.9,
                performance30d: 45.2,
                managementFee: 2.5,
                performanceFee: 20.0,
                status: "active",
                lastRebalance: "1 week ago",
                tokens: [
                    { ticker: "FET", weight: 30, price: 0.85, change24h: 8.2 },
                    { ticker: "OCEAN", weight: 25, price: 0.52, change24h: 4.1 },
                    { ticker: "AGI", weight: 20, price: 0.12, change24h: 12.7 },
                    { ticker: "TAO", weight: 15, price: 45.32, change24h: -2.1 },
                    { ticker: "RNDR", weight: 10, price: 3.45, change24h: 6.8 }
                ]
            },
            {
                id: 3,
                name: "Emerging Markets",
                description: "High-growth potential tokens from emerging blockchain ecosystems",
                category: "emerging",
                tvl: 650000,
                subscribers: 67,
                performance7d: -3.2,
                performance30d: 15.8,
                managementFee: 3.0,
                performanceFee: 25.0,
                status: "rebalancing",
                lastRebalance: "Today",
                tokens: [
                    { ticker: "AVAX", weight: 25, price: 28.45, change24h: -1.2 },
                    { ticker: "SOL", weight: 25, price: 98.32, change24h: 2.8 },
                    { ticker: "DOT", weight: 20, price: 6.78, change24h: -0.5 },
                    { ticker: "ATOM", weight: 15, price: 11.23, change24h: 1.8 },
                    { ticker: "NEAR", weight: 15, price: 2.34, change24h: 4.2 }
                ]
            }
        ]
    };

    const generateChartData = (days = 30) => {
        return Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - i - 1));
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                aum: 4000000 + Math.random() * 500000,
                earnings: 75000 + Math.random() * 20000,
                subscribers: 250 + Math.random() * 50
            };
        });
    };

    const chartData = generateChartData();
    const totalTVL = curatorData.baskets.reduce((sum, basket) => sum + basket.tvl, 0);
    const totalSubscribers = curatorData.baskets.reduce((sum, basket) => sum + basket.subscribers, 0);
    const avgPerformance = curatorData.baskets.reduce((sum, basket) => sum + basket.performance7d, 0) / curatorData.baskets.length;

    const OverviewTab = () => (
        <div className="space-y-6 md:space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
                        <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total AUM</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold">${(totalTVL / 1000000).toFixed(2)}M</p>
                    <div className="flex items-center gap-2 mt-2">
                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                        <span className="text-green-400 text-xs md:text-sm font-medium">+12.5% this month</span>
                    </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                        <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Subscribers</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold">{totalSubscribers}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs md:text-sm">+23 this week</span>
                    </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <Award className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                        <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Earnings</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold">${(curatorData.profile.totalEarnings / 1000).toFixed(0)}K</p>
                    <div className="flex items-center gap-2 mt-2">
                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                        <span className="text-green-400 text-xs md:text-sm font-medium">+$2.1K this week</span>
                    </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
                        <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Performance</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-green-400">+{avgPerformance.toFixed(1)}%</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs md:text-sm">7-day average</span>
                    </div>
                </div>
            </div>

            {/* Performance Chart */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">AUM & Earnings Growth</h2>
                <ResponsiveContainer width="100%" height={250} className="text-xs">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorAum" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={10} />
                        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={10} />
                        <Tooltip />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="aum"
                            stroke="#8b5cf6"
                            fillOpacity={1}
                            fill="url(#colorAum)"
                            name="AUM ($)"
                        />
                        <Area
                            type="monotone"
                            dataKey="earnings"
                            stroke="#06b6d4"
                            fillOpacity={1}
                            fill="url(#colorEarnings)"
                            name="Earnings ($)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Activity */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Recent Activity</h2>
                <div className="space-y-3 md:space-y-4">
                    {[
                        { action: "Rebalanced", basket: "DeFi Blue Chip", time: "2 hours ago", status: "success" },
                        { action: "New subscriber", basket: "AI Infrastructure", time: "4 hours ago", status: "info" },
                        { action: "Performance milestone", basket: "DeFi Blue Chip", time: "1 day ago", status: "success" },
                        { action: "Rebalance scheduled", basket: "Emerging Markets", time: "2 days ago", status: "pending" }
                    ].map((activity, index) => (
                        <div key={index} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${activity.status === 'success' ? 'bg-green-400' :
                                    activity.status === 'info' ? 'bg-blue-400' : 'bg-yellow-400'
                                }`}></div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm md:text-base">{activity.action}</p>
                                <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>{activity.basket}</p>
                            </div>
                            <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-nowrap`}>{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const BasketsTab = () => (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold">My Baskets</h2>
                <button
                    onClick={() => navigate("/create")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg font-medium flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    Create New Basket
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {curatorData.baskets.map((basket) => (
                    <div key={basket.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:shadow-xl transition-all cursor-pointer`}>
                        <div className="flex items-start justify-between mb-3 md:mb-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg md:text-xl font-semibold mb-1 truncate">{basket.name}</h3>
                                <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>{basket.description}</p>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ml-2 flex-shrink-0 ${basket.status === 'active' ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') :
                                    basket.status === 'rebalancing' ? (darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800') :
                                        (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')
                                }`}>
                                {basket.status === 'active' && <Check className="w-3 h-3" />}
                                {basket.status === 'rebalancing' && <RefreshCw className="w-3 h-3 animate-spin" />}
                                <span className="hidden sm:inline">{basket.status}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                            <div>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>TVL</p>
                                <p className="text-base md:text-lg font-bold">${(basket.tvl / 1000000).toFixed(2)}M</p>
                            </div>
                            <div>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Subscribers</p>
                                <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                                    <span className="text-base md:text-lg font-bold">{basket.subscribers}</span>
                                </div>
                            </div>
                            <div>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>7D Performance</p>
                                <div className="flex items-center gap-1">
                                    {basket.performance7d > 0 ?
                                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-400" /> :
                                        <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                                    }
                                    <span className={`text-base md:text-lg font-bold ${basket.performance7d > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {basket.performance7d > 0 ? '+' : ''}{basket.performance7d}%
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Management Fee</p>
                                <p className="text-base md:text-lg font-bold">{basket.managementFee}%</p>
                            </div>
                        </div>

                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Top tokens:</div>
                        <div className="flex flex-wrap gap-1 mb-3 md:mb-4">
                            {basket.tokens.slice(0, 3).map((token) => (
                                <span key={token.ticker} className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    {token.ticker} ({token.weight}%)
                                </span>
                            ))}
                            {basket.tokens.length > 3 && (
                                <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    +{basket.tokens.length - 3} more
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBasket(basket);
                                    setShowRebalanceModal(true);
                                }}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-2 md:px-3 rounded-lg transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-1"
                            >
                                <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                                Rebalance
                            </button>
                            <button className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} py-2 px-2 md:px-3 rounded-lg transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-1`}>
                                <Eye className="w-3 h-3 md:w-4 md:h-4" />
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const EarningsTab = () => (
        <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Management Fees</h3>
                    <p className="text-2xl md:text-3xl font-bold text-blue-400">$45.2K</p>
                    <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>This month: +$8.7K</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Performance Fees</h3>
                    <p className="text-2xl md:text-3xl font-bold text-green-400">$39.8K</p>
                    <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>This month: +$12.1K</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Available to Withdraw</h3>
                    <p className="text-2xl md:text-3xl font-bold text-purple-400">$15.3K</p>
                    <button className="w-full mt-3 md:mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors text-sm md:text-base">
                        Withdraw
                    </button>
                </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Earnings Breakdown by Basket</h2>
                <div className="space-y-3 md:space-y-4">
                    {curatorData.baskets.map((basket) => {
                        const mgmtFees = (basket.tvl * basket.managementFee / 100 / 12);
                        const perfFees = (basket.tvl * Math.max(0, basket.performance30d) / 100 * basket.performanceFee / 100);
                        return (
                            <div key={basket.id} className={`p-3 md:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                                    <h3 className="font-semibold text-sm md:text-base">{basket.name}</h3>
                                    <span className="text-base md:text-lg font-bold">${((mgmtFees + perfFees) / 1000).toFixed(1)}K</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                                    <div>
                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Management Fees:</span>
                                        <span className="ml-2 font-medium">${(mgmtFees / 1000).toFixed(1)}K</span>
                                    </div>
                                    <div>
                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Performance Fees:</span>
                                        <span className="ml-2 font-medium">${(perfFees / 1000).toFixed(1)}K</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const RebalanceModal = () => (
        showRebalanceModal && selectedBasket && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h2 className="text-xl md:text-2xl font-bold">Rebalance {selectedBasket.name}</h2>
                        <button
                            onClick={() => setShowRebalanceModal(false)}
                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-base md:text-lg font-semibold">Current Allocation</h3>
                        {selectedBasket.tokens.map((token, index) => (
                            <div key={token.ticker} className={`flex items-center justify-between p-3 md:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-white">
                                        {token.ticker.slice(0, 2)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm md:text-base">{token.ticker}</p>
                                        <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>${token.price}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-4">
                                    <input
                                        type="number"
                                        defaultValue={token.weight}
                                        className={`w-16 md:w-20 p-2 rounded border text-sm ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                                    />
                                    <span className="text-sm">%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 md:gap-4 mt-6">
                        <button
                            onClick={() => setShowRebalanceModal(false)}
                            className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors text-sm md:text-base`}
                        >
                            Cancel
                        </button>
                        <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 md:py-3 px-3 md:px-4 rounded-lg transition-colors text-sm md:text-base">
                            Execute Rebalance
                        </button>
                    </div>
                </div>
            </div>
        )
    );

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} text-sm md:text-base`}>
            {/* Header */}
            <Header
                darkMode={darkMode}
                curatorData={curatorData}
                route={'/market'}
                routeText='Market'
                title="Curator Dashboard"
            />

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex flex-wrap gap-1 mb-6 md:mb-8">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'baskets', label: 'My Baskets', icon: PieChart },
                        { id: 'earnings', label: 'Earnings', icon: DollarSign },
                        { id: 'analytics', label: 'Analytics', icon: Activity },
                        { id: 'profile', label: 'Profile', icon: Users }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1 md:gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors font-medium text-xs md:text-sm ${activeTab === tab.id
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                                }`}
                        >
                            <tab.icon className="w-3 h-3 md:w-4 md:h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'baskets' && <BasketsTab />}
                {activeTab === 'earnings' && <EarningsTab />}

                {activeTab === 'analytics' && (
                    <div className="space-y-4 md:space-y-6">
                        <h2 className="text-xl md:text-2xl font-bold">Analytics & Performance</h2>

                        {/* Performance Comparison */}
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Basket Performance Comparison</h3>
                            <ResponsiveContainer width="100%" height={300} className="text-xs">
                                <BarChart data={curatorData.baskets}>
                                    <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={10} />
                                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={10} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="performance7d" fill="#8b5cf6" name="7D Performance (%)" />
                                    <Bar dataKey="performance30d" fill="#06b6d4" name="30D Performance (%)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Subscriber Growth */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Top Performing Baskets</h3>
                                <div className="space-y-2 md:space-y-3">
                                    {curatorData.baskets
                                        .sort((a, b) => b.performance7d - a.performance7d)
                                        .map((basket, index) => (
                                            <div key={basket.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <span className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-white' :
                                                            index === 1 ? 'bg-gray-400 text-white' :
                                                                index === 2 ? 'bg-orange-600 text-white' :
                                                                    'bg-gray-600 text-white'
                                                        }`}>
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-medium text-sm md:text-base truncate">{basket.name}</span>
                                                </div>
                                                <span className={`font-bold text-sm md:text-base ${basket.performance7d > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {basket.performance7d > 0 ? '+' : ''}{basket.performance7d}%
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Risk Metrics</h3>
                                <div className="space-y-3 md:space-y-4">
                                    {[
                                        { metric: 'Portfolio Volatility', value: '24.5%', status: 'moderate' },
                                        { metric: 'Sharpe Ratio', value: '1.85', status: 'good' },
                                        { metric: 'Max Drawdown', value: '-12.3%', status: 'low' },
                                        { metric: 'Beta vs Market', value: '0.89', status: 'good' }
                                    ].map((item, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.metric}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm md:text-base">{item.value}</span>
                                                <div className={`w-2 h-2 rounded-full ${item.status === 'good' ? 'bg-green-400' :
                                                        item.status === 'moderate' ? 'bg-yellow-400' : 'bg-red-400'
                                                    }`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-4 md:space-y-6">
                        <h2 className="text-xl md:text-2xl font-bold">Curator Profile</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                            {/* Profile Info */}
                            <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6 mb-4 md:mb-6">
                                    <img
                                        src={curatorData.profile.avatar}
                                        alt="Profile"
                                        className="w-16 h-16 md:w-24 md:h-24 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-xl md:text-2xl font-bold mb-2">{curatorData.profile.name}</h3>
                                        <p className={`text-base md:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{curatorData.profile.username}</p>
                                        <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{curatorData.profile.bio}</p>

                                        <div className="flex items-center gap-3 md:gap-4 mt-3 md:mt-4">
                                            <div className="flex items-center gap-1 md:gap-2">
                                                <Users className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                                                <span className="font-medium text-sm md:text-base">{curatorData.profile.followers} followers</span>
                                            </div>
                                            <div className="flex items-center gap-1 md:gap-2">
                                                <Award className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                                                <span className="font-medium text-sm md:text-base">Rank #{curatorData.profile.rank}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Bio</label>
                                        <textarea
                                            defaultValue={curatorData.profile.bio}
                                            className={`w-full p-3 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                            rows="3"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Default Management Fee</label>
                                            <input
                                                type="number"
                                                defaultValue="2.0"
                                                className={`w-full p-3 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Default Performance Fee</label>
                                            <input
                                                type="number"
                                                defaultValue="15.0"
                                                className={`w-full p-3 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full mt-4 md:mt-6 bg-purple-600 hover:bg-purple-700 text-white py-2 md:py-3 px-4 rounded-lg transition-colors font-medium text-sm md:text-base">
                                    Update Profile
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="space-y-4 md:space-y-6">
                                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Curator Stats</h3>
                                    <div className="space-y-3 md:space-y-4">
                                        <div>
                                            <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total AUM</p>
                                            <p className="text-xl md:text-2xl font-bold">${(curatorData.profile.aum / 1000000).toFixed(1)}M</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Baskets</p>
                                            <p className="text-xl md:text-2xl font-bold">{curatorData.baskets.length}</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Earnings</p>
                                            <p className="text-xl md:text-2xl font-bold">${(curatorData.profile.totalEarnings / 1000).toFixed(0)}K</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Performance</p>
                                            <p className="text-xl md:text-2xl font-bold text-green-400">+{avgPerformance.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Achievements</h3>
                                    <div className="space-y-2 md:space-y-3">
                                        {[
                                            { title: 'Top Performer', desc: 'Best 30-day returns', icon: '🏆' },
                                            { title: 'Growing Following', desc: '1000+ followers', icon: '📈' },
                                            { title: 'Consistent Returns', desc: '6 months positive', icon: '💎' }
                                        ].map((achievement, index) => (
                                            <div key={index} className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                <span className="text-xl md:text-2xl">{achievement.icon}</span>
                                                <div>
                                                    <p className="font-medium text-sm md:text-base">{achievement.title}</p>
                                                    <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{achievement.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Rebalance Modal */}
            <RebalanceModal />

            {/* Create Basket Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 md:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <h2 className="text-xl md:text-2xl font-bold">Create New Basket</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Basket Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., DeFi Blue Chip"
                                        className={`w-full p-3 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select className={`w-full p-3 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                                        <option value="">Select category</option>
                                        <option value="defi">DeFi</option>
                                        <option value="ai">AI</option>
                                        <option value="gaming">Gaming</option>
                                        <option value="infrastructure">Infrastructure</option>
                                        <option value="emerging">Emerging Markets</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    placeholder="Describe your basket strategy..."
                                    className={`w-full p-3 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    rows="3"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Management Fee (%)</label>
                                    <input
                                        type="number"
                                        defaultValue="2.0"
                                        step="0.1"
                                        className={`w-full p-3 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Performance Fee (%)</label>
                                    <input
                                        type="number"
                                        defaultValue="15.0"
                                        step="0.1"
                                        className={`w-full p-3 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Token Allocation</label>
                                <div className="space-y-2 md:space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-2 md:gap-3">
                                            <input
                                                type="text"
                                                placeholder="Token symbol (e.g., ETH)"
                                                className={`flex-1 p-3 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Weight %"
                                                className={`w-24 md:w-32 p-3 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                            />
                                        </div>
                                    ))}
                                    <button className="text-purple-400 hover:text-purple-300 text-xs md:text-sm font-medium flex items-center gap-1">
                                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                        Add Token
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 md:gap-4 mt-6 md:mt-8">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors text-sm md:text-base`}
                            >
                                Cancel
                            </button>
                            <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 md:py-3 px-3 md:px-4 rounded-lg transition-all text-sm md:text-base">
                                Create Basket
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CuratorDashboard;