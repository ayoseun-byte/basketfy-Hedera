import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Zap,
  Shield,
  Globe,
  DollarSign,
  BarChart3,
  Target,
  Loader2      // Used in ConfirmTransaction and CreateBasketPage
} from 'lucide-react';
import './App.css';
import LandingPage from './src/pages/landing_page';
import WalletModal from './src/modal/wallet_modal';
import BasketDetailPage from './src/pages/basket/details';
import ConfirmTransaction from './src/pages/transactions/confirm_tx';
import PortfolioPage from './src/pages/buyers/overview';
import CreateBasketPage from './src/pages/basket/create';
import SuccessPage from './src/components/success';
import { getBaskets } from './src/api/basketApi';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import CreateSuccessPage from './src/pages/basket/create_success';
import HowItWorks from './src/components/how_it_works';
import logger from './src/uutils/logger';
import UserBasketPage from './src/pages/buyers/basket_detail';
import CuratorDashboard from './src/pages/curator/dashboard';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode } from '@/src/store/store';
import LoginPage from './src/pages/buyers/login';
import RegisterPage from './src/pages/buyers/register';
import ProfilePage from './src/pages/buyers/profile';
import FeederDashboard from './src/pages/Feeders';
import BasketsPage from './src/pages/baskets';
import TermsOfService from './src/pages/termsOfService';
import PrivacyPolicy from './src/pages/privacyPolicy';
import { features, stats } from './src/constants/resources';
import { createAppKit } from '@reown/appkit/react'

import { WagmiProvider } from 'wagmi'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { projectId, metadata, networks, wagmiAdapter, solanaWeb3JsAdapter } from '../src/src/constants/config'



const queryClient = new QueryClient()

const generalConfig = {
  projectId,
  metadata,
  networks,
  themeMode: 'light',
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  },
  themeVariables: {
    '--w3m-accent': '#000000',
  }
}

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  ...generalConfig,
})



const App = () => {

  const [baskets, setBaskets] = useState([]);
  const [selectedBasket, setSelectedBasket] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);


  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.global.isDarkMode);
  const filteredBaskets = baskets.filter(basket => {
    const matchesSearch = basket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      basket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || basket.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });




  return (


    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
    
       
        <Router> {/* Wrap your entire app with Router */}
          <>

            <Routes> {/* Define your routes here */}
              <Route path="/" element={
                <LandingPage
                  darkMode={isDarkMode}
                  setDarkMode={() => dispatch(toggleDarkMode())}
                  baskets={baskets} // Consider using `baskets` state after fetching
                  stats={stats}
                  features={features}
                  setShowWalletModal={setShowWalletModal}
                  showWalletModal={showWalletModal}
                />
              } />
              <Route path="/baskets" element={
                <BasketsPage
                  darkMode={isDarkMode}
                  setBaskets={setBaskets}
                  setLoading={setLoading}
                  loading={loading}
                  setShowWalletModal={setShowWalletModal}
                  showWalletModal={showWalletModal}
                  setSearchTerm={setSearchTerm}
                  searchTerm={searchTerm}
                  setSelectedCategory={setSelectedCategory}
                  setSelectedBasket={setSelectedBasket}
                  selectedCategory={selectedCategory}
                  filteredBaskets={filteredBaskets}

                />
              } />
              {/* Use URL parameters for detail pages, e.g., /baskets/:id or /baskets/:symbol */}
              <Route path="/basket/:id" element={
                <BasketDetailPage
                  darkMode={isDarkMode}
                  selectedBasket={selectedBasket} // Ensure this is set when navigating to detail
                  setShowWalletModal={setShowWalletModal}

                />
              } />
              <Route path="/confirm" element={
                <ConfirmTransaction
                  darkMode={isDarkMode}
                />
              } />
              <Route path="/buy-success" element={
                <SuccessPage
                  darkMode={isDarkMode}
                />
              } />
              {/* Route for CreateBasketPage */}
              <Route path="/create" element={
                <CreateBasketPage
                  darkMode={isDarkMode}
                  setShowWalletModal={setShowWalletModal}
                />
              } />
              {/* Route for CreateSuccessPage, will receive state via navigate */}
              <Route path="/create-success" element={
                <CreateSuccessPage
                  darkMode={isDarkMode}
                />
              } />
              <Route path="/my-baskets" element={
                <PortfolioPage
                  darkMode={isDarkMode}
                  filteredBaskets={baskets}

                />
              } />
              <Route path="/user-basket-portfolio" element={
                <UserBasketPage
                  darkMode={isDarkMode}

                />
              } />

              <Route path="/curator-dashboard" element={
                <CuratorDashboard
                  darkMode={isDarkMode}

                />
              } />
              <Route path="/how-it-works" element={
                <HowItWorks
                  darkMode={isDarkMode}
                />
              } />
              <Route path="/login" element={
                <LoginPage
                  darkMode={isDarkMode}
                />
              } />
              <Route path="/register" element={
                <RegisterPage
                  darkMode={isDarkMode}
                />
              } />

              <Route path="/profile" element={
                <ProfilePage
                  darkMode={isDarkMode}
                />
              } />
              <Route path="/feeder" element={
                <FeederDashboard
                  darkMode={isDarkMode}
                />
              } />

              <Route path="/terms-of-service" element={
                <TermsOfService
                  darkMode={isDarkMode}
                />
              } />

              <Route path="/privacy-policy" element={
                <PrivacyPolicy
                  darkMode={isDarkMode}
                />
              } />
            </Routes>

            {/* WalletModal should remain outside of Routes if it's a global modal */}
            <WalletModal
              showWalletModal={showWalletModal}
              darkMode={isDarkMode}
              setShowWalletModal={setShowWalletModal}
            />
          </>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
