import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Search,
    Wallet,
    Loader2,
    Filter,
    Grid3X3,
    List,
} from 'lucide-react';
import Header from '../components/header';
import { useNavigate } from 'react-router-dom';
import { getBaskets } from '../api/basketApi';
import logger from '../uutils/logger';
import { stats } from '../constants/resources';

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
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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

    // Enhanced loading component
    const LoadingState = () => (
        <div className={`min-h-screen flex flex-col items-center justify-center px-4 ${
            darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        }`}>
            <div className="text-center max-w-md">
                <Loader2 className="w-16 h-16 animate-spin text-purple-500 mb-6 mx-auto" />
                <h3 className="text-xl font-semibold mb-3">Discovering Amazing Baskets</h3>
                <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'} animate-pulse`}>
                    {loadingMessage}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full animate-pulse w-3/4"></div>
                </div>
            </div>
        </div>
    );

    // Use local loading state to prevent glitching
    if (isLoadingLocal || !hasData) {
        return <LoadingState />;
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">Explore Baskets</h1>
                    <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Discover curated crypto baskets from top creators
                    </p>
                </div>

                {/* Filters & Controls */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-0">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <input
                            type="text"
                            placeholder="Search baskets by name, creator, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                            } border focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base`}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-3">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className={`px-4 py-3 rounded-xl min-w-[140px] ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                            } border focus:ring-2 focus:ring-purple-500 text-base`}
                        >
                            <option value="all">All Categories</option>
                            <option value="ai">AI</option>
                            <option value="defi">DeFi</option>
                            <option value="staking">Staking</option>
                            <option value="gaming">Gaming</option>
                            <option value="layer1">Layer 1</option>
                        </select>

                        {/* View Mode Toggle - Hidden on mobile */}
                        <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-gray-200 dark:bg-gray-800">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${
                                    viewMode === 'grid' 
                                        ? 'bg-white dark:bg-gray-700 shadow-sm' 
                                        : 'hover:bg-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${
                                    viewMode === 'list' 
                                        ? 'bg-white dark:bg-gray-700 shadow-sm' 
                                        : 'hover:bg-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Showing {filteredBaskets.length} basket{filteredBaskets.length !== 1 ? 's' : ''}
                        {searchTerm && ` for "${searchTerm}"`}
                        {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                    </p>
                </div>

                {/* Empty State */}
                {filteredBaskets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <img
                            src="https://i.ibb.co/QWdGLps/basket-minus-svgrepo-com.png"
                            alt="No baskets found"
                            className="w-32 h-32 sm:w-48 sm:h-48 mb-6 opacity-50"
                        />
                        <h3 className="text-2xl font-semibold mb-3">No Baskets Found</h3>
                        <p className={`text-lg max-w-md mx-auto mb-8 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            {searchTerm || selectedCategory !== 'all' 
                                ? 'Try adjusting your search or filters to find more baskets.'
                                : 'Be the first to create a basket in this category!'
                            }
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    /* Baskets Grid/List */
                    <div className={
                        viewMode === 'grid' 
                            ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                            : "space-y-4"
                    }>
                        {filteredBaskets.map((basket) => (
                            <div
                                key={basket.id}
                                className={`rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border ${
                                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                } ${
                                    viewMode === 'grid' 
                                        ? 'hover:scale-105' 
                                        : 'hover:border-purple-400'
                                }`}
                                onClick={() => {
                                    navigate(`/basket/${basket.name}`, { state: { basketDetails: basket } });
                                }}
                            >
                                <div className={
                                    viewMode === 'list' 
                                        ? "flex flex-col sm:flex-row sm:items-start gap-4"
                                        : ""
                                }>
                                    {/* Basket Header */}
                                    <div className="flex items-start justify-between mb-4 flex-1">
                                        <div className="flex items-start gap-4 min-w-0 flex-1">
                                            <img
                                                src={basket.image || 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png'}
                                                alt={basket.name}
                                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
                                                onError={(e) => {
                                                    e.target.src = 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png';
                                                }}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-semibold truncate">{basket.name}</h3>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                                                        darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {basket.category}
                                                    </span>
                                                </div>
                                                <p className={`text-sm ${
                                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                                } truncate`}>
                                                    by {basket.creator}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Basket Description */}
                                    <p className={`${
                                        darkMode ? 'text-gray-300' : 'text-gray-600'
                                    } mb-4 text-sm line-clamp-2 ${
                                        viewMode === 'list' ? 'sm:mb-0 sm:max-w-md' : ''
                                    }`}>
                                        {basket.description}
                                    </p>

                                    {/* Stats & Tokens */}
                                    <div className={
                                        viewMode === 'list' 
                                            ? "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                                            : ""
                                    }>
                                        {/* Performance Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-4 flex-shrink-0">
                                            <div>
                                                <p className={`text-xs ${
                                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                                } mb-1`}>7D Performance</p>
                                                <div className="flex items-center gap-1">
                                                    {basket.performance7d > 0 ?
                                                        <TrendingUp className="w-4 h-4 text-green-400" /> :
                                                        <TrendingDown className="w-4 h-4 text-red-400" />
                                                    }
                                                    <span className={`text-sm font-medium ${
                                                        basket.performance7d > 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {basket.performance7d > 0 ? '+' : ''}{basket.performance7d}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className={`text-xs ${
                                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                                } mb-1`}>Holders</p>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4 text-purple-400" />
                                                    <span className="text-sm font-medium">{basket.holders}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Top Tokens */}
                                        <div className="flex-shrink-0">
                                            <div className={`text-xs ${
                                                darkMode ? 'text-gray-400' : 'text-gray-500'
                                            } mb-2`}>Top tokens:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {basket.tokens.slice(0, 3).map((token) => (
                                                    <span key={token.ticker} className={`text-xs px-2 py-1 rounded ${
                                                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                                    }`}>
                                                        {token.ticker}
                                                    </span>
                                                ))}
                                                {basket.tokens.length > 3 && (
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                                    }`}>
                                                        +{basket.tokens.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BasketsPage;