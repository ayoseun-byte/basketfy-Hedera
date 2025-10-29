import React, { useState, useEffect } from 'react';
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
  resetWallet,
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

  const wallets = [
    { name: 'Phantom', icon: './src/assets/ghost.png', adapter: 'phantom' },
    { name: 'Metamask', icon: './src/assets/metamask.png', adapter: 'metamask' },
    // { name: 'Backpack', icon: '🎒', adapter: 'backpack' },
    // { name: 'Coinbase Wallet', icon: '🔵', adapter: 'coinbase' }
  ];


  const formatxwalletAddress = useSelector((state) => state.global.formattedAddress);

  const handleConnect = async (walletType) => {
    setError('');

    const result = await connectWallet(walletType);

    if (result.success) {
      //  console.log(result);
      // ✅ Update Redux store with correct values
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
                <span className="font-medium text-green-700 dark:text-green-400">Connected</span>
              </div>
              <div className="text-sm opacity-75">
                Address: {formatxwalletAddress}
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

            {wallets.map((wallet) => (
              <button
                key={wallet.adapter}
                onClick={() => handleConnect(wallet.adapter)}
                disabled={connecting}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                  } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <img src={wallet.icon} className="w-8 h-8 flex items-center justify-center text-lg" />

                <span className={`${darkMode ? 'text-white' : 'text-gray-900'} flex-1 text-left font-thin`}>
                  {wallet.name}
                </span>
                {connecting && <Loader2 className="animate-spin" size={16} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletModal;