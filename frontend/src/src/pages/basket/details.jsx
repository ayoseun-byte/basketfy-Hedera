

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,

  Loader2,


} from 'lucide-react';

import { useWallet } from '../../hook/wallet';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/header';

import toast from 'react-hot-toast';
import logger from '../../uutils/logger';

const BasketDetailPage = ({ darkMode, setShowWalletModal, }) => {

  const location = useLocation(); // Hook to access location object
  const navigate = useNavigate(); // For navigating back or to explore
  const [basketDetails, setBasketDetails] = useState(null); // State to hold the received basket payload
  const [investAmount, setInvestAmount] = useState('');

  const {
    walletConnected,
    getBalance,
    formatAddress,
    walletAddress

  } = useWallet();

  useEffect(() => {
    // Check if location.state exists and contains basketDetails
    if (location.state && location.state.basketDetails) {
      setBasketDetails(location.state.basketDetails);
    } else {
      // If no data is passed, redirect to a safe page (e.g., explore)
      logger("No basket details found in navigation state. Redirecting to explore.");
      navigate('/explore');
    }
  }, [location.state, navigate]); // Depend on location.state and navigate

  const [isBuying, setIsBuying] = useState(false);
  const estimatedTokens = investAmount ? (parseFloat(investAmount) * 0.95).toFixed(2) : '0';

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} ${darkMode ? 'text-white' : 'text-gray-900'}`}>

      {/* Header Component */}
      <Header
       
        setShowWalletModal={setShowWalletModal}
        route={'/baskets'}
        routeText=''
        title="Basket Details"
        basketDetails={basketDetails}
      />


      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4">Performance</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>7 Day</p>
                  <div className="flex items-center gap-2">
                    {basketDetails?.performance7d > 0 ?
                      <TrendingUp className="w-5 h-5 text-green-400" /> :
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    }
                    <span className={`text-2xl font-bold ${basketDetails?.performance7d > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {basketDetails?.performance7d > 0 ? '+' : ''}{basketDetails?.performance7d}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>30 Day</p>
                  <div className="flex items-center gap-2">
                    {basketDetails?.performance30d > 0 ?
                      <TrendingUp className="w-5 h-5 text-green-400" /> :
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    }
                    <span className={`text-2xl font-bold ${basketDetails?.performance30d > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {basketDetails?.performance30d > 0 ? '+' : ''}{basketDetails?.performance30d}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Composition */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
              <h2 className="text-xl font-semibold mb-6">Token Composition</h2>
              <div className="space-y-4">
                {basketDetails?.tokens.map((token, index) => (
                  <div key={token.ticker} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        {token.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{token.ticker}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{token.weight}%</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>${token.price}</p>
                    </div>
                    <div className={`w-16 h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} relative`}>
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${token.weight}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Investment Panel */}
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg sticky top-24`}>
              <h3 className="text-xl font-semibold mb-6">Invest in this Basket</h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Investment Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="100"
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                {investAmount && (
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>You'll receive:</span>
                        <span className="font-medium">{estimatedTokens} bTokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>+ Basket NFT</span>
                        <span className="font-medium">1 NFT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Fees (5%):</span>
                        <span className="font-medium">${(parseFloat(investAmount || '0') * 0.05).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={async () => {
                    if (await getBalance() < 0.01) {
                      toast.error('You need at least 0.01 SOL to create a basket',
                        {
                          duration: 2500,
                        }
                      );
                      setIsCreating(false);
                      return;
                    }
                    console.log("basketDetails:", basketDetails.basketReferenceId)
                    if (investAmount) {
                      setIsBuying(true);
                      const newBasketTokens = basketDetails.tokens.map((item) => ({

                        entryPrice: parseFloat(item.price),
                        isNative: item.isNative,
                        token: item.name,
                        tokenSymbol: item.ticker,
                        description: "Solar energy token",
                        weight: 0.00
                      }));

                      const userId = walletAddress;
                      const sessionId = "current_session_id";
                      const buyBasketData = {
                        "userId": userId,
                        "sessionId": sessionId,
                        "investmentAmount": investAmount,
                        "basketData": {
                          "basketReferenceId": basketDetails.basketReferenceId,
                          "basketName": basketDetails.name,
                          "description": basketDetails.description,
                          "image": basketDetails.image,
                          "createdBy": basketDetails.creator,
                          "totalWeight": 100,
                          "tokens": newBasketTokens,
                        },
                        "category": basketDetails.category,
                      }



                      logger(buyBasketData);
                      try {
                        const result = await buyBasket(
                          investAmount,
                          basketDetails.address,
                          basketDetails.basketReferenceId,
                        )



                        if (result["transactionSignature"] !== null && result["success"]) {

                          logger(`Basket mint successfully: ${result["transactionSignature"]}`);
                          
                          const data = await saveBuyBasket(buyBasketData);

                          logger('Basket created:', data);

                          console.log(buyBasketData)

                          navigate('/confirm', { state: { basketPayload: buyBasketData } });

                        }

                      } catch (err) {

                        logger(`Error buying basket: ${err.message}`);
                        showErrorAlert('Error buying basket', err.message);
                      } finally {
                        setIsBuying(false);
                      }
                    }
                  }}
                  disabled={!investAmount || isBuying}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  {isBuying ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Buying...
                    </div>
                  ) : (
                    walletConnected ? 'Buy This Basket' : 'Connect Wallet to Buy'
                  )}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Holders</span>
                  <span className="font-medium">{basketDetails?.holders}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketDetailPage;