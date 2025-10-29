import React, { useState, useEffect } from 'react';
import {
  Check,
  Loader2
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

  useEffect(() => {
    if (location.state && location.state.basketPayload) {
      setBasketDetails(location.state.basketPayload);
      console.log("Received basket payload:", location.state.basketPayload);
    } else {
      console.warn("No basket payload found in navigation state. Redirecting to explore.");
      navigate('/explore');
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
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} flex items-center justify-center`}>
      <div className={`max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 shadow-xl`}>
        <h2 className="text-2xl font-bold text-center mb-6">Confirm Transaction</h2>

        {selectedBasket ? (
          <>
            <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
              <div className="text-center mb-4">
              
                <div className="mb-2">
                                        <img
                                            src={selectedBasket.basketData.image || 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png'}
                                            alt="Basket"
                                            className="w-12 h-12 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png';
                                            }}
                                        />
                                    </div>
                <h3 className="text-lg font-semibold">{selectedBasket.basketData.basketName}</h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Investment Amount:</span>
                  <span className="font-medium">${selectedBasket.investmentAmount} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>bTokens to receive:</span>
                  <span className="font-medium">
                    {(parseFloat(selectedBasket.investmentAmount || '0') * 0.95).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Basket NFT:</span>
                  <span className="font-medium">1 NFT</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    index < transactionStep
                      ? 'bg-green-500'
                      : index === transactionStep
                        ? 'bg-purple-500'
                        : `${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`
                  }`}>
                    {index < transactionStep ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : index === transactionStep ? (
                      <Loader2 className="w-3 h-3 text-white animate-spin" />
                    ) : (
                      <span className="text-xs text-white">{index + 1}</span>
                    )}
                  </div>
                  <span className={
                    index < transactionStep
                      ? 'text-green-400'
                      : index === transactionStep
                        ? 'text-purple-400'
                        : `${darkMode ? 'text-gray-400' : 'text-gray-600'}`
                  }>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {transactionStep >= steps.length && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <p className="text-green-400 font-medium">Transaction Complete!</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-sm text-gray-400">Loading basket details...</p>
        )}
      </div>
    </div>
  );
};

export default ConfirmTransaction;
