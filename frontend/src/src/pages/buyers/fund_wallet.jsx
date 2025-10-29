import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    ArrowRight,
    Check,
    Wallet,
    History,
    LogOut,
    Copy,
    ExternalLink,
    TrendingUp,
    DollarSign,
    Clock,
    Download,
    Upload,
    CreditCard,
    Smartphone,
    Building,
    AlertCircle,
    ShoppingBasket,
    Sparkles,
    BarChart3,
    Users,
    Award
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toggleDarkMode } from '../../store/store';
const FundWalletPage = ({ darkMode }) => {
    const dispatch = useDispatch();
    const [userData, setUserData] = useState({
        balance: 250.75,
        // Other user data can be added here
    });

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Basketfy
                        </h1>
                        {/* <nav className="hidden md:flex items-center gap-4">
                            <button onClick={() => setCurrentView('profile')} className={`px-4 py-2 rounded-lg ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                Profile
                            </button>
                            <button onClick={() => setCurrentView('fund')} className="px-4 py-2 rounded-lg bg-purple-600 text-white">
                                Fund Wallet
                            </button>
                            <button onClick={() => setCurrentView('history')} className={`px-4 py-2 rounded-lg ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                History
                            </button>
                        </nav> */}
                    </div>
                    <button
                        onClick={() => dispatch(toggleDarkMode())}
                        className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className={`${darkMode ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-gray-700' : 'bg-gradient-to-r from-purple-100 to-pink-100 border-gray-200'} border rounded-2xl p-8 mb-8`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Current Balance</p>
                    <p className="text-5xl font-bold mb-4">${userData.balance.toFixed(2)}</p>
                    <div className="flex items-center gap-2 text-green-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">+$50.30 this week</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-6">Choose Funding Method</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-purple-500' : 'bg-white border-gray-200 hover:border-purple-500'} border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Building className="w-6 h-6 text-blue-400" />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                                Recommended
                            </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Bank Transfer</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                            Pay with Naira, KES, GHS, or ZAR
                        </p>
                        <div className="flex items-center justify-between text-sm">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Fee: 1.5%</span>
                            <span className="text-green-400 font-medium">Instant</span>
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                            Via Flutterwave, Paystack
                        </p>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-purple-500' : 'bg-white border-gray-200 hover:border-purple-500'} border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg`}>
                        <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                            <Smartphone className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Mobile Money</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                            M-Pesa, MTN MoMo, Airtel Money
                        </p>
                        <div className="flex items-center justify-between text-sm">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Fee: 2%</span>
                            <span className="text-green-400 font-medium">Instant</span>
                        </div>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-purple-500' : 'bg-white border-gray-200 hover:border-purple-500'} border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg`}>
                        <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                            <Wallet className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Crypto Deposit</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                            Send USDC, USDT, HBAR, ETH
                        </p>
                        <div className="flex items-center justify-between text-sm">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Network fees only</span>
                            <span className="text-blue-400 font-medium">5-10 mins</span>
                        </div>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-purple-500' : 'bg-white border-gray-200 hover:border-purple-500'} border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg`}>
                        <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                            <CreditCard className="w-6 h-6 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Debit/Credit Card</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                            Visa, Mastercard, Verve
                        </p>
                        <div className="flex items-center justify-between text-sm">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Fee: 2.5%</span>
                            <span className="text-green-400 font-medium">Instant</span>
                        </div>
                    </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                    <h3 className="text-xl font-semibold mb-6">Enter Amount</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Amount (USDC)</label>
                            <div className="relative">
                                <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className={`w-full pl-12 pr-4 py-4 text-2xl rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {[10, 50, 100, 500].map((amount) => (
                                <button
                                    key={amount}
                                    className={`flex-1 py-2 px-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors font-medium`}
                                >
                                    ${amount}
                                </button>
                            ))}
                        </div>

                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You'll receive:</span>
                                <span className="font-bold">~0 USDC</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Processing fee:</span>
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>~$0.00</span>
                            </div>
                        </div>

                        <div className={`flex items-start gap-2 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                Funds will be converted to USDC and credited to your wallet within minutes
                            </p>
                        </div>

                        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                            Continue to Payment
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FundWalletPage;