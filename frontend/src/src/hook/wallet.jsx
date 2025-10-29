// hooks/useWallet.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, SYSVAR_RENT_PUBKEY, SystemProgram, Keypair, } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';
import idl from '../components/contract/basketfy.json';
import * as anchor from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, } from '@solana/spl-token';
import logger from '../uutils/logger';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import {
  setWalletConnected,
  setFormattedAddress,
  resetWallet,
} from '../store/store';
// Wallet Context
const WalletContext = createContext({});

// Constants
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Wallet Provider Component
export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletType, setWalletType] = useState('');
  const [connection, setConnection] = useState(null);
  const [anchorProvider, setAnchorProvider] = useState(null);
  const [program, setProgram] = useState(null);
  const dispatch = useDispatch();
  // Initialize Solana connection
  useEffect(() => {
    initializeSolanaConnection();
    checkExistingConnection();
  }, []);

  // Initialize program when anchor provider is set
  useEffect(() => {
    if (anchorProvider) {
      initializeProgram();
    }
  }, [anchorProvider]);

  const initializeSolanaConnection = () => {
    try {
      // You can switch between devnet, testnet, mainnet-beta
      const rpcUrl = import.meta.env.VITE_SOLANA_DEVNET_RPC_URL

      const conn = new Connection(rpcUrl, 'confirmed');
      setConnection(conn);

      logger(`Solana connection initialized: ${rpcUrl}`);
    } catch (error) {
      logger('Failed to initialize Solana connection:', error);
    }
  };

  const initializeProgram = () => {
    try {
      if (!anchorProvider) return;

      const programInstance = new anchor.Program(idl, anchorProvider);
      setProgram(programInstance);

      logger(`Program ID: ${programInstance.programId.toString()}`);
    } catch (error) {
      logger(`Failed to initialize program: ${error}`);
    }
  };

  const checkExistingConnection = async () => {
    const savedAddress = sessionStorage.getItem('walletAddress');
    const savedWalletType = sessionStorage.getItem('walletType');

    if (savedAddress && savedWalletType) {
      try {
        await connectWallet(savedWalletType, true);
      } catch (error) {
        logger(`Failed to restore wallet connection: ${error}`);
        sessionStorage.removeItem('walletAddress');
        sessionStorage.removeItem('walletType');
      }
    }
  };

  const connectWallet = async (type, skipPrompt = false) => {
    setConnecting(true);

    try {
      let walletAdapter;
      let response;

      switch (type) {
        case 'phantom':
          if (!window.solana?.isPhantom) {
            return { success: false, error: 'Phantom Wallet not found. Please install Phantom.' };
          }
          walletAdapter = window.solana;
          response = skipPrompt
            ? await walletAdapter.connect({ onlyIfTrusted: true })
            : await walletAdapter.connect();
          break;

        case 'metamask':
          if (!window.ethereum?.isMetaMask) {
            return { success: false, error: 'MetaMask Wallet not found. Please install MetaMask.' };
          }
          walletAdapter = window.ethereum;

          if (skipPrompt) {
            // Check if already connected
            const accounts = await walletAdapter.request({ method: 'eth_accounts' });
            if (accounts.length === 0) {
              return { success: false, error: 'MetaMask not connected. Please connect manually first.' };
            }
            response = { publicKey: { toString: () => accounts[0] } };
          } else {
            const accounts = await walletAdapter.request({ method: 'eth_requestAccounts' });
            response = { publicKey: { toString: () => accounts[0] } };
          }
          break;

        default:
          return { success: false, error: "unsupported wallet type" };
      }

      if (response?.publicKey) {
        const address = response.publicKey.toString();

        setWallet(walletAdapter);
        setWalletAddress(address);
        setConnected(true);
        setWalletType(type);

        // Store in session
        sessionStorage.setItem('walletAddress', address);
        sessionStorage.setItem('walletType', type);

        // Setup Anchor provider for program interactions
        setupAnchorProvider(walletAdapter);

        // Setup event listeners
        setupWalletEventListeners(walletAdapter);

        return { success: true, address };
      }
    } catch (error) {
      logger(`Wallet connection error: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setConnecting(false);
    }
  };

  const setupAnchorProvider = (walletAdapter) => {
    try {
      if (!connection) {
        logger('Connection not available for Anchor provider setup');
        return;
      }

      const provider = new AnchorProvider(connection, walletAdapter, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      });
      anchor.setProvider(provider);
      setAnchorProvider(provider);

      logger(`Anchor provider initialized with wallet: ${walletAdapter.publicKey?.toString()}`);
    } catch (error) {
      logger(`Failed to setup Anchor provider: ${error.message}`);
    }
  };

  const setupWalletEventListeners = (walletAdapter) => {
    walletAdapter.on('connect', (publicKey) => {
      logger(`Wallet connected: ${publicKey.toString()}`);
    });

    walletAdapter.on('disconnect', () => {
      logger('Wallet disconnected');
      handleDisconnect();
    });

    walletAdapter.on('accountChanged', (publicKey) => {
      if (publicKey) {
        const newAddress = publicKey.toString();
        setWalletAddress(newAddress);
        sessionStorage.setItem('walletAddress', newAddress);

        logger(`Account changed: ${newAddress}`);
      } else {
        handleDisconnect();
      }
    });
  };

  const disconnectWallet = async () => {
    try {
      if (wallet) {
        await wallet.disconnect();
      }
      handleDisconnect();
      dispatch(setWalletConnected(false));
      dispatch(setWalletAddress("null"));
      dispatch(setFormattedAddress(formatAddress("null")));
    } catch (error) {
      logger(`Disconnect error: ${error.message}`);
      handleDisconnect(); // Force disconnect even if error
      dispatch(setWalletConnected(false));
      dispatch(setWalletAddress("null"));
      dispatch(setFormattedAddress(formatAddress("null")));
    }
  };

  const handleDisconnect = () => {
    setWallet(null);
    setWalletAddress('');
    setConnected(false);
    setWalletType('');
    setAnchorProvider(null);
    setProgram(null);
    sessionStorage.removeItem('walletAddress');
    sessionStorage.removeItem('walletType');
    if (wallet?.removeAllListeners) {
      wallet.removeAllListeners('connect');
      wallet.removeAllListeners('disconnect');
      wallet.removeAllListeners('accountChanged');
    }
  };

  const signTransaction = async (transaction) => {
    if (!wallet || !connected) {
      toast.error('Wallet not connected');
      return;
    }
    if (typeof wallet.signTransaction !== 'function') {
      toast.error("Current wallet does not support signing transactions");
      return;
    }

    try {
      const signedTransaction = await wallet.signTransaction(transaction);
      return signedTransaction;
    } catch (error) {
      toast.error('Transaction signing failed');
      logger(`Transaction signing error: ${error.message}`);
      return;
    }
  };

  const signAllTransactions = async (transactions) => {
    if (!wallet || !connected) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      const signedTransactions = await wallet.signAllTransactions(transactions);
      return signedTransactions;
    } catch (error) {
      toast.error('Failed to sign multiple transactions');
      return;
    }
  };

  const signMessage = async (message) => {
    if (!wallet || !connected) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      const signature = await wallet.signMessage(new TextEncoder().encode(message));
      return signature;
    } catch (error) {
      toast.error('Message signing failed');
      logger(`Message signing error: ${error.message}`);
      return;
    }
  };

  const sendTransaction = async (transaction, options = {}) => {
    if (!wallet || !connected || !connection) {
      toast.error('Wallet or connection not available');
      return;
    }

    try {
      const signedTx = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), options);

      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      logger(`Transaction confirmed: ${JSON.stringify(confirmation)}`);
      return { signature, confirmation };
    } catch (error) {
      toast.error('Transaction failed');
      logger(`Transaction send error: ${error.message}`);
      return;
    }
  };

  const getBalance = async () => {
    if (!connection || !walletAddress) {
      return 0;
    }

    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await connection.getBalance(publicKey);
      return balance / 1000000000; // Convert lamports to SOL
    } catch (error) {
      toast.error('Failed to fetch balance');
      logger(`Balance fetch error: ${error.message}`);
      return 0;
    }
  };

  // Helper functions for basket creation
  const findFactoryPDA = (programId) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("factory")],
      programId
    );
  };

  const findConfigPDA = (factory, basketCount) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("config"),
        factory.toBuffer(),
        basketCount.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
  };

  const findMintAuthorityPDA = (config) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("mint-authority"), config.toBuffer()],
      program.programId
    );
  };

  const findMetadataPDA = (mint) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer()
      ],
      METADATA_PROGRAM_ID
    );
  };

  // Main basket creation function
  const createBasket = async (name, symbol, uri, decimals, tokenMints, weights) => {
    if (!wallet || !connected || !program || !anchorProvider) {
      toast.error('Wallet not connected or program not initialized');
      return;
    }

    try {
      // Validate inputs
      if (tokenMints.length === 0 || weights.length === 0) {
        toast.error('Token mints and weights are required');
        return;
      }

      if (tokenMints.length !== weights.length) {
        toast.error('Token mints and weights must have the same length');
        return;
      }

      const payer = new PublicKey(walletAddress);
      const mintKeypair = Keypair.generate();

      // Find PDAs
      const [factoryPDA] = findFactoryPDA(program.programId);
      const factoryAccount = await program.account.factoryState.fetch(factoryPDA);
      const basketCount = factoryAccount.basketCount;

      const [configPDA] = findConfigPDA(factoryPDA, basketCount);
      const [mintAuthorityPDA] = findMintAuthorityPDA(configPDA);
      const [metadataPDA] = findMetadataPDA(mintKeypair.publicKey);

      console.log('Creating basket with:', {
        name,
        symbol,
        uri,
        decimals,
        tokenMints: tokenMints,
        weights: weights,
        factoryPDA: factoryPDA.toString(),
        configPDA: configPDA.toString(),
        mintKeypair: mintKeypair.publicKey.toString()
      });

      // Convert token mint strings to PublicKey objects
      const tokenMintPublicKeys = tokenMints.map(mint => {
        try {
          return new PublicKey(mint);
        } catch (error) {
          throw new Error(`Invalid token mint address: ${mint}`);
        }
      });

      // Convert weights to anchor.BN (BigNumber) objects
      const weightsBN = weights.map(weight => new anchor.BN(weight * 100));

      // Create the transaction
      const tx = await program.methods
        .createBasket(
          name,
          symbol,
          uri,
          decimals,
          tokenMintPublicKeys,
          weightsBN
        )
        .accounts({
          payer: payer,
          config: configPDA,
          mintAuthority: mintAuthorityPDA,
          metadataAccount: metadataPDA,
          mintAccount: mintKeypair.publicKey,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();

      return {
        success: true,
        transactionSignature: tx,
        configPDA: configPDA.toString(),
        mintAddress: mintKeypair.publicKey.toString(),
        basketDetails: {
          name,
          symbol,
          uri,
          decimals,
          tokenMints,
          weights,
          basketReferenceId: basketCount.toString(),
        }
      };
    } catch (error) {
      toast.error('Failed to create basket');
      logger(`Basket creation error: ${error.message}`);
      return {
        success: false,
        transactionSignature: "",
        configPDA: "",
        mintAddress: "",
        error: error.message || 'Failed to create basket'
      };
    }
  };

  const buyBasket = async (amount, basketMint, basketId) => {
    if (!wallet || !connected || !program || !anchorProvider) {
      toast.error('Wallet not connected or program not initialized');
      return;
    }

    try {
      const payer = new PublicKey(walletAddress);
      basketMint = new PublicKey(basketMint);

      // Get the token account of the sender
      const userTokenAccount = await getAssociatedTokenAddress(
        basketMint,
        payer
      );

      const accountInfo = await program.provider.connection.getAccountInfo(userTokenAccount);
      if (!accountInfo) {
        // ATA doesn't exist
        toast.error('Associated token account not found. Creating ATA...', {
          icon: '⚠️',
          duration: 5000,
          style: {
            border: '1px solid #F87171',
            padding: '16px',
            color: '#B91C1C',
            backgroundColor: '#FEF2F2',
          },
          position: 'top-right',
        });

        const createATAIx = createAssociatedTokenAccountInstruction(
          payer,          // payer
          userTokenAccount, // ATA to be created
          payer,          // owner of the ATA
          basketMint      // mint of the token
        );

        const tx = new anchor.web3.Transaction().add(createATAIx);
        await program.provider.sendAndConfirm(tx, []);

        toast.success('Associated token account created successfully');
        logger(`Associated token account created: ${userTokenAccount.toString()}`);
      } else {
        const tokenBalance = await program.provider.connection.getTokenAccountBalance(userTokenAccount);
        logger(`User token account found: ${userTokenAccount.toString()}, Balance: ${tokenBalance.value.uiAmount}`);
      }

      // Find PDAs
      const [factoryPDA] = findFactoryPDA(program.programId);
      const [configPDA] = findConfigPDA(factoryPDA, new anchor.BN(basketId));
      const [mintAuthorityPDA] = findMintAuthorityPDA(configPDA);

      logger(`Creating basket mint with: ${JSON.stringify({
        userTokenAccount: userTokenAccount.toString(),
        factoryPDA: factoryPDA.toString(),
        configPDA: configPDA.toString(),
        basketMint: basketMint.toString()
      })}`);

      // Create the transaction
      const tx = await program.methods
        .mintBasketToken(
          new anchor.BN(amount * LAMPORTS_PER_SOL) // Convert amount to lamports
        )
        .accounts({
          config: configPDA,
          mintAuthority: mintAuthorityPDA,
          mint: basketMint,
          recipientTokenAccount: userTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      logger("Basket token mint created successfully:", tx);

      return {
        success: true,
        transactionSignature: tx,
        configPDA: configPDA.toString(),
        mintAddress: basketMint.toString(),
        message: `Successfully bought ${amount} of the basket`
      };
    } catch (error) {
      logger(`Error buying basket: ${error}`);
      return {
        success: false,
        transactionSignature: "",
        configPDA: "",
        mintAddress: "",
        error: error.message || 'Failed to buy basket'
      };
    }
  };

  // Get factory information
  const getFactoryInfo = async () => {
    if (!program) {
      logger('Program not initialized');
      return;
    }

    try {
      const [factoryPDA] = findFactoryPDA(program.programId);
      const factoryAccount = await program.account.factoryState.fetch(factoryPDA);

      return {
        factoryPDA: factoryPDA.toString(),
        basketCount: factoryAccount.basketCount.toString(),
        authority: factoryAccount.authority.toString()
      };
    } catch (error) {
      logger(`Error fetching factory info: ${error.message}`);
      return;
    }
  };

  // Get basket configuration
  const getBasketConfig = async (configPDA) => {
    if (!program) {
      logger('Program not initialized');
      return;
    }

    try {
      const configPublicKey = new PublicKey(configPDA);
      const configAccount = await program.account.basketConfig.fetch(configPublicKey);

      return {
        name: configAccount.name,
        symbol: configAccount.symbol,
        decimals: configAccount.decimals,
        mintAccount: configAccount.mintAccount.toString(),
        authority: configAccount.authority.toString(),
        tokenMints: configAccount.tokenMints.map(mint => mint.toString()),
        weights: configAccount.weights.map(weight => weight.toString()),
        totalSupply: configAccount.totalSupply.toString()
      };
    } catch (error) {
      logger(`Error fetching basket config: ${error.message}`);
      return;
    }
  };

  const value = {
    // State
    wallet,
    walletAddress,
    walletType,
    connection,
    anchorProvider,
    program,
    connected,
    connecting,
    walletConnected: connected && wallet && anchorProvider ? true : false,

    // Actions
    connectWallet,
    disconnectWallet,
    signTransaction,
    signAllTransactions,
    signMessage,
    sendTransaction,
    getBalance,
    setAnchorProvider,

    // Basket operations
    createBasket,
    getFactoryInfo,
    getBasketConfig,
    buyBasket,

    // Utilities
    formatAddress: (address) => address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '',
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};