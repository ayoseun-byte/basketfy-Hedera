import React, { useState } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useWallet } from '../hook/wallet';
import toast from 'react-hot-toast';
import {
  setWalletConnected,
  setWalletAddress,
  setFormattedAddress,
} from '../store/store';

const WalletModal = ({ showWalletModal, setShowWalletModal, darkMode }) => {
  const {
    connectWallet,
    disconnectWallet,
    walletConnected,
    connecting,
    walletAddress,
    formatAddress,
  } = useWallet();

  const dispatch = useDispatch();
  const [error, setError] = useState('');

  const formattedWalletAddress = useSelector((state) => state.global.formattedAddress);

  const handleConnect = async () => {
    setError('');

    // Only MetaMask is supported now
    const result = await connectWallet();

    if (result.success) {
      dispatch(setWalletConnected(true));
      dispatch(setWalletAddress(result.address));
      dispatch(setFormattedAddress(formatAddress(result.address)));
      setShowWalletModal(false);
      toast.success("Wallet Connected");
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    dispatch(setWalletConnected(false));
    dispatch(setWalletAddress(''));
    dispatch(setFormattedAddress(''));
  };

  if (!showWalletModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-sm w-full mx-4`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${darkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold`}>
            {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
          </h3>
          <button
            onClick={() => setShowWalletModal(false)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {walletConnected ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'} border ${darkMode ? 'border-gray-600' : 'border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="font-medium text-green-700 dark:text-green-400">Connected to Hedera Testnet</span>
              </div>
              <div className="text-sm opacity-75">
                Address: {formattedWalletAddress}
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

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                This app uses MetaMask on the Hedera Testnet. MetaMask will be automatically configured when you connect.
              </p>
            </div>

            <button
              onClick={handleConnect}
              disabled={connecting}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border ${
                darkMode
                  ? 'border-gray-600 hover:bg-gray-700'
                  : 'border-gray-300 hover:bg-gray-50'
              } transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none hover:from-orange-600 hover:to-orange-700`}
            >
              <img
                src="./src/assets/metamask.png"
                alt="MetaMask"
                className="w-8 h-8"
                onError={(e) => {
                  e.target.src = '🦊';
                  e.target.className = 'text-2xl';
                }}
              />

              <span className="flex-1 text-left font-semibold">
                {connecting ? 'Connecting...' : 'Connect MetaMask'}
              </span>
              {connecting && <Loader2 className="animate-spin" size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletModal;