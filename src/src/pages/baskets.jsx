import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Users,
    ArrowLeft,
    Search,
    Wallet,
    Loader2,
} from 'lucide-react';
import Header from '../components/header';
import { useNavigate } from 'react-router-dom';
import { getBaskets } from '../api/basketApi';
import logger from '../uutils/logger';
import { stats } from '../../App';

const BasketsPage = ({
    darkMode,
    setShowWalletModal,
    setWalletConnected,
    walletConnected,
    setSearchTerm,
    searchTerm,
    setLoading,
    loading,
    setBaskets,
    selectedCategory,
    setSelectedCategory,
    filteredBaskets,
}) => {
    const navigate = useNavigate();
    const [isLoadingLocal, setIsLoadingLocal] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Loading baskets...');
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        const fetchBaskets = async () => {
            try {
                setIsLoadingLocal(true);
                setLoading(true);
                setLoadingMessage('Loading baskets...');

                // Set a timeout to show encouraging message after 3 seconds
                const messageTimeoutId = setTimeout(() => {
                    setLoadingMessage('Fetching, please hold...');
                }, 3000);

                // Set another timeout for extended wait
                const extendedMessageTimeoutId = setTimeout(() => {
                    setLoadingMessage('The best baskets are usually the last... please hold');
                }, 6000);

                const response = await getBaskets("100");

                // Clear all timeouts since we got a response
                clearTimeout(messageTimeoutId);
                clearTimeout(extendedMessageTimeoutId);

                // Check if response exists and has data property
                if (response && response.result && Array.isArray(response.result)) {
                    logger(`Fetched Baskets: ${response.result.length}`);
                    setBaskets(response.result);
                    setHasData(true);
                } else {
                    // Handle case where response.data is undefined, null, or not an array
                    console.log("Failed to fetch baskets: Invalid response structure", response);
                    logger(`Failed to fetch baskets: Invalid response structure`);

                    // Set empty array instead of undefined
                    setBaskets([]);
                    setHasData(true);
                    stats[1].value = 0;
                }
            } catch (error) {
                logger(`Error fetching baskets: ${error.message}`);
                console.error("Error fetching baskets:", error);

                // Set empty array on error
                setBaskets([]);
                setHasData(true);
                stats[1].value = 0;
            } finally {
                // Only set loading to false when we actually have data or an error
                setIsLoadingLocal(false);
                setLoading(false);
            }
        };

        fetchBaskets();
    }, []);

    // Use local loading state to prevent glitching
    if (isLoadingLocal || !hasData) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} animate-pulse`}>
                    {loadingMessage}
                </p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {/* Header Component */}
            <Header
                darkMode={darkMode}
                setWalletConnected={setWalletConnected}
                setShowWalletModal={setShowWalletModal}
                route={'/'}
                walletConnected={walletConnected}
                title="Market"
            />

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            placeholder="Search baskets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border focus:ring-2 focus:ring-purple-500`}
                    >
                        <option value="all">All Categories</option>
                        <option value="ai">AI</option>
                        <option value="defi">DeFi</option>
                        <option value="staking">Staking</option>
                    </select>
                </div>

                {/* Empty State */}
                {filteredBaskets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <img
                            src="https://i.ibb.co/QWdGLps/basket-minus-svgrepo-com.png"
                            alt="No baskets"
                            className="w-48 h-48 mb-4 opacity-50"
                        />
                        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            No Baskets yet
                        </p>
                    </div>
                ) : (
                    /* Baskets Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBaskets.map((basket) => (
                            <div
                                key={basket.id}
                                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                                onClick={() => {
                                    navigate(`/basket/${basket.name}`, { state: { basketDetails: basket } });
                                }}
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
                                    <div>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Holders</p>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3 text-purple-400" />
                                            <span className="text-sm font-medium">{basket.holders}</span>
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

export default BasketsPage;