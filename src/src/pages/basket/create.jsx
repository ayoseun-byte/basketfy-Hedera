
import React, { useState, useEffect } from 'react';
import {

  ArrowLeft,
  Loader2
} from 'lucide-react';
import { saveBasket } from '../../api/basketApi';
import { useWallet } from '../../hook/wallet';
import Header from '../../components/header';
import { getAvailableTokens, getBatchToken, getBatchTokenPrice, NATIVE_SOL, SOLANA_CHAIN_ID } from '../../api/dexUtils';
import { useNavigate } from 'react-router-dom';
import { showErrorAlert } from '../../components/alert';
import toast from 'react-hot-toast';
import logger from '../../uutils/logger';


const CreateBasketPage = ({ darkMode, setShowWalletModal }) => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [basketName, setBasketName] = useState('');
  const [basketUri, setBasketUri] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [basketSymbol, setBasketSymbol] = useState('');
  const [basketDescription, setBasketDescription] = useState('');
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [tokenWeights, setTokenWeights] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [tokens, setTokens] = useState([]);

  const {

    walletAddress,
    walletConnected,
    formatAddress,
    getBalance,
    createBasket,
  } = useWallet();
  const availableTokens = [
    { ticker: 'SOL', name: 'Solana', price: 145.23, isNative: true, tokenAddress: "So11111111111111111111111111111111111111112" },
    { ticker: 'RNDR', name: 'Render Token', price: 8.45, isNative: false, tokenAddress: "So11111111111111111111111111111111111111112" },
    { ticker: 'RAY', name: 'Raydium', price: 1.85, isNative: false, tokenAddress: "So11111111111111111111111111111111111111112" },
    { ticker: 'ORCA', name: 'Orca', price: 2.17, isNative: false, tokenAddress: "So11111111111111111111111111111111111111112" },
    { ticker: 'MNGO', name: 'Mango', price: 0.089, isNative: false, tokenAddress: "So11111111111111111111111111111111111111112" },
    { ticker: 'FET', name: 'Fetch.ai', price: 0.82, isNative: false, tokenAddress: "So11111111111111111111111111111111111111112" },
    { ticker: 'OCEAN', name: 'Ocean Protocol', price: 0.54, isNative: false, tokenAddress: "So11111111111111111111111111111111111111112" }
  ];

  const totalWeight = Object.values(tokenWeights).reduce((sum, weight) => sum + (parseFloat(weight) || 0), 0);
useEffect(() => {
  let timeoutId;
  let isCancelled = false;

  // Set up the timeout to fallback to availableTokens after 400ms
  timeoutId = setTimeout(() => {
    if (!isCancelled) {
      logger("Token fetch timeout reached, using fallback availableTokens");
      // Filter out tokens with zero price from fallback as well
      const filteredAvailableTokens = availableTokens.filter(token => token.price > 0);
      setTokens(filteredAvailableTokens);
    }
  }, 400);

  // Fetch available tokens
  getAvailableTokens()
    .then(mergedTokens => {
      // Clear timeout since we got a response
      clearTimeout(timeoutId);

      // Always set tokens from API response, even after timeout
      if (!isCancelled) {
        // Filter out tokens with zero price
        const tokensWithPrice = mergedTokens.filter(token => parseFloat(token.price) > 0);
        setTokens(tokensWithPrice);
        logger("Successfully fetched tokens from API");
      }
    })
    .catch(error => {
      // Clear timeout
      clearTimeout(timeoutId);

      if (!isCancelled) {
        logger("Error fetching available tokens:", error);
        // Fallback to availableTokens on error, excluding zero price tokens
        const filteredAvailableTokens = availableTokens.filter(token => token.price > 0);
        setTokens(filteredAvailableTokens);
      }
    });

  // Cleanup function
  return () => {
    isCancelled = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}, []);



  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header Component */}
      <Header
        darkMode={darkMode}


        setShowWalletModal={setShowWalletModal}
        route={`/`}
        walletConnected={walletConnected}
        title="Create Basket"
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4">Basket Details</h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Basket Name
                  </label>
                  <input
                    type="text"
                    value={basketName}
                    onChange={(e) => setBasketName(e.target.value)}
                    placeholder="Basket Name"
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Basket Symbol
                  </label>
                  <input
                    type="text"
                    value={basketSymbol}
                    onChange={(e) => setBasketSymbol(e.target.value)}
                    placeholder="Basket Token Symbol"
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Basket Uri
                  </label>
                  <input
                    type="text"
                    value={basketUri}
                    onChange={(e) => setBasketUri(e.target.value)}
                    placeholder="Basket Uri"
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Creator
                  </label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="Basket Creator"
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={basketDescription}
                    onChange={(e) => setBasketDescription(e.target.value)}
                    placeholder="A curated collection of top DeFi tokens...such description"
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4">Token Selection</h2>
              <div className="space-y-3">
                {tokens.map((token) => (
                  <div key={token.ticker} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTokens.includes(token.ticker)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTokens([...selectedTokens, token.ticker]);
                            setTokenWeights({ ...tokenWeights, [token.ticker]: '20' });
                          } else {
                            setSelectedTokens(selectedTokens.filter(t => t !== token.ticker));
                            const newWeights = { ...tokenWeights };
                            delete newWeights[token.ticker];
                            setTokenWeights(newWeights);
                          }
                        }}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div>
                        <p className="font-medium">{token.ticker}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{token.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>${token.price}</span>
                      {selectedTokens.includes(token.ticker) && (
                        <input
                          type="number"
                          value={tokenWeights[token.ticker] || ''}
                          onChange={(e) => setTokenWeights({ ...tokenWeights, [token.ticker]: e.target.value })}
                          placeholder="20"
                          className={`w-16 px-2 py-1 text-sm rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between">
                  <span>Total Weight:</span>
                  <span className={`font-medium ${totalWeight === 100 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalWeight}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🧺</div>
                <h3 className="text-lg font-semibold">{basketName || 'Untitled Basket'}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {basketDescription || 'No description provided'}
                </p>
              </div>

              {selectedTokens.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Token Allocation</h4>
                  {selectedTokens.map((ticker) => {
                    const token = availableTokens.find(t => t.ticker === ticker);
                    const weight = parseFloat(tokenWeights[ticker] || '0');
                    return (
                      <div key={ticker} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            {ticker.slice(0, 2)}
                          </div>
                          <span className="text-sm">{ticker}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{weight}%</span>
                          <div className={`w-12 h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} relative`}>
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              style={{ width: `${Math.min(weight, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

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
                if (basketName && basketDescription && selectedTokens.length > 0 && totalWeight === 100) {
                  setIsCreating(true);

                  const userId = formatAddress(walletAddress);
                  const sessionId = "current_session_id";

                  const basketPayload = {
                    userId,
                    category: 'DeFi',
                    name: basketName,
                    description: basketDescription,
                    creator: creatorName,
                    symbol: basketName.slice(0, 6).toUpperCase(),
                    uri: basketUri,
                    image: basketUri,
                    basketReferenceId: '',
                    address: "",
                    tokens: selectedTokens.map((ticker) => {
                      const token = availableTokens.find(t => t.ticker === ticker);
                      return {
                        name: token.name,
                        ticker: token.ticker,
                        isNative: token.isNative,
                        tokenAddress: token.tokenAddress || '',
                        price: parseFloat(token.price.toString() || '0'),
                        weight: parseFloat(tokenWeights[ticker] || '0'),
                      };
                    }),
                  };



                  try {
                    // Fixed: Use basketPayload.tokens instead of selectedTokens.tokens
                    const tokenMints = basketPayload.tokens.map(token => token.tokenAddress);
                    const tokenWeightsArray = basketPayload.tokens.map(token => parseFloat(token.weight));


                    const result = await createBasket(
                      basketName,
                      basketSymbol,
                      basketUri,
                      6,
                      tokenMints,
                      tokenWeightsArray
                    )

                    console.log('Basket created successfully:', result["transactionSignature"]);
                    basketPayload.address = result["mintAddress"];
                    basketPayload.basketReferenceId = result["basketDetails"]["basketReferenceId"];
                    if (result["transactionSignature"] !== null) {
                      const data = await saveBasket(basketPayload);
                      console.log('Basket created:', data);
                      // Use navigate to go to the success page, passing the basketPayload as state
                      navigate('/create-success', { state: { basketPayload: basketPayload } });
                    }

                  } catch (err) {
                    // Handle error during basket creation
                    //show alerter component error
                    showErrorAlert('Error creating basket', err.message);
                    console.error('Error creating basket:', err.message);

                  } finally {
                    setIsCreating(false);
                  }
                }
              }}

              disabled={!basketName || !basketDescription || selectedTokens.length === 0 || totalWeight !== 100 || isCreating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Basket...
                </>
              ) : (
                'Create Basket'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBasketPage;

