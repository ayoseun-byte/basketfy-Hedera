import React, { useState, useEffect, useRef } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Twitter,
    Github,
    MessageCircle,
    Mail,
    ExternalLink,
    DollarSign,
    BarChart3,
    Coins,
    ArrowRight,
    ChevronDown,
    ShoppingBasket,
    Sparkles,
    Zap,
    Menu,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingPage = ({
    darkMode,
    setDarkMode,
    baskets,
    stats,
    setShowWalletModal,
    features 
}) => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDropdownOpen2, setIsDropdownOpen2] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownRef2 = useRef(null);
    const mobileMenuRef = useRef(null);
    const year = new Date().getFullYear();
    const [currentOffering, setCurrentOffering] = useState(0);

    const offerings = [
        "Agentic-AI rebalancing",
        "One-click diversification",
        "Social trading features",
        "DeFi-native infrastructure"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentOffering((prev) => (prev + 1) % offerings.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (dropdownRef2.current && !dropdownRef2.current.contains(event.target)) {
                setIsDropdownOpen2(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`max-w-screen min-h-screen ${
            darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black' : 'bg-gradient-to-br from-white via-purple-50 to-gray-100'
        } ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300 overflow-x-hidden`}>

            {/* Header */}
            <header className="flex justify-between items-center p-4 sm:p-6 relative z-50">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Basketfy
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="sm:hidden p-2 rounded-lg transition-colors"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center gap-3 lg:gap-4">
                    {/* Testnet Dropdown */}
                    <div className="relative" ref={dropdownRef2}>
                        <button
                            onClick={() => setIsDropdownOpen2(!isDropdownOpen2)}
                            className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg font-mono text-sm flex items-center gap-2"
                        >
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            Testnet
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {isDropdownOpen2 && (
                            <div className={`absolute right-0 mt-2 w-48 ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            } border rounded-lg shadow-xl z-20`}>
                                <ul className="p-2 space-y-1">
                                    <li>
                                        <button
                                            onClick={() => {
                                                navigate("/faucet");
                                                setIsDropdownOpen2(false);
                                            }}
                                            className="w-full font-light text-sm text-left py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-700 transition-colors"
                                        >
                                            Get Testnet Tokens
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-lg ${
                            darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                        } transition-colors`}
                        aria-label="Toggle theme"
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>

                    {/* Basket Hub Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:opacity-90 transition-opacity"
                        >
                            <ShoppingBasket className="w-4 h-4" />
                            <span className="hidden lg:inline">Basket Hub</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {isDropdownOpen && (
                            <div className={`absolute right-0 mt-2 w-48 ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            } border rounded-lg shadow-xl z-20`}>
                                <ul className="p-2 space-y-1">
                                    <li>
                                        <button
                                            onClick={() => {
                                                navigate("/baskets");
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full font-light text-sm text-left px-3 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-700 transition-colors"
                                        >
                                            Explore Baskets
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => {
                                                navigate("/login");
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full text-left font-light text-sm px-3 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-700 transition-colors"
                                        >
                                            Login
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => {
                                                navigate("/feeder");
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full text-left font-light text-sm px-3 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-700 transition-colors"
                                        >
                                            Become a Feeder
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div 
                        ref={mobileMenuRef}
                        className="absolute top-16 right-4 sm:hidden bg-gray-00 border border-gray-700 rounded-lg p-4 shadow-xl z-50 min-w-[200px]"
                    >
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    navigate("/faucet");
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-2 p-2 rounded-lg bg-gray-700 text-left text-sm"
                            >
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Get Testnet Tokens
                            </button>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="p-2 rounded-lg bg-gray-700 text-left text-sm"
                            >
                                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                            </button>
                            <button
                                onClick={() => {
                                    navigate("/baskets");
                                    setMobileMenuOpen(false);
                                }}
                                className="p-2 rounded-lg bg-gray-700 text-left text-sm"
                            >
                                Explore Baskets
                            </button>
                            <button
                                onClick={() => {
                                    navigate("/login");
                                    setMobileMenuOpen(false);
                                }}
                                className="p-2 rounded-lg bg-gray-700 text-left text-sm"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => {
                                    navigate("/feeder");
                                    setMobileMenuOpen(false);
                                }}
                                className="p-2 rounded-lg bg-gray-700 text-left text-sm"
                            >
                                Become a Feeder
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="text-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 relative">
                <div className="max-w-6xl mx-auto">
                    {/* Badge */}
                    <div className={`inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full ${
                        darkMode ? 'bg-purple-500/20 text-purple-200 border-purple-400/30' : 'bg-purple-100 text-purple-700 border-purple-300'
                    } border backdrop-blur-md mb-6 sm:mb-8 font-medium shadow-lg transition-all duration-300`}>
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                        <span className="text-xs sm:text-sm font-semibold tracking-wide">DeFi's First Native ETF Platform</span>
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>

                    {/* Enhanced Main Headlines */}
                    <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight sm:leading-none tracking-tight">
                            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                                Crypto For
                            </span>
                            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2 sm:mt-4">
                                Anybody
                            </span>
                        </h1>

                        {/* Dynamic Feature Showcase */}
                        <div className="h-12 sm:h-16 flex items-center justify-center mt-4 sm:mt-6">
                            <div className={`text-lg sm:text-xl md:text-2xl font-medium ${
                                darkMode ? 'text-purple-300' : 'text-purple-600'
                            } transition-all duration-500 text-center px-4`}>
                                {offerings[currentOffering]}
                            </div>
                        </div>
                    </div>

                    <p className={`text-base sm:text-lg lg:text-xl ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                    } mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4`}>
                        Want to invest in crypto but not sure where to start? <br className="hidden sm:block" />
                        Don't stress about what to buy—just <span className="font-semibold">buy a basket.</span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
                        <button
                            onClick={() => navigate('/baskets')}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-base sm:text-lg w-full sm:w-auto"
                        >
                            Explore Baskets
                        </button>
                        <button
                            onClick={() => navigate('/how-it-works')}
                            className={`${
                                darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                            } font-semibold flex items-center gap-2 transition-colors py-3 text-base sm:text-lg`}
                        >
                            Learn How It Works <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto mt-8 sm:mt-16">
                        {stats.map((stat, index) => (
                            <div key={index} className={`${
                                darkMode ? 'bg-gray-800/30' : 'bg-white/50'
                            } backdrop-blur-sm p-3 sm:p-4 rounded-xl border ${
                                darkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}>
                                <div className="flex items-center justify-center gap-2 text-purple-400 mb-2">
                                    {stat.icon}
                                </div>
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stat.value}</div>
                                <div className={`text-xs sm:text-sm ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="px-4 sm:px-6 pb-16 sm:pb-20">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-center">How Basketfy Works</h2>
                    <p className={`text-base sm:text-lg ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                    } text-center mb-12 sm:mb-16 max-w-3xl mx-auto px-4`}>
                        Instead of researching and managing individual tokens, gain diversified exposure with a single transaction.
                    </p>

                    {/* Target Audiences */}
                    <div className={`${
                        darkMode ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30' : 'bg-gradient-to-r from-purple-50 to-blue-50'
                    } rounded-2xl p-6 sm:p-8 mb-12 sm:mb-16 border ${
                        darkMode ? 'border-purple-800/50' : 'border-purple-200'
                    }`}>
                        <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-center">Perfect For Every Type of Investor</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                            {[
                                { emoji: '🌱', title: 'New Retail Users', desc: "Don't understand tokenomics? Get exposure without complexity." },
                                { emoji: '🏢', title: 'Institutions', desc: 'Seeking thematic exposure with professional-grade execution.' },
                                { emoji: '😴', title: 'Passive Investors', desc: 'Automated rebalancing keeps your portfolio optimized.' }
                            ].map((item, index) => (
                                <div key={index} className="text-center p-4">
                                    <div className="text-2xl sm:text-3xl mb-3">{item.emoji}</div>
                                    <h4 className="font-semibold mb-2 text-sm sm:text-base">{item.title}</h4>
                                    <p className={`text-xs sm:text-sm ${
                                        darkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Process Flow */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { icon: Coins, step: '1', title: 'Choose Your Theme', desc: 'Select from curated baskets or create your own custom composition.' },
                            { icon: DollarSign, step: '2', title: 'Single Transaction', desc: 'Deposit USDC and get bTokens representing your basket.' },
                            { icon: BarChart3, step: '3', title: 'Enjoy Diversification', desc: 'Hold, trade, or redeem with automatic rebalancing.' }
                        ].map((item, index) => (
                            <div key={index} className="text-center p-4 sm:p-6">
                                <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-full ${
                                    darkMode ? 'bg-purple-900/50' : 'bg-purple-100'
                                } flex items-center justify-center relative`}>
                                    <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                                    <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-3">{item.title}</h3>
                                <p className={`text-sm ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                } leading-relaxed`}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="px-4 sm:px-6 pb-16 sm:pb-20">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-12 sm:mb-16 text-center">Why Choose Basketfy</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className={`${
                                darkMode ? 'bg-gray-800/30' : 'bg-white/50'
                            } backdrop-blur-sm p-6 sm:p-8 rounded-2xl border ${
                                darkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}>
                                <div className="text-purple-400 mb-3 sm:mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className={`text-sm sm:text-base ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                } leading-relaxed`}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Baskets */}
            {baskets && baskets.length > 0 && (
                <section className="px-4 sm:px-6 pb-16 sm:pb-24">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center">Featured Baskets</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {baskets.filter(b => b.performance7d > 0).slice(0, 3).map((basket) => (
                                <div
                                    key={basket.id}
                                    className={`${
                                        darkMode ? 'bg-gray-800/50 hover:bg-gray-800/70' : 'bg-white/70 hover:bg-white/90'
                                    } backdrop-blur-sm p-4 sm:p-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer border ${
                                        darkMode ? 'border-gray-700' : 'border-gray-200'
                                    }`}
                                    onClick={() => navigate(`/basket/${basket.name}`, { state: { basketDetails: basket } })}
                                >
                                    <div className="mb-3">
                                        <img
                                            src={basket.image || 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png'}
                                            alt="Basket"
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png';
                                            }}
                                        />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 line-clamp-2">{basket.name}</h3>
                                    <p className={`${
                                        darkMode ? 'text-gray-400' : 'text-gray-600'
                                    } mb-3 sm:mb-4 leading-relaxed text-sm line-clamp-3`}>{basket.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {basket.performance7d > 0 ?
                                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" /> :
                                                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                                            }
                                            <span className={`text-sm ${
                                                basket.performance7d > 0 ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {basket.performance7d > 0 ? '+' : ''}{basket.performance7d}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-purple-400">
                                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="text-sm">{basket.holders}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className={`${
                darkMode ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50' : 'bg-gradient-to-r from-purple-100 to-pink-100'
            } mx-4 sm:mx-6 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 mb-12 sm:mb-20`}>
                <div className="text-center max-w-4xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Ready to Build Your First Basket?</h2>
                    <p className={`text-base sm:text-lg ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                    } mb-6 sm:mb-8`}>
                        Join thousands of users creating and trading themed crypto baskets
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 text-base sm:text-lg"
                        >
                            Join now
                        </button>
                        <button
                            onClick={() => navigate('/baskets')}
                            className={`${
                                darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'
                            } font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 border ${
                                darkMode ? 'border-gray-700' : 'border-gray-200'
                            } text-base sm:text-lg`}
                        >
                            Browse Marketplace
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`${
                darkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'
            } backdrop-blur-sm border-t ${
                darkMode ? 'border-gray-800' : 'border-gray-200'
            } px-4 sm:px-6 py-12 sm:py-16`}>
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
                        {/* Brand */}
                        <div className="lg:col-span-1">
                            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                                Basketfy
                            </div>
                            <p className={`${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            } mb-6 leading-relaxed text-sm`}>
                                The DeFi-native ETF platform. Create, manage, and trade baskets of tokens with smart contracts.
                            </p>
                            <div className="flex gap-3 sm:gap-4">
                                {[Twitter, Github, MessageCircle, Mail].map((Icon, index) => (
                                    <button key={index} className={`${
                                        darkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'
                                    } transition-colors`}>
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        {[
                            { title: 'Product', links: ['Create Basket', 'Browse Baskets', 'Portfolio', 'Analytics', 'API'] },
                            { title: 'Learn', links: ['How It Works', 'Documentation', 'Tutorials', 'Blog', 'White Paper'] },
                            { title: 'Company', links: ['About', 'Careers', 'Press', 'Contact', 'Legal'] }
                        ].map((section, index) => (
                            <div key={index}>
                                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.links.map((link, linkIndex) => (
                                        <li key={linkIndex}>
                                            <button className={`text-xs sm:text-sm ${
                                                darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                                            } transition-colors`}>
                                                {link}
                                                {link === 'API' && <ExternalLink className="w-3 h-3 inline ml-1" />}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom */}
                    <div className={`border-t ${
                        darkMode ? 'border-gray-800' : 'border-gray-200'
                    } pt-6 sm:pt-8`}>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className={`${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            } text-xs sm:text-sm text-center sm:text-left`}>
                                © {year} Basketfy. All rights reserved.
                            </div>
                            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                                <button
                                    onClick={() => navigate('/privacy-policy')}
                                    className={`${
                                        darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                                    } transition-colors`}
                                >
                                    Privacy Policy
                                </button>
                                <button
                                    onClick={() => navigate('/terms-of-service')}
                                    className={`${
                                        darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                                    } transition-colors`}
                                >
                                    Terms of Service
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;