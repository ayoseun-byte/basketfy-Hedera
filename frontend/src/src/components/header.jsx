import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Wallet, ChevronDown, Copy, ExternalLink, Bell } from 'lucide-react';
import { useWallet } from '../hook/wallet';
import { useNavigate } from 'react-router-dom';
import { toggleDarkMode, selectCuratorData, selectUserData, selectFeederData } from '../store/store';
import { useSelector, useDispatch } from 'react-redux';

const Header = ({
  route,
  routeText = "Back to Home",
  setShowWalletModal,
  title = "Basket Explorer",
  basketDetails = null,
}) => {
  const navigate = useNavigate();
  const { disconnectWallet } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  
  // Get all state from Redux
  const isDarkMode = useSelector((state) => state.global.isDarkMode);
  const formattedAddress = useSelector((state) => state.global.formattedAddress);
  const walletConnected = useSelector((state) => state.global.walletConnected);
  const curatorData = useSelector(selectCuratorData);
  const userData = useSelector(selectUserData);
  const feederData = useSelector(selectFeederData);
  
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Determine which section to show (priority order)
  // Default to user section if nothing is set
  const showCuratorSection = curatorData !== null;
  const showFeederSection = !showCuratorSection && feederData !== null;
  const showUserSection = !showCuratorSection && !showFeederSection; // Default fallback

  return (
    <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-40`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left Section - Back Button or Basket Details */}
          <div className="flex items-center gap-4">
            {basketDetails ? (
              <div className="flex items-center gap-3">
                <img
                  src={basketDetails.image || 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png'}
                  alt={basketDetails.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-xl font-bold">{basketDetails.name}</h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Created by {basketDetails.creator}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate(route || '/')}
                className="flex items-center gap-2 hover:text-purple-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {routeText}
              </button>
            )}
          </div>

          {/* Center Title - Only show if no basket details */}
          {!basketDetails && (
            <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">{title}</h1>
          )}

          {/* Right Section - Action Buttons and User Info */}
          <div className="flex items-center gap-4">
            
            {/* Action Buttons Container */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => dispatch(toggleDarkMode())}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              {/* Notifications */}
              <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                <Bell className="w-5 h-5" />
              </button>

              {/* Settings/Farmer Icon */}
              <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                <img src="../src/assets/farmer.svg" alt="farmer" className="w-4 h-4" />
              </button>
            </div>

            {/* Divider */}
            <div className={`w-px h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

            {/* CURATOR SECTION */}
            {showCuratorSection && (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={curatorData?.profile?.avatar || 'https://via.placeholder.com/40'}
                    alt="Curator Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="hidden sm:block">
                    <h1 className="text-sm font-bold">{curatorData?.profile?.name || 'Curator'}</h1>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Curator
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* USER SECTION */}
            {showUserSection && (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => walletConnected ? setIsDropdownOpen(!isDropdownOpen) : navigate('/login')}
                    className={`flex items-center gap-2 px-2 py-2 text-xs rounded-lg ${
                      walletConnected
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white transition-all`}
                  >
                    <Wallet className="w-4 h-4" />
                    {walletConnected ? formattedAddress : 'Login'}
                    {walletConnected && <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* User Dropdown Menu */}
                  {walletConnected && isDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-64 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border rounded-lg shadow-xl z-20`}>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Wallet Address
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(formattedAddress)}
                              className={`p-1 rounded hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
                              title="Copy address"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => window.open(`https://solscan.io/address/${formattedAddress}`, '_blank')}
                              className={`p-1 rounded hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
                              title="View on Solscan"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                          <code className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} break-all`}>
                            {formattedAddress}
                          </code>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setShowWalletModal(true);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-purple-600 hover:text-white transition-colors"
                          >
                            Profile
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/curator-dashboard');
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-green-600 hover:text-white transition-colors text-green-700"
                          >
                            My Baskets
                          </button>
                          
                          <button
                            onClick={() => {
                              disconnectWallet();
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-red-600 hover:text-white transition-colors text-red-500"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* FEEDER SECTION */}
            {showFeederSection && (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => walletConnected ? setIsDropdownOpen(!isDropdownOpen) : setShowWalletModal(true)}
                    className={`flex items-center gap-2 px-2 py-2 text-xs rounded-lg ${
                      walletConnected
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white transition-all`}
                  >
                    <Wallet className="w-4 h-4" />
                    {walletConnected ? formattedAddress : 'Connect Wallet'}
                    {walletConnected && <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Feeder Dropdown Menu */}
                  {walletConnected && isDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-64 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border rounded-lg shadow-xl z-20`}>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Wallet Address
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(formattedAddress)}
                              className={`p-1 rounded hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
                              title="Copy address"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => window.open(`https://solscan.io/address/${formattedAddress}`, '_blank')}
                              className={`p-1 rounded hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
                              title="View on Solscan"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                          <code className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} break-all`}>
                            {formattedAddress}
                          </code>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setShowWalletModal(true);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-purple-600 hover:text-white transition-colors"
                          >
                            Switch Wallet
                          </button>
                          
                          <button
                            onClick={() => {
                              disconnectWallet();
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-red-600 hover:text-white transition-colors text-red-500"
                          >
                            Disconnect
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/curator-dashboard');
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-green-600 hover:text-white transition-colors text-green-500"
                          >
                            My Baskets
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

           
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;