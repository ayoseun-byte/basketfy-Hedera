import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    ArrowLeft,
    Activity,
    DollarSign,
    Target,
    AlertTriangle,
    Info,
    Calendar,
    BarChart3,
    PieChart,
    Zap
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush,
    AreaChart,
    Area,
    PieChart as RechartsPieChart,
    Cell,
    BarChart,
    Bar,
    Pie,
    RadialBarChart,
    RadialBar
} from 'recharts';

import { useLocation, useNavigate } from 'react-router-dom';

export const UserBasketPage = ({ darkMode = false }) => {
     const navigate = useNavigate();
      const location = useLocation(); // Hook to access location object
      
    const [basketDetails] = useState({
        name: "DeFi Blue Chip Basket",
        tokens: [
            { ticker: "ETH", name: "Ethereum", weight: 35, price: 2340.50, change24h: 3.2, volume: "2.1B", marketCap: "281B" },
            { ticker: "BTC", name: "Bitcoin", weight: 30, price: 43250.75, change24h: -1.8, volume: "1.8B", marketCap: "847B" },
            { ticker: "UNI", name: "Uniswap", weight: 15, price: 12.85, change24h: 5.7, volume: "180M", marketCap: "7.7B" },
            { ticker: "AAVE", name: "Aave", weight: 12, price: 98.42, change24h: 2.1, volume: "95M", marketCap: "1.4B" },
            { ticker: "COMP", name: "Compound", weight: 8, price: 67.23, change24h: -0.9, volume: "45M", marketCap: "432M" }
        ],
        performance7d: 12.4,
        performance30d: 28.7,
        totalValue: 125420.50,
        riskScore: 7.2,
        sharpeRatio: 1.85,
        volatility: 24.5,
        lastRebalance: "2024-05-15"
    });
    const [chartPeriod, setChartPeriod] = useState("7D");
    const [chartType, setChartType] = useState("area");

    const generateMockChartData = (days) => {
        const baseValue = 100;
        let currentValue = baseValue;
        return Array.from({ length: days }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - index - 1));
            const fluctuation = (Math.random() - 0.45) * 3; // Slight upward bias
            currentValue += fluctuation;
            
            const entry = {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: parseFloat(currentValue.toFixed(2)),
                volume: Math.floor(Math.random() * 50000000) + 10000000,
                benchmark: parseFloat((baseValue + (index * 0.5) + Math.random() * 2).toFixed(2))
            };
            
            basketDetails.tokens.forEach(token => {
                const tokenFluctuation = (Math.random() - 0.5) * 5;
                const basePrice = token.price || 100;
                entry[token.ticker] = parseFloat((basePrice + tokenFluctuation + (index * 0.3)).toFixed(2));
            });
            
            return entry;
        });
    };

    const chartData = chartPeriod === "7D" ? generateMockChartData(7) : 
                     chartPeriod === "30D" ? generateMockChartData(30) : generateMockChartData(90);

    const pieData = basketDetails.tokens.map((token, index) => ({
        name: token.ticker,
        value: token.weight,
        price: token.price,
        change: token.change24h,
        color: `hsl(${(index * 72) % 360}, 70%, 60%)`
    }));

    const performanceMetrics = [
        { name: "7D", value: basketDetails.performance7d, color: basketDetails.performance7d > 0 ? "text-green-400" : "text-red-400" },
        { name: "30D", value: basketDetails.performance30d, color: basketDetails.performance30d > 0 ? "text-green-400" : "text-red-400" },
        { name: "YTD", value: 45.2, color: "text-green-400" },
        { name: "1Y", value: 78.9, color: "text-green-400" }
    ];

    const riskMetrics = [
        { name: "Risk Score", value: basketDetails.riskScore, max: 10, color: "hsl(220, 70%, 60%)" },
        { name: "Volatility", value: basketDetails.volatility, max: 100, color: "hsl(280, 70%, 60%)" },
        { name: "Sharpe Ratio", value: basketDetails.sharpeRatio, max: 3, color: "hsl(140, 70%, 60%)" }
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} p-4 rounded-lg shadow-lg border`}>
                    <p className="font-medium mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span>{entry.dataKey}: </span>
                            <span className="font-medium">
                                {entry.dataKey === 'volume' ? `$${(entry.value / 1000000).toFixed(1)}M` : 
                                 entry.dataKey === 'value' || entry.dataKey === 'benchmark' ? `$${entry.value}` :
                                 `$${entry.value}`}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                            onClick={() => navigate('/my-baskets')}
                            className="flex items-center gap-2 hover:text-purple-400 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                                Back to Portfolio
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold">{basketDetails.name}</h1>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Last updated: {new Date().toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                             //onClick={() =>  navigate(`/basket/${basket.name}`, { state: { basketDetails: basket }})}
                             className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                                Invest More
                            </button>
                            <button
                            onClick={() => navigate('/explore')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                                Explore More
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="w-8 h-8 text-blue-500" />
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Value</span>
                        </div>
                        <p className="text-3xl font-bold">${basketDetails.totalValue.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm font-medium">+$2,340 today</span>
                        </div>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <Activity className="w-8 h-8 text-green-500" />
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>7D Return</span>
                        </div>
                        <p className="text-3xl font-bold text-green-400">+{basketDetails.performance7d}%</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm">vs Market: +8.2%</span>
                        </div>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <Target className="w-8 h-8 text-purple-500" />
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Risk Score</span>
                        </div>
                        <p className="text-3xl font-bold">{basketDetails.riskScore}/10</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${basketDetails.riskScore <= 3 ? 'bg-green-100 text-green-800' : basketDetails.riskScore <= 7 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                {basketDetails.riskScore <= 3 ? 'Low Risk' : basketDetails.riskScore <= 7 ? 'Moderate' : 'High Risk'}
                            </div>
                        </div>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <BarChart3 className="w-8 h-8 text-orange-500" />
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sharpe Ratio</span>
                        </div>
                        <p className="text-3xl font-bold">{basketDetails.sharpeRatio}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-green-400">Excellent</span>
                        </div>
                    </div>
                </div>

                {/* Performance Chart Section */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Performance Analysis</h2>
                            <div className="flex flex-wrap gap-4">
                                {performanceMetrics.map((metric) => (
                                    <div key={metric.name} className="flex items-center gap-2">
                                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{metric.name}:</span>
                                        <span className={`font-medium ${metric.color}`}>
                                            {metric.value > 0 ? '+' : ''}{metric.value}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setChartPeriod("7D")}
                                    className={`px-3 py-1 rounded-md font-medium transition-colors ${chartPeriod === "7D"
                                        ? "bg-purple-600 text-white shadow-lg"
                                        : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`
                                    }`}
                                >
                                    7D
                                </button>
                                <button
                                    onClick={() => setChartPeriod("30D")}
                                    className={`px-3 py-1 rounded-md font-medium transition-colors ${chartPeriod === "30D"
                                        ? "bg-purple-600 text-white shadow-lg"
                                        : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`
                                    }`}
                                >
                                    30D
                                </button>
                                <button
                                    onClick={() => setChartPeriod("90D")}
                                    className={`px-3 py-1 rounded-md font-medium transition-colors ${chartPeriod === "90D"
                                        ? "bg-purple-600 text-white shadow-lg"
                                        : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`
                                    }`}
                                >
                                    90D
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setChartType("area")}
                                    className={`px-3 py-1 rounded-md font-medium transition-colors ${chartType === "area"
                                        ? "bg-blue-600 text-white"
                                        : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`
                                    }`}
                                >
                                    Area
                                </button>
                                <button
                                    onClick={() => setChartType("line")}
                                    className={`px-3 py-1 rounded-md font-medium transition-colors ${chartType === "line"
                                        ? "bg-blue-600 text-white"
                                        : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`
                                    }`}
                                >
                                    Line
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={400}>
                        {chartType === "area" ? (
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="date" 
                                    stroke={darkMode ? '#9ca3af' : '#6b7280'} 
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke={darkMode ? '#9ca3af' : '#6b7280'} 
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    name="Portfolio Value"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="benchmark"
                                    stroke="#06b6d4"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorBenchmark)"
                                    name="Market Benchmark"
                                />
                                <Brush 
                                    dataKey="date" 
                                    height={30} 
                                    stroke="#8b5cf6"
                                    fill={darkMode ? '#374151' : '#f3f4f6'}
                                />
                            </AreaChart>
                        ) : (
                            <LineChart data={chartData}>
                                <XAxis 
                                    dataKey="date" 
                                    stroke={darkMode ? '#9ca3af' : '#6b7280'} 
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke={darkMode ? '#9ca3af' : '#6b7280'} 
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={false}
                                    name="Portfolio Value"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="benchmark"
                                    stroke="#06b6d4"
                                    strokeWidth={2}
                                    dot={false}
                                    strokeDasharray="5 5"
                                    name="Market Benchmark"
                                />
                                {basketDetails.tokens.slice(0, 3).map((token, index) => (
                                    <Line
                                        key={token.ticker}
                                        type="monotone"
                                        dataKey={token.ticker}
                                        stroke={`hsl(${(index * 60 + 180) % 360}, 70%, 60%)`}
                                        strokeWidth={1.5}
                                        dot={false}
                                        name={token.ticker}
                                        opacity={0.7}
                                    />
                                ))}
                                <Brush 
                                    dataKey="date" 
                                    height={30} 
                                    stroke="#8b5cf6"
                                    fill={darkMode ? '#374151' : '#f3f4f6'}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Risk Metrics and Allocation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Risk Analysis */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Risk Analysis
                        </h2>
                        <div className="space-y-6">
                            {riskMetrics.map((metric, index) => (
                                <div key={metric.name}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">{metric.name}</span>
                                        <span className="text-lg font-bold" style={{ color: metric.color }}>
                                            {metric.name === 'Volatility' ? `${metric.value}%` : metric.value}
                                        </span>
                                    </div>
                                    <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${(metric.value / metric.max) * 100}%`,
                                                backgroundColor: metric.color
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-l-4 border-blue-400`}>
                                <div className="flex items-start gap-2">
                                    <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-blue-400 mb-1">Risk Assessment</p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Your portfolio shows moderate risk with good diversification. Consider rebalancing if volatility exceeds 30%.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Allocation */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-purple-500" />
                            Asset Allocation
                        </h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <RechartsPieChart>
                                <defs>
                                    {pieData.map((entry, index) => (
                                        <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={entry.color} stopOpacity={0.9}/>
                                            <stop offset="95%" stopColor={entry.color} stopOpacity={0.6}/>
                                        </linearGradient>
                                    ))}
                                </defs>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={40}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value) => [`${value}%`, 'Weight']}
                                    labelFormatter={(label) => `${label}`}
                                />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {pieData.map((token, index) => (
                                <div key={token.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: token.color }}></div>
                                    <span className="text-sm font-medium">{token.name}</span>
                                    <span className="text-sm text-gray-500">{token.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Token Details */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h2 className="text-xl font-semibold mb-6">Token Holdings</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <th className="text-left py-3 px-2">Asset</th>
                                    <th className="text-right py-3 px-2">Weight</th>
                                    <th className="text-right py-3 px-2">Price</th>
                                    <th className="text-right py-3 px-2">24h Change</th>
                                    <th className="text-right py-3 px-2">Volume</th>
                                    <th className="text-right py-3 px-2">Market Cap</th>
                                </tr>
                            </thead>
                            <tbody>
                                {basketDetails.tokens.map((token, index) => (
                                    <tr key={token.ticker} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                                        <td className="py-4 px-2">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
                                                    style={{ backgroundColor: pieData[index].color }}
                                                >
                                                    {token.ticker.slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{token.ticker}</p>
                                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{token.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-right py-4 px-2">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="font-medium">{token.weight}%</span>
                                                <div className={`w-12 h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${(token.weight / Math.max(...basketDetails.tokens.map(t => t.weight))) * 100}%`,
                                                            backgroundColor: pieData[index].color
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-right py-4 px-2 font-medium">${token.price.toLocaleString()}</td>
                                        <td className="text-right py-4 px-2">
                                            <div className={`flex items-center justify-end gap-1 ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {token.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                <span className="font-medium">{token.change24h >= 0 ? '+' : ''}{token.change24h}%</span>
                                            </div>
                                        </td>
                                        <td className="text-right py-4 px-2 font-medium">${token.volume}</td>
                                        <td className="text-right py-4 px-2 font-medium">${token.marketCap}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Additional Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Market Insights */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            AI Insights
                        </h2>
                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'} border-l-4 border-green-400`}>
                                <div className="flex items-start gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-green-400 mb-1">Strong Performance</p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Your portfolio is outperforming the market by 4.2% this week, primarily driven by DeFi sector growth.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border-l-4 border-blue-400`}>
                                <div className="flex items-start gap-2">
                                    <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-blue-400 mb-1">Rebalancing Suggestion</p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Consider reducing ETH allocation by 5% and increasing AAVE exposure for better risk-adjusted returns.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'} border-l-4 border-purple-400`}>
                                <div className="flex items-start gap-2">
                                    <Target className="w-5 h-5 text-purple-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-purple-400 mb-1">Next Rebalance</p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Scheduled for June 15th. Expected to optimize allocation based on market conditions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Stats */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            Portfolio Statistics
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Created</span>
                                <span className="font-medium">March 15, 2024</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Rebalance</span>
                                <span className="font-medium">{basketDetails.lastRebalance}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Transactions</span>
                                <span className="font-medium">47</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Hold Time</span>
                                <span className="font-medium">23 days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Best Performer</span>
                                <span className="font-medium text-green-400">UNI (+18.2%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Correlation to BTC</span>
                                <span className="font-medium">0.67</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Max Drawdown</span>
                                <span className="font-medium text-red-400">-12.3%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg font-medium flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5" />
                            AI Rebalance
                        </button>
                        <button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg font-medium flex items-center justify-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Add Funds
                        </button>
                        <button className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg font-medium flex items-center justify-center gap-2`}>
                            <Activity className="w-5 h-5" />
                            View History
                        </button>
                        <button className={`flex-1 ${darkMode ? 'bg-red-900 hover:bg-red-800 text-red-200' : 'bg-red-100 hover:bg-red-200 text-red-800'} py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg font-medium flex items-center justify-center gap-2`}>
                            <AlertTriangle className="w-5 h-5" />
                            Redeem
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserBasketPage;