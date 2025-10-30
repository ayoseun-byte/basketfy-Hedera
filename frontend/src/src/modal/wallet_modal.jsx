// In WalletModal.jsx - SIMPLIFIED VERSION
import React, { useState } from 'react';
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useHashpackWallet } from '../hook/useHashpackWallet';
import toast from 'react-hot-toast';

const WalletModal = ({ showWalletModal, setShowWalletModal, darkMode }) => {
  const {
    accountId: walletAddress,
    connected,
    loading,
    connect,
    disconnect,
    formatAddress
  } = useHashpackWallet();

  const [error, setError] = useState('');

  const handleConnect = async () => {
    
    try {
      await connect();
      setShowWalletModal(false);
      toast.success("Hashpack Connected!");
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
      toast.error("Failed to connect wallet");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Wallet Disconnected");
    } catch (err) {
      toast.error("Failed to disconnect wallet");
    }
  };

  if (!showWalletModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-sm w-full mx-4`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${darkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold`}>
            {connected ? 'Wallet Connected' : 'Connect Wallet'}
          </h3>
          <button
            onClick={() => setShowWalletModal(false)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {connected ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'} border ${darkMode ? 'border-gray-600' : 'border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="font-medium text-green-700 dark:text-green-400">
                  Connected with Hashpack
                </span>
              </div>
              <div className="text-sm opacity-75 break-all">
                Account: {walletAddress}
              </div>
              <div className="text-sm opacity-75">
                Formatted: {formatAddress(walletAddress)}
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {error && (
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/50' : 'bg-red-50'} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-red-500" size={16} />
                  <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-xs">H</span>
                  </div>
                  Connect Hashpack
                </>
              )}
            </button>

            <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This will open Hashpack wallet for connection
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletModal;