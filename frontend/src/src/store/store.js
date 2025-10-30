import { configureStore, createSlice } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // uses localStorage by default

// Helper function to format wallet address
const formatAddress = (address) => {
    if (!address || address.length < 10) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const globalSlice = createSlice({
    name: 'global',
    initialState: {
        isDarkMode: false,
        walletConnected: false,
        walletAddress: '',
        formattedAddress: '',
        curatorData: null,
        userData: null,
        feederData: null,
    },
    reducers: {
        setDarkMode(state, action) {
            state.isDarkMode = action.payload;
        },
        
        toggleDarkMode(state) {
            state.isDarkMode = !state.isDarkMode;
        },
        
        setWalletConnected(state, action) {
            state.walletConnected = action.payload;
        },
        
        setWalletAddress(state, action) {
            const address = action.payload;
            if (address && typeof address === 'string') {
                state.walletAddress = address;
                state.formattedAddress = formatAddress(address);
                state.walletConnected = true;
            }
        },
        setWalletName: (state, action) => {
  state.walletName = action.payload;
},
        
        setFormattedAddress(state, action) {
            state.formattedAddress = action.payload;
        },
        
        setCuratorData(state, action) {
            state.curatorData = action.payload;
        },
        
        clearCuratorData(state) {
            state.curatorData = null;
        },
        
        setUserData(state, action) {
            state.userData = action.payload;
        },
        
        clearUserData(state) {
            state.userData = null;
        },
        
        setFeederData(state, action) {
            state.feederData = action.payload;
        },
        
        clearFeederData(state) {
            state.feederData = null;
        },
        
        resetWallet(state) {
            state.walletConnected = false;
            state.walletAddress = '';
            state.formattedAddress = '';
            state.curatorData = null;
            state.userData = null;
            state.feederData = null;
        },
    },
});

export const {
    setDarkMode,
    toggleDarkMode,
    setWalletConnected,
    setWalletAddress,
    setWalletName,
    setFormattedAddress,
    setCuratorData,
    clearCuratorData,
    setUserData,
    clearUserData,
    setFeederData,
    clearFeederData,
    resetWallet,
} = globalSlice.actions;

// Selectors
export const selectIsDarkMode = (state) => state.global.isDarkMode;
export const selectWalletConnected = (state) => state.global.walletConnected;
export const selectWalletAddress = (state) => state.global.walletAddress;
export const selectFormattedAddress = (state) => state.global.formattedAddress;
export const selectCuratorData = (state) => state.global.curatorData;
export const selectUserData = (state) => state.global.userData;
export const selectFeederData = (state) => state.global.feederData;

// Persist configuration
const persistConfig = {
    key: 'root',
    storage,
    // Whitelist only the slices/keys you want to persist
    whitelist: ['global'],
};

const persistedReducer = persistReducer(persistConfig, globalSlice.reducer);

export const store = configureStore({
    reducer: {
        global: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore redux-persist actions
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(store);