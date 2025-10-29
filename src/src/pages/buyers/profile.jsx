import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, setWalletAddress, toggleDarkMode } from '../../store/store';
import { loginWithGoogle } from '../../api/authApi';
import { getBasketTransactions } from '../../api/basketApi';

const ProfilePage = ({ darkMode }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [txLoading, setTxLoading] = useState(false);
    
    const userData = useSelector((state) => state.global.userData);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const savedState = sessionStorage.getItem('oauth_state');

        if (code && state === savedState) {
            exchangeCodeForUser(code);
        } else {
            setLoading(false);
            if (userData?.userId) {
                fetchTransactions(userData.userId);
            }
        }
    }, []);

    // Fetch transactions from API
    async function fetchTransactions(userId) {
        setTxLoading(true);
        try {
            const response = await getBasketTransactions(userId,10);

            const data = await response.result;
            setTransactions(data.transactions || []);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setTransactions([]);
        } finally {
            setTxLoading(false);
        }
    }

    async function exchangeCodeForUser(code) {
        try {
            const response = await loginWithGoogle({ code });
            const userInfo = response.result;

            dispatch(setUserData({
                userId: userInfo.userId,
                email: userInfo.email,
                fullName: userInfo.fullName,
                name: userInfo.fullName,
                phone: userInfo.phone,
                isEmailVerified: userInfo.isEmailVerified,
                isPhoneVerified: userInfo.isPhoneVerified,
                createdAt: userInfo.createdAt,
                lastLoginAt: userInfo.lastLoginAt,
                avatar: userInfo.avatarUrl,
                balance: userInfo.balance || 0,
                totalInvested: userInfo.totalInvested || 0,
                totalReturns: userInfo.totalReturns || 0,
                basketsOwned: userInfo.basketsOwned ? userInfo.basketsOwned.length : 0,
                joinDate: new Date(userInfo.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                walletAddress: userInfo.walletAddress || '0x0000...0000'
            }));

            if (userInfo.walletAddress) {
                dispatch(setWalletAddress(userInfo.walletAddress));
            }

            // Fetch transactions after login
            await fetchTransactions(userInfo.userId);

            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
            console.error('Google sign-in failed', err);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Please log in to view your profile</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Basketfy
                    </h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => dispatch(toggleDarkMode())}
                            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-8 mb-8`}>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <img
                            src={userData.avatar}
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-4 border-purple-500"
                        />
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-2">{userData.fullName}</h2>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{userData.email}</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-4`}>Member since {userData.joinDate}</p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <Wallet className="w-4 h-4 text-purple-400" />
                                    <span className="font-mono text-sm">{userData.walletAddress}</span>
                                    <button className="hover:text-purple-400">
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>
                                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors text-white">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                        <Wallet className="w-8 h-8 text-purple-400 mb-2" />
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Wallet Balance</p>
                        <p className="text-3xl font-bold">${userData.balance.toString()}</p>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                        <DollarSign className="w-8 h-8 text-blue-400 mb-2" />
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Invested</p>
                        <p className="text-3xl font-bold">${userData.totalInvested.toString()}</p>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                        <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Returns</p>
                        <p className="text-3xl font-bold text-green-400">+${userData.totalReturns.toString()}</p>
                        <p className="text-sm text-green-400 mt-1">+16.5%</p>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                        <ShoppingBasket className="w-8 h-8 text-orange-400 mb-2" />
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Active Baskets</p>
                        <p className="text-3xl font-bold">{userData.basketsOwned}</p>
                    </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 mb-8`}>
                    <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-4 rounded-xl transition-colors flex flex-col items-center gap-2`}>
                            <Upload className="w-6 h-6 text-purple-400" />
                            <span className="font-medium">Deposit</span>
                        </button>
                        <button className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-4 rounded-xl transition-colors flex flex-col items-center gap-2`}>
                            <Download className="w-6 h-6 text-blue-400" />
                            <span className="font-medium">Withdraw</span>
                        </button>
                        <button onClick={() => navigate('/baskets')} className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-4 rounded-xl transition-colors flex flex-col items-center gap-2`}>
                            <ShoppingBasket className="w-6 h-6 text-green-400" />
                            <span className="font-medium">Buy Basket</span>
                        </button>
                        <button className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-4 rounded-xl transition-colors flex flex-col items-center gap-2`}>
                            <History className="w-6 h-6 text-orange-400" />
                            <span className="font-medium">History</span>
                        </button>
                    </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Recent Activity</h3>
                        {txLoading && <span className="text-sm text-gray-400">Loading...</span>}
                    </div>
                    <div className="space-y-3">
                        {transactions.length === 0 ? (
                            <div className={`flex flex-col items-center justify-center py-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                                <History className="w-12 h-12 text-gray-400 mb-3" />
                                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No transactions yet</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Your transactions will appear here</p>
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-500/20' : tx.type === 'investment' ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
                                            {tx.type === 'deposit' && <Upload className="w-5 h-5 text-green-400" />}
                                            {tx.type === 'investment' && <ShoppingBasket className="w-5 h-5 text-purple-400" />}
                                            {tx.type === 'withdrawal' && <Download className="w-5 h-5 text-blue-400" />}
                                        </div>
                                        <div>
                                            <p className="font-medium capitalize">{tx.type}</p>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tx.basket || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{tx.amount} {tx.currency}</p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;