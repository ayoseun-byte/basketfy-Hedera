import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    ArrowLeft,
    Users,
    TrendingDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logger from '../../uutils/logger';
import { getUserBaskets } from '../../api/basketApi';
import { useWallet } from '../../hook/wallet';

export const PortfolioPage = ({ darkMode }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [filteredBaskets, setFilteredBaskets] = useState([]);
     const {
        disconnectWallet,
        walletConnected,
        walletAddress,
        formatAddress,
      } = useWallet();
    useEffect(() => {

        const fetchUserBaskets = async () => {

            try {
                setLoading(true);

                // Set a timeout to ensure loading is false after 400ms
                const timeoutId = setTimeout(() => {
                    setLoading(false);
                }, 400);

                const response = await getUserBaskets( walletAddress,"100");

                // Clear timeout since we got a response
                clearTimeout(timeoutId);

                if (response && response.data) {

                    logger(`Fetched User Baskets:, ${JSON.stringify(response.data.length)}`);
                    setFilteredBaskets(response.data);
                    stats[1].value = response.data.length
                } else {

                    logger(`Failed to fetch baskets:, ${JSON.stringify(response)}`);
                }
            } catch (error) {

                logger(`Error fetching baskets:, ${error.message}`);
            } finally {
                // Ensure loading is false
                setLoading(false);
            }
        };

        fetchUserBaskets();
    }, []);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }
    // Total calculations
    const totalTokens = filteredBaskets.reduce((acc, basket) => {
        return acc + basket.tokens.length;
    }, 0);

    const totalValue = filteredBaskets.reduce((acc, basket) => {
        const basketValue = basket.tokens.reduce((sum, token) => sum + (token.price || 0), 0);
        return acc + basketValue;
    }, 0);

    const totalPNL = filteredBaskets.reduce((acc, basket) => {
        const pnl = basket.tokens.reduce((sum, token) => {
            const price = token.price || 0;
            const change = token.change || 0;
            return sum + (price * (change / 100));
        }, 0);
        return acc + pnl;
    }, 0);

    const pnlColor = totalPNL >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/`)}
                                className="flex items-center gap-2 hover:text-purple-400 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back to Home
                            </button>
                            <h1 className="text-2xl font-bold">My Portfolio</h1>
                        </div>
                        <button
                            onClick={() => navigate(`/explore`)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Explore More
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Portfolio Summary */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg mb-8`}>
                    <h2 className="text-xl font-semibold mb-4">Portfolio Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Value</p>
                            <p className="text-2xl font-bold flex items-center gap-2">
                                ${totalValue.toFixed(2)}
                                <span className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>
                                    PNL(<span className={pnlColor}>{totalPNL >= 0 ? '+' : ''}${totalPNL.toFixed(2)}</span>)
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Return</p>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                <span className="text-2xl font-bold text-green-400">+12.5%</span>
                            </div>
                        </div>
                        <div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Active Baskets</p>
                            <p className="text-2xl font-bold">{filteredBaskets.length}</p>
                        </div>
                    </div>
                </div>

                {/* My Baskets */}
                <h2 className="text-xl font-semibold mb-6">My Baskets</h2>
                {filteredBaskets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <img
                            src="https://i.ibb.co/QWdGLps/basket-minus-svgrepo-com.png"
                            alt="No baskets"
                            className="w-48 h-48 mb-4 opacity-50"
                        />
                        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            No Baskets in Portfolio
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBaskets.map((basket) => (
                            <div
                                key={basket.id}
                                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                                onClick={() => navigate(`/user-basket-portfolio`, { state: { basketDetails: basket } })}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="mb-2">
                                            <img
                                                src={basket.image || 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png'}
                                                alt="Basket"
                                                className="w-12 h-12 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png';
                                                }}
                                            />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-1">{basket.name}</h3>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>by {basket.creator}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>
                                        {basket.category}
                                    </div>
                                </div>

                                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 text-sm`}>{basket.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>7Days Performance</p>
                                        <div className="flex items-center gap-1">
                                            {basket.performance7d > 0 ?
                                                <TrendingUp className="w-3 h-3 text-green-400" /> :
                                                <TrendingDown className="w-3 h-3 text-red-400" />
                                            }
                                            <span className={`text-sm font-medium ${basket.performance7d > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {basket.performance7d > 0 ? '+' : ''}{basket.performance7d}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Tokens</span>
                                            <span className="font-medium">{basket.tokens.length}</span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Value</span>
                                            <span className="font-medium">
                                                ${basket.tokens.reduce((sum, token) => sum + (token.price || 0), 0).toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>PNL</span>
                                            {(() => {
                                                const totalValue = basket.tokens.reduce((sum, token) => sum + (token.price || 0), 0);
                                                const pnl = totalValue * ((basket.performance7d || 0) / 100);
                                                const pnlColor = pnl > 0 ? 'text-green-400' : pnl < 0 ? 'text-red-400' : (darkMode ? 'text-white' : 'text-black');

                                                return (
                                                    <span className={`font-semibold ${pnlColor}`}>
                                                        {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                </div>

                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Top tokens:</div>
                                <div className="flex flex-wrap gap-1">
                                    {basket.tokens.slice(0, 3).map((token) => (
                                        <span key={token.ticker} className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            {token.ticker}
                                        </span>
                                    ))}
                                    {basket.tokens.length > 3 && (
                                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            +{basket.tokens.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioPage;
