import base58 from "bs58";
import * as solanaWeb3 from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import CryptoJS from "crypto-js";
import { OKXDexClient } from '@okx-dex/okx-dex-sdk';



// Use a reliable RPC endpoint
export const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=45f9798b-9483-4c10-87b6-47dcb952a345", {
    confirmTransactionInitialTimeout: 5000,
    wsEndpoint: "wss://mainnet.helius-rpc.com/?api-key=45f9798b-9483-4c10-87b6-47dcb952a345",
});

// Constants
export const NATIVE_SOL = "11111111111111111111111111111111";
export const WRAPPED_SOL = "So11111111111111111111111111111111111111112";
export const USDC_SOL = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const ETH = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const SOLANA_CHAIN_ID = "501";
const COMPUTE_UNITS = 300000;
const MAX_RETRIES = 3;

// Environment variables
const apiKey = import.meta.env.VITE_OKX_API_KEY;
const secretKey = import.meta.env.VITE_OKX_API_SECRET;
const apiPassphrase = import.meta.env.VITE_OKX_API_PASSPHRASE;
const projectId = import.meta.env.VITE_OKX_API_PROJECT_ID;
export const userPrivateKey = import.meta.env.VITE_OKX_SOLANA_PRIVATE_KEY;
export const userAddress = import.meta.env.VITE_OKX_SOLANA_ADDRESS;
export const userEthAddress = import.meta.env.VITE_OKX_ETH_ADDRESS;
 const altAPIKey = import.meta.env.VITE_COINGECKO_API_KEY

// Base headers function with validation
function getHeaders(timestamp, method, requestPath, queryString = "", body = "") {
    if (!apiKey || !secretKey || !apiPassphrase || !projectId) {
        throw new Error("Missing required environment variables");
    }

    const stringToSign = timestamp + method + requestPath + queryString + (body ? JSON.stringify(body) : "");
    return {
        "Content-Type": "application/json",
        "OK-ACCESS-KEY": apiKey,
        "OK-ACCESS-SIGN": CryptoJS.enc.Base64.stringify(
            CryptoJS.HmacSHA256(stringToSign, secretKey)
        ),
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": apiPassphrase,
        "OK-ACCESS-PROJECT": projectId,
    };
}

// Helper function for amount formatting
function formatAmount(amount) {
    if (!amount) throw new Error("Amount is required");
    const numStr = amount.toString().replace(/[^\d.]/g, "");
    const wholePart = numStr.split(".")[0];
    return wholePart.replace(/^0+(?=\d)/, "") || "0";
}

// Regular DEX quote function
export async function getQuote(quoteParams) {
    if (!quoteParams.amount || !quoteParams.fromTokenAddress || !quoteParams.toTokenAddress) {
        throw new Error("Missing required parameters for quote");
    }

    const timestamp = new Date().toISOString();
    const params = {
        chainId: SOLANA_CHAIN_ID,
        amount: quoteParams.amount,
        fromTokenAddress: quoteParams.fromTokenAddress,
        toTokenAddress: quoteParams.toTokenAddress,
        slippage: quoteParams.slippage || "0.05",
    };

    const requestPath = "/api/v5/dex/aggregator/quote";
    const queryString = new URLSearchParams(params).toString();
    const headers = getHeaders(timestamp, "GET", requestPath, "?" + queryString);

    try {
        const response = await fetch(
            `https://www.okx.com${requestPath}?${queryString}`,
            { method: "GET", headers }
        );

        if (!response.ok) {
            throw new Error(`Failed to get quote: ${await response.text()}`);
        }

        const data = await response.json();
        if (!data.data || data.data.length === 0) {
            throw new Error("No quote data received");
        }

        return data;
    } catch (error) {
        console.error("Quote request failed:", error);
        throw error;
    }
}


export async function getBatchToken() {


    const timestamp = new Date().toISOString();
    const params = {
        chainIndex: SOLANA_CHAIN_ID
    };

    const requestPath = "/api/v5/dex/aggregator/all-tokens";
    const queryString = new URLSearchParams(params).toString();
    const headers = getHeaders(timestamp, "GET", requestPath, "?" + queryString);

    try {
        const response = await fetch(
            `https://www.okx.com${requestPath}?${queryString}`,
            { method: "GET", headers }
        );

        if (!response.ok) {
            throw new Error(`Failed to get quote: ${await response.text()}`);
        }

        const data = await response.json();
        if (!data.data || data.data.length === 0) {
            throw new Error("No quote data received");
        }
        console.log("Batch token quote data:", data);
        return data;
    } catch (error) {
        console.error("Quote request failed:", error);
        throw error;
    }
}

export async function getBatchTokenPrice(contracts) {
    const timestamp = new Date().toISOString();
    const requestPath = "/api/v5/dex/market/price-info";
    const method = "POST";

    contracts = [{ chainIndex: "66", tokenContractAddress: "0x382bb369d343125bfb2117af9c149795c6c65c50" }]
    const requestBody = JSON.stringify(contracts);

    const headers = getHeaders(timestamp, method, requestPath, requestBody);

    try {
        const response = await fetch(`https://www.okx.com${requestPath}`, {
            method,
            headers,
            body: requestBody,
        });

        if (!response.ok) {
            throw new Error(`Failed to get quote: ${await response.text()}`);
        }

        const data = await response.json();
        if (!data.data || data.data.length === 0) {
            throw new Error("No quote data received");
        }

        console.log("Batch token quote data price:", data);
        return data;
    } catch (error) {
        console.error("Quote request failed:", error);
        throw error;
    }
}

// Liquidity check function
export async function getLiquidity(params = {}) {
    const timestamp = new Date().toISOString();
    const liquidityParams = {
        chainId: params.chainId || SOLANA_CHAIN_ID,
    };
    console.log("Liquidity params:", liquidityParams);
    const requestPath = "/api/v5/dex/aggregator/get-liquidity";
    const queryString = new URLSearchParams(liquidityParams).toString();
    const headers = getHeaders(timestamp, "GET", requestPath, "?" + queryString);

    try {
        const response = await fetch(
            `https://www.okx.com${requestPath}?${queryString}`,
            { method: "GET", headers }
        );

        if (!response.ok) {
            throw new Error(`Failed to get liquidity: ${await response.text()}`);
        }

        const data = await response.json();
        if (!data.data) {
            throw new Error("Invalid liquidity response format");
        }

        return data;
    } catch (error) {
        console.error("Liquidity request failed:", error);
        throw error;
    }
}

// Helper function for DEX information
export function getDexInfoById(liquiditySources, dexId) {
    if (!Array.isArray(liquiditySources) || !dexId) {
        console.warn("Invalid parameters for DEX info lookup");
        return null;
    }

    return liquiditySources.find((source) => source.id === dexId.toString()) || null;
}

// Enhanced transaction execution with retries and compute budget
export async function executeTransaction(txData) {
    if (!userPrivateKey) {
        throw new Error("Private key not found");
    }

    let retryCount = 0;
    while (retryCount < MAX_RETRIES) {
        try {
            console.log("Received txData:", txData);

            if (!txData || (!txData.tx && !txData.data)) {
                throw new Error("Invalid txData structure");
            }

            const transactionData = txData.tx?.data || txData.data;
            if (!transactionData || typeof transactionData !== 'string') {
                throw new Error("Invalid transaction data");
            }

            const recentBlockHash = await connection.getLatestBlockhash();
            console.log("Got blockhash:", recentBlockHash.blockhash);

            const decodedTransaction = base58.decode(transactionData);
            let tx;

            try {
                tx = solanaWeb3.VersionedTransaction.deserialize(decodedTransaction);
                console.log("Successfully created versioned transaction");
                tx.message.recentBlockhash = recentBlockHash.blockhash;
            } catch (e) {
                console.log("Versioned transaction failed, trying legacy:", e);
                tx = solanaWeb3.Transaction.from(decodedTransaction);
                console.log("Successfully created legacy transaction");
                tx.recentBlockhash = recentBlockHash.blockhash;
            }

            // Add compute budget instruction
            const computeBudgetIx = solanaWeb3.ComputeBudgetProgram.setComputeUnitLimit({
                units: COMPUTE_UNITS
            });

            const feePayer = solanaWeb3.Keypair.fromSecretKey(
                base58.decode(userPrivateKey)
            );

            if (tx instanceof solanaWeb3.VersionedTransaction) {
                tx.sign([feePayer]);
            } else {
                tx.partialSign(feePayer);
            }

            const txId = await connection.sendRawTransaction(tx.serialize(), {
                skipPreflight: false,
                maxRetries: 5
            });

            // Wait for confirmation with better error handling
            const confirmation = await connection.confirmTransaction({
                signature: txId,
                blockhash: recentBlockHash.blockhash,
                lastValidBlockHeight: recentBlockHash.lastValidBlockHeight
            }, 'confirmed');

            if (confirmation?.value?.err) {
                throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
            }

            return {
                success: true,
                transactionId: txId,
                explorerUrl: `https://solscan.io/tx/${txId}`,
                confirmation
            };
        } catch (error) {
            console.error(`Attempt ${retryCount + 1} failed:`, error);
            retryCount++;

            if (retryCount === MAX_RETRIES) {
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        }
    }
}

// Cross-chain swap functions
export async function getCrossChainQuote(params) {
    const quoteParams = {
        fromChainId: params.fromChainId,
        toChainId: params.toChainId,
        fromTokenAddress: params.fromTokenAddress,
        toTokenAddress: params.toTokenAddress,
        amount: formatAmount(params.amount),
        slippage: params.slippage,
        priceImpactProtectionPercentage: params.priceImpactProtectionPercentage,
    };

    const timestamp = new Date().toISOString();
    const requestPath = "/api/v5/dex/cross-chain/quote";
    const queryString = new URLSearchParams(quoteParams).toString();
    const headers = getHeaders(timestamp, "GET", requestPath, "?" + queryString);

    const response = await fetch(
        `https://www.okx.com${requestPath}?${queryString}`,
        { method: "GET", headers }
    );

    const data = await response.json();
    if (data.code !== "0") {
        throw new Error(`Quote error: ${data.msg} (Code: ${data.code})`);
    }

    return data;
}

// Cross-chain swap functions
export async function getBuildTx(params) {
    const quoteParams = {
        fromChainId: params.fromChainId,
        toChainId: params.toChainId,
        fromTokenAddress: params.fromTokenAddress,
        toTokenAddress: params.toTokenAddress,
        amount: formatAmount(params.amount),
        slippage: params.slippage,
        userWalletAddress: userAddress,
        priceImpactProtectionPercentage: params.priceImpactProtectionPercentage,
        receiveAddress: params.recieveAddress,
    };

    const timestamp = new Date().toISOString();
    const requestPath = "/api/v5/dex/cross-chain/build-tx";
    const queryString = new URLSearchParams(quoteParams).toString();
    const headers = getHeaders(timestamp, "GET", requestPath, "?" + queryString);

    const response = await fetch(
        `https://www.okx.com${requestPath}?${queryString}`,
        { method: "GET", headers }
    );

    const data = await response.json();
    if (data.code !== "0") {
        throw new Error(`Quote error: ${data.msg} (Code: ${data.code})`);
    }

    return data;
}

// Cross-chain swap execution
export async function sendCrossChainSwap(amount, userAddress) {
    if (!apiKey || !secretKey || !apiPassphrase || !projectId) {
        throw new Error("Missing API credentials");
    }

    const quoteParams = {
        fromChainId: "501",
        toChainId: "137",
        fromTokenAddress: NATIVE_SOL,
        toTokenAddress: ETH,
        amount: formatAmount(amount),
        slippage: "0.5",
        userWalletAddress: userAddress,
        priceImpactProtectionPercentage: "0.9",
        sort: "1",
        recieveAddress: userEthAddress,
    };

    const data = await getBuildTx(quoteParams);
    return await executeTransaction(data.data[0]);
}

// Enhanced single chain swap with better validation
export async function getSingleChainSwap(params) {
    if (!apiKey || !secretKey || !apiPassphrase || !projectId) {
        throw new Error("Missing API credentials");
    }

    const timestamp = new Date().toISOString();
    const requestPath = "/api/v5/dex/aggregator/swap";
    const queryString = "?" + new URLSearchParams(params).toString();
    const headers = getHeaders(timestamp, "GET", requestPath, queryString);

    console.log("Requesting swap quote with params:", params);

    const response = await fetch(
        `https://www.okx.com${requestPath}${queryString}`,
        { method: "GET", headers }
    );

    const data = await response.json();
    if (data.code !== "0") {
        throw new Error(`API Error: ${data.msg}`);
    }

    if (!data.data?.[0]?.routerResult?.toTokenAmount) {
        throw new Error("Invalid or missing output amount");
    }

    return data.data[0];
}

export async function executeSingleChainTransaction(txData) {
    return await executeTransaction(txData);
}



export async function getAvailableTokens() {
  try {
    // Get token metadata (names, symbols, logos, addresses)
    const tokenMetadata = await getBatchToken();

    // Extract contract addresses for price lookup
    const contractAddresses = tokenMetadata.data.map(token => token.tokenContractAddress);

    // Step 2: Handle APIs that allow max 100 contract addresses per call
    const chunkArray = (arr, size) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    const addressChunks = chunkArray(contractAddresses, 100);
    let allPriceData = [];
    let useCoinGecko = false;

    // Try to get prices from primary API
    try {
      for (const chunk of addressChunks) {
        const response = await getBatchTokenPrice(chunk.join(','));
        allPriceData = allPriceData.concat(response.data);
      }
    } catch (error) {
      console.warn(`Primary batch price lookup failed, switching to CoinGecko:`, error);
      useCoinGecko = true;
    }

    // Create a map for quick price lookup by contract address
    const priceMap = new Map();

    if (useCoinGecko) {
      // Use CoinGecko for all tokens
      console.log(`Using CoinGecko for all ${tokenMetadata.data.length} tokens`);
      
      try {
        const symbols = tokenMetadata.data.map(token => token.tokenSymbol.toLowerCase()).join(',');
        
        if (symbols) {
          const coinGeckoResponse = await getCoinGeckoTokenPrices("btc");
          
          // Process CoinGecko response and add to priceMap
          coinGeckoResponse.forEach(tokenData => {
            // Find the corresponding token by symbol to get the contract address
            const matchingToken = tokenMetadata.data.find(token => 
              token.tokenSymbol.toLowerCase() === tokenData.symbol.toLowerCase()
            );
            
            if (matchingToken) {
              priceMap.set(matchingToken.tokenContractAddress, {
                price: tokenData.current_price || 0,
                priceChange24H: tokenData.price_change_percentage_24h || null,
                volume24H: tokenData.total_volume || null,
                marketCap: tokenData.market_cap || null
              });
            }
          });
          
          console.log(`Successfully retrieved ${coinGeckoResponse.length} prices from CoinGecko`);
        }
      } catch (coinGeckoError) {
        console.error("CoinGecko fallback also failed:", coinGeckoError);
        // Continue with no price data, prices will be set to 0
      }
    } else {
      // Use primary API data
      allPriceData.forEach(priceData => {
        priceMap.set(priceData.tokenContractAddress, {
          price: parseFloat(priceData.price),
          priceChange24H: priceData.priceChange24H,
          volume24H: priceData.volume24H,
          marketCap: priceData.marketCap
        });
      });
    }

    // Merge the data into the desired format
    const availableTokens = tokenMetadata.data.map(token => {
      const priceInfo = priceMap.get(token.tokenContractAddress);

      return {
        ticker: token.tokenSymbol,
        name: token.tokenName,
        price: priceInfo ? priceInfo.price : 0,
        isNative: token.tokenContractAddress === NATIVE_SOL,
        tokenAddress: token.tokenContractAddress,
        tokenLogoUrl: token.tokenLogoUrl,
        // Optional: include additional price data
        priceChange24H: priceInfo ? priceInfo.priceChange24H : null,
        volume24H: priceInfo ? priceInfo.volume24H : null,
        marketCap: priceInfo ? priceInfo.marketCap : null
      };
    });

    console.log("Merged available tokens:", availableTokens);
    return availableTokens;

  } catch (error) {
    console.error("Failed to get available tokens:", error);
    throw error;
  }
}

// CoinGecko API function based on your provided endpoint
async function getCoinGeckoTokenPrices(symbol) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=solana-ecosystem&precision=full`,
    {
      headers: {
        'accept': 'application/json',
        'x-cg-api-key': altAPIKey
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }
  
  return response.json();
}
