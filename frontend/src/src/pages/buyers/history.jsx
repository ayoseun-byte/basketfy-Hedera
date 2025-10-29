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
    const HistoryPage = ({ darkMode, }) => {
    const dispatch = useDispatch();
 
        return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Basketfy
                        </h1>
                        <nav className="hidden md:flex items-center gap-4">
                            <button onClick={() => setCurrentView('profile')} className={`px-4 py-2 rounded-lg ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                Profile
                            </button>
                            <button onClick={() => setCurrentView('fund')} className={`px-4 py-2 rounded-lg ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                Fund Wallet
                            </button>
                            <button onClick={() => setCurrentView('history')} className="px-4 py-2 rounded-lg bg-purple-600 text-white">
                                History
                            </button>
                        </nav>
                    </div>
                    <button
                        onClick={() => dispatch(toggleDarkMode())}
                        className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Transaction History</h2>
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 mb-6`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Type</label>
                            <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                                <option>All Types</option>
                                <option>Deposits</option>
                                <option>Withdrawals</option>
                                <option>Investments</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                                <option>All Status</option>
                                <option>Completed</option>
                                <option>Pending</option>
                                <option>Failed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Date From</label>
                            <input
                                type="date"
                                className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Date To</label>
                            <input
                                type="date"
                                className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                    </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl overflow-hidden`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <tr>
                                    <th className="text-left p-4 font-semibold">Type</th>
                                    <th className="text-left p-4 font-semibold">Amount</th>
                                    <th className="text-left p-4 font-semibold">Basket</th>
                                    <th className="text-left p-4 font-semibold">Date</th>
                                    <th className="text-left p-4 font-semibold">Status</th>
                                    <th className="text-left p-4 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userData.transactions.map((tx) => (
                                    <tr key={tx.id} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    tx.type === 'deposit' ? 'bg-green-500/20' :
                                                    tx.type === 'investment' ? 'bg-purple-500/20' : 'bg-blue-500/20'
                                                }`}>
                                                    {tx.type === 'deposit' && <Upload className="w-5 h-5 text-green-400" />}
                                                    {tx.type === 'investment' && <ShoppingBasket className="w-5 h-5 text-purple-400" />}
                                                    {tx.type === 'withdrawal' && <Download className="w-5 h-5 text-blue-400" />}
                                                </div>
                                                <span className="font-medium capitalize">{tx.type}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold">
                                            {tx.amount} {tx.currency}
                                        </td>
                                        <td className="p-4">
                                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{tx.basket}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{tx.date}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                tx.status === 'completed' ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') :
                                                tx.status === 'pending' ? (darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800') :
                                                (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')
                                            }`}>
                                                {tx.status === 'completed' && <Check className="w-3 h-3 inline mr-1" />}
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                                                View
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4 flex items-center justify-between`}>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Showing 1-5 of 47 transactions
                        </span>
                        <div className="flex items-center gap-2">
                            <button className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                Previous
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-purple-600 text-white">
                                1
                            </button>
                            <button className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                2
                            </button>
                            <button className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;