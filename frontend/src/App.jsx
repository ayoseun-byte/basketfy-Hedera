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




// Mock data
const mockBaskets = [
  {
    id: 1,
    name: "AI Projects Basket",
    description: "Top AI and machine learning tokens on Solana",
    creator: "AI Research DAO",
    performance7d: 12.5,
    performance30d: 34.2,
    holders: 1247,
    category: "AI",
    tokens: [
      { ticker: "RNDR", name: "Render Token", weight: 30, price: 8.45 },
      { ticker: "FET", name: "Fetch.ai", weight: 25, price: 0.82 },
      { ticker: "OCEAN", name: "Ocean Protocol", weight: 20, price: 0.54 },
      { ticker: "AGIX", name: "SingularityNET", weight: 15, price: 0.31 },
      { ticker: "NMR", name: "Numeraire", weight: 10, price: 17.23 }
    ],
    image: "🤖"
  },
  {
    id: 2,
    name: "Solana DeFi",
    description: "Leading DeFi protocols built on Solana",
    creator: "Solana Foundation",
    performance7d: -3.2,
    performance30d: 18.7,
    holders: 2156,
    category: "DeFi",
    tokens: [
      { ticker: "RAY", name: "Raydium", weight: 25, price: 1.85 },
      { ticker: "SRM", name: "Serum", weight: 20, price: 0.23 },
      { ticker: "ORCA", name: "Orca", weight: 20, price: 2.17 },
      { ticker: "MNGO", name: "Mango", weight: 15, price: 0.089 },
      { ticker: "TULIP", name: "Tulip Protocol", weight: 20, price: 3.42 }
    ],
    image: "🏦"
  },
  {
    id: 3,
    name: "Restaking",
    description: "Next-gen staking and restaking protocols",
    creator: "Staking Alliance",
    performance7d: 8.3,
    performance30d: 22.1,
    holders: 892,
    category: "Staking",
    tokens: [
      { ticker: "EIGEN", name: "EigenLayer", weight: 40, price: 4.23 },
      { ticker: "LDO", name: "Lido DAO", weight: 30, price: 1.87 },
      { ticker: "RPL", name: "Rocket Pool", weight: 20, price: 12.45 },
      { ticker: "SWISE", name: "StakeWise", weight: 10, price: 0.65 }
    ],
    image: "🔒"
  }
];

const features = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: "One-Click Diversification",
    description: "Buy themed exposure with a single transaction instead of managing multiple tokens individually"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Smart Contract Security",
    description: "Audited contracts managing basket creation, minting, and redemption"
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Dynamic Rebalancing",
    description: "Automatic portfolio rebalancing based on market cap and oracle data feeds"
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Multi DEX Integration",
    description: "Seamless swaps and liquidity through Multi DEX API for optimal price execution"
  }
];

export const stats = [
  { label: "Total Value Locked", value: "$0.00M", icon: <DollarSign className="w-5 h-5" /> },
  { label: "Active Baskets", value: "0", icon: <Target className="w-5 h-5" /> },
  { label: "Total Holders", value: "0.02K", icon: <Users className="w-5 h-5" /> },
  { label: "Avg 7D Performance", value: "+5.8%", icon: <TrendingUp className="w-5 h-5" /> }
];

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


  // useEffect(() => {

  //   const fetchBaskets = async () => {
  //     try {
  //       setLoading(true);

  //       // Set a timeout to ensure loading is false after 1400ms
  //       const timeoutId = setTimeout(() => {
  //         setLoading(false);
  //       }, 1400);

  //       const response = await getBaskets("100");

  //       // Clear timeout since we got a response
  //       clearTimeout(timeoutId);

  //       // Check if response exists and has data property
  //       if (response && response.result && Array.isArray(response.result)) {
  //         //console.log("response.data", response.result);
  //         logger(`Fetched Baskets: ${response.result.length}`);
  //         setBaskets(response.result);
  //         stats[1].value = response.result.length;
  //       } else {
  //         // Handle case where response.data is undefined, null, or not an array
  //         console.log("Failed to fetch baskets: Invalid response structure", response);
  //         logger(`Failed to fetch baskets: Invalid response structure`);

  //         // Set empty array instead of undefined
  //         setBaskets([]);
  //         stats[1].value = 0;
  //       }
  //     } catch (error) {
  //       logger(`Error fetching baskets: ${error.message}`);
  //       console.error("Error fetching baskets:", error);

  //       // Set empty array on error
  //       setBaskets([]);
  //       stats[1].value = 0;
  //     } finally {
  //       // Ensure loading is false
  //       setLoading(false);
  //     }
  //   };

  //   fetchBaskets();
  // }, []);


  // if (loading) {
  //   return (
  //     <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
  //       <Loader2 className="w-8 h-8 animate-spin" />
  //     </div>
  //   );
  // }

   const HashpackDebug = () => {
  useEffect(() => {
    console.log('=== HASHPACK DEBUG INFO ===');
    console.log('window.hedera:', window.hedera);
    console.log('window.hashpack:', window.hashpack);
    console.log('All window properties:', Object.keys(window).filter(key => 
      key.includes('hash') || key.includes('hedera') || key.includes('hbar')
    ));
    
    // Check if any object looks like a wallet provider
    const potentialProviders = Object.keys(window).filter(key => {
      const obj = window[key];
      return obj && typeof obj === 'object' && typeof obj.request === 'function';
    });
    console.log('Potential wallet providers:', potentialProviders);
  }, []);

  return null;
};

  return (

   
  
    <Router> {/* Wrap your entire app with Router */}
      <>
      <HashpackDebug />
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
  
  );
};

export default App;
