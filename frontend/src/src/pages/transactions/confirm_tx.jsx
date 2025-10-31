import React, { useState, useEffect } from 'react';
import {
  Check,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const ConfirmTransaction = ({ darkMode }) => {
  const steps = [
    'Swapping on OKX',
    'Minting bToken',
    'Minting Basket NFT',
    'Depositing tokens into PDA'
  ];

  const [transactionStep, setTransactionStep] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedBasket, setBasketDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state && location.state.basketPayload) {
      setBasketDetails(location.state.basketPayload);
      setLoading(false);
      console.log("Received basket payload:", location.state.basketPayload);
    } else {
      console.warn("No basket payload found in navigation state. Redirecting to explore.");
      const timer = setTimeout(() => {
        navigate('/explore');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (transactionStep < steps.length) {
      const timer = setTimeout(() => {
        setTransactionStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        navigate('/buy-success', { state: { basketPayload: selectedBasket } });
      }, 1000);
    }
  }, [transactionStep]);

  return (
    <div className={`min-h-screen py-4 sm:py-8 px-4 sm:px-6 flex items-center justify-center ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white' 
        : 'bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 text-gray-900'
    }`}>
      
      {/* Back Button */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700'
              : 'bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200'
          } shadow-sm hover:shadow-md`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium hidden xs:inline">Back</span>
        </button>
      </div>

      <div className={`w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl backdrop-blur-sm ${
        darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'
      } border`}>
        
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Confirm Transaction</h2>
          <p className={`text-xs sm:text-sm mt-2 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Processing your basket purchase
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-purple-500 mx-auto mb-4" />
            <p className={`text-sm sm:text-base ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Loading basket details...
            </p>
          </div>
        ) : selectedBasket ? (
          <>
            {/* Basket Details Card */}
            <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 lg:mb-8 ${
              darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-100 border-gray-300'
            } border`}>
              <div className="text-center mb-3 sm:mb-4">
                <div className="flex justify-center mb-2 sm:mb-3">
                  <img
                    src={selectedBasket.basketData?.image || 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png'}
                    alt="Basket"
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-purple-400"
                    onError={(e) => {
                      e.target.src = 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png';
                    }}
                  />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold line-clamp-2">
                  {selectedBasket.basketData?.basketName || 'Basket'}
                </h3>
              </div>

              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Investment Amount:
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    ${selectedBasket.investmentAmount} USDC
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    bTokens to receive:
                  </span>
                  <span className="font-medium text-sm sm:text-base text-green-400">
                    {(parseFloat(selectedBasket.investmentAmount || '0') * 0.95).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Basket NFT:
                  </span>
                  <span className="font-medium text-sm sm:text-base text-purple-400">
                    1 NFT
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 lg:mb-8">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index < transactionStep
                      ? 'bg-green-500 shadow-lg shadow-green-500/30'
                      : index === transactionStep
                        ? 'bg-purple-500 shadow-lg shadow-purple-500/30 animate-pulse'
                        : `${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`
                  } transition-all duration-300`}>
                    {index < transactionStep ? (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    ) : index === transactionStep ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-spin" />
                    ) : (
                      <span className="text-xs sm:text-sm font-medium text-white">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <span className={
                    `text-sm sm:text-base transition-colors duration-300 ${
                      index < transactionStep
                        ? 'text-green-400 font-medium'
                        : index === transactionStep
                          ? 'text-purple-400 font-semibold'
                          : `${darkMode ? 'text-gray-400' : 'text-gray-600'}`
                    }`
                  }>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Completion State */}
            {transactionStep >= steps.length && (
              <div className="text-center animate-pulse">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-green-500/30">
                  <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <p className="text-green-400 font-medium text-base sm:text-lg">
                  Transaction Complete!
                </p>
                <p className={`text-xs sm:text-sm mt-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Redirecting to success page...
                </p>
              </div>
            )}

            {/* Progress Bar */}
            <div className="mt-4 sm:mt-6">
              <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${((transactionStep + 1) / steps.length) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>Processing...</span>
                <span>{Math.round(((transactionStep + 1) / steps.length) * 100)}%</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Basket Found</h3>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            } mb-4`}>
              Redirecting to explore page...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmTransaction;