import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Wallet, ChevronDown, Copy, ExternalLink, Bell, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toggleDarkMode, selectCuratorData, selectUserData, selectFeederData } from '../store/store';
import { useSelector, useDispatch } from 'react-redux';
import { useWallet } from '../hook/wallet';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  
  // Get all state from Redux
  const isDarkMode = useSelector((state) => state.global.isDarkMode);
  const formattedAddress = useSelector((state) => state.global.formattedAddress);
  const walletConnected = useSelector((state) => state.global.walletConnected);
  const curatorData = useSelector(selectCuratorData);
  const userData = useSelector(selectUserData);
  const feederData = useSelector(selectFeederData);
  
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Optional: Add toast notification here
  };

  // Determine which section to show
  const showCuratorSection = curatorData !== null;
  const showFeederSection = !showCuratorSection && feederData !== null;
  const showUserSection = !showCuratorSection && !showFeederSection;

  return (
    <header className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg sticky top-0 z-40 border-b ${
      isDarkMode ? 'border-gray-800' : 'border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Mobile Layout - Stacked */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          
          {/* Top Row - Logo/Basket Details + Mobile Menu */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            {/* Left - Back Button or Basket Details */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {basketDetails ? (
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <img
                    src={basketDetails.image || 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png'}
                    alt={basketDetails.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl font-bold truncate">{basketDetails.name}</h1>
                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                      by {basketDetails.creator}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate(route || '/')}
                  className={`flex items-center gap-1 sm:gap-2 hover:text-purple-400 transition-colors text-sm sm:text-base p-1 rounded-lg ${
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden xs:inline truncate">{routeText}</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`sm:hidden p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } transition-colors flex-shrink-0 ml-2`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Center Title - Responsive positioning */}
          {!basketDetails && (
            <h1 className="text-xl sm:text-2xl font-bold text-center sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 order-first sm:order-none px-4 sm:px-0 truncate max-w-[200px] sm:max-w-none">
              {title}
            </h1>
          )}

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-3 lg:gap-4 flex-shrink-0">
            <ActionButtons 
              isDarkMode={isDarkMode} 
              dispatch={dispatch}
              isMobile={false}
            />
            
            {/* Divider */}
            <div className={`w-px h-6 lg:h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

            {/* Wallet Connection Section */}
            <WalletConnectionSection 
              showCuratorSection={showCuratorSection}
              showFeederSection={showFeederSection}
              showUserSection={showUserSection}
              curatorData={curatorData}
              walletConnected={walletConnected}
              formattedAddress={formattedAddress}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              setShowWalletModal={setShowWalletModal}
              disconnectWallet={disconnectWallet}
              navigate={navigate}
              isDarkMode={isDarkMode}
              dropdownRef={dropdownRef}
              copyToClipboard={copyToClipboard}
              isMobile={false}
            />
          </div>

          {/* Mobile Menu - Dropdown */}
          {isMobileMenuOpen && (
            <div 
              ref={mobileMenuRef}
              className={`sm:hidden mt-3 pt-3 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              } w-full`}
            >
              <div className="flex flex-col gap-4">
                {/* Mobile Action Buttons */}
                <ActionButtons 
                  isDarkMode={isDarkMode} 
                  dispatch={dispatch}
                  isMobile={true}
                />

                {/* Mobile Wallet Section */}
                <WalletConnectionSection 
                  showCuratorSection={showCuratorSection}
                  showFeederSection={showFeederSection}
                  showUserSection={showUserSection}
                  curatorData={curatorData}
                  walletConnected={walletConnected}
                  formattedAddress={formattedAddress}
                  isDropdownOpen={isDropdownOpen}
                  setIsDropdownOpen={setIsDropdownOpen}
                  setShowWalletModal={setShowWalletModal}
                  disconnectWallet={disconnectWallet}
                  navigate={navigate}
                  isDarkMode={isDarkMode}
                  dropdownRef={dropdownRef}
                  copyToClipboard={copyToClipboard}
                  isMobile={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Extracted Action Buttons Component
const ActionButtons = ({ isDarkMode, dispatch, isMobile }) => (
  <div className={`flex items-center gap-2 ${isMobile ? 'justify-between' : ''}`}>
    <button
      onClick={() => dispatch(toggleDarkMode())}
      className={`p-3 rounded-lg ${
        isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
      } transition-colors flex items-center gap-2 ${isMobile ? 'flex-1 justify-center' : ''}`}
      aria-label="Toggle theme"
    >
      <span className="text-sm">{isDarkMode ? '☀️' : '🌙'}</span>
      {isMobile && <span className="text-sm">{isDarkMode ? 'Light' : 'Dark'}</span>}
    </button>

    <button className={`p-3 rounded-lg ${
      isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
    } transition-colors flex items-center gap-2 ${isMobile ? 'flex-1 justify-center' : ''}`}>
      <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
      {isMobile && <span className="text-sm">Notifications</span>}
    </button>

    <button className={`p-3 rounded-lg ${
      isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
    } transition-colors flex items-center gap-2 ${isMobile ? 'flex-1 justify-center' : ''}`}>
      {/* Use a proper icon or SVG */}
      <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-purple-400 to-pink-400 rounded"></div>
      {isMobile && <span className="text-sm">Farm</span>}
    </button>
  </div>
);

// Extracted Wallet Connection Component for reusability
const WalletConnectionSection = ({
  showCuratorSection,
  showFeederSection,
  showUserSection,
  curatorData,
  walletConnected,
  formattedAddress,
  isDropdownOpen,
  setIsDropdownOpen,
  setShowWalletModal,
  disconnectWallet,
  navigate,
  isDarkMode,
  dropdownRef,
  copyToClipboard,
  isMobile = false
}) => {
  return (
    <div className={isMobile ? "w-full" : ""}>
      {/* CURATOR SECTION */}
      {showCuratorSection && (
        <div className={`flex items-center gap-3 ${isMobile ? 'justify-center py-2 border-b border-gray-200 dark:border-gray-700 pb-4' : ''}`}>
          <img
            src={curatorData?.profile?.avatar || 'https://via.placeholder.com/40'}
            alt="Curator Profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className={isMobile ? "text-center min-w-0 flex-1" : "hidden sm:block min-w-0"}>
            <h1 className="text-sm font-bold truncate">{curatorData?.profile?.name || 'Curator'}</h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
              Curator
            </p>
          </div>
        </div>
      )}

      {/* USER/FEEDER WALLET SECTION */}
      {(showUserSection || showFeederSection) && (
        <div className={`relative ${isMobile ? 'w-full mt-4' : ''}`} ref={dropdownRef}>
          <button
            onClick={() => walletConnected ? setIsDropdownOpen(!isDropdownOpen) : 
              (showUserSection ? navigate('/login') : setShowWalletModal(true))}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-lg w-full ${
              walletConnected
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white transition-all min-h-[44px]`}
          >
            <Wallet className="w-4 h-4 flex-shrink-0" />
            {walletConnected ? (
              <>
                <span className="truncate max-w-[120px] sm:max-w-[140px]">
                  {formattedAddress}
                </span>
                <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} />
              </>
            ) : (
              showUserSection ? 'Login' : 'Connect Wallet'
            )}
          </button>

          {/* Dropdown Menu */}
          {walletConnected && isDropdownOpen && (
            <div className={`absolute ${
              isMobile ? 'left-0 right-0' : 'right-0'
            } mt-2 w-full sm:w-64 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Wallet Address
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(formattedAddress);
                      }}
                      className={`p-2 rounded-lg ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      } transition-colors`}
                      title="Copy address"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://hashscan.io/testnet/address/${formattedAddress}`, '_blank');
                      }}
                      className={`p-2 rounded-lg ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      } transition-colors`}
                      title="View on Hashscan"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                  <code className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} break-all font-mono`}>
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
                    {showUserSection ? 'Profile' : 'Switch Wallet'}
                  </button>
                  
                  <button
                    onClick={() => {
                      navigate('/curator-dashboard');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-green-600 hover:text-white transition-colors text-green-400"
                  >
                    My Baskets
                  </button>
                  
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-red-600 hover:text-white transition-colors text-red-400"
                  >
                    {showUserSection ? 'Logout' : 'Disconnect'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;