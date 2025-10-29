import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import './index.css'
import App from './App.jsx'
import { WalletProvider } from './src/hook/wallet.jsx'
import { Toaster } from 'react-hot-toast';
import { Buffer } from 'buffer'
import { PersistGate } from 'redux-persist/integration/react';
import { store,persistor} from './src/store/store';
window.Buffer = Buffer
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>

   
        <WalletProvider autoConnect={true}>
          <Toaster position="top-right" />
          <App />
        </WalletProvider>
        </PersistGate>
    </Provider>
  </StrictMode>,
)
