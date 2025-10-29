import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Wallet, ChevronDown, Copy, ExternalLink, Bell, Menu, X } from 'lucide-react';
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
  };

  // Determine which section to show
  const showCuratorSection = curatorData !== null;
  const showFeederSection = !showCuratorSection && feederData !== null;
  const showUserSection = !showCuratorSection && !showFeederSection;

  return (
    <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-40`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Mobile Layout - Stacked */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          
          {/* Top Row - Logo/Basket Details + Mobile Menu */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            {/* Left - Back Button or Basket Details */}
            <div className="flex items-center gap-3 sm:gap-4">
              {basketDetails ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <img
                    src={basketDetails.image || 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png'}
                    alt={basketDetails.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                  />
                  <div className="max-w-[150px] sm:max-w-none">
                    <h1 className="text-lg sm:text-xl font-bold truncate">{basketDetails.name}</h1>
                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                      by {basketDetails.creator}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate(route || '/')}
                  className="flex items-center gap-1 sm:gap-2 hover:text-purple-400 transition-colors text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">{routeText}</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Center Title - Responsive positioning */}
          {!basketDetails && (
            <h1 className="text-xl sm:text-2xl font-bold text-center sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 order-first sm:order-none">
              {title}
            </h1>
          )}

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-3 lg:gap-4">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 lg:gap-3">
              <button
                onClick={() => dispatch(toggleDarkMode())}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>

              <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                <img src="../src/assets/farmer.svg" alt="farmer" className="w-4 h-4" />
              </button>
            </div>

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
            />
          </div>

          {/* Mobile Menu - Dropdown */}
          {isMobileMenuOpen && (
            <div 
              ref={mobileMenuRef}
              className={`sm:hidden mt-3 pt-3 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Mobile Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => dispatch(toggleDarkMode())}
                    className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
                  >
                    {isDarkMode ? '☀️ Light' : '🌙 Dark'}
                  </button>
                  
                  <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}>
                    <Bell className="w-5 h-5" />
                  </button>
                  
                  <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}>
                    <img src="../src/assets/farmer.svg" alt="farmer" className="w-5 h-5" />
                  </button>
                </div>

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
        <div className={`flex items-center gap-3 ${isMobile ? 'justify-center py-2' : ''}`}>
          <img
            src={curatorData?.profile?.avatar || 'https://via.placeholder.com/40'}
            alt="Curator Profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
          />
          <div className={isMobile ? "text-center" : "hidden sm:block"}>
            <h1 className="text-sm font-bold">{curatorData?.profile?.name || 'Curator'}</h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Curator
            </p>
          </div>
        </div>
      )}

      {/* USER/FEEDER WALLET SECTION */}
      {(showUserSection || showFeederSection) && (
        <div className={`relative ${isMobile ? 'w-full' : ''}`} ref={dropdownRef}>
          <button
            onClick={() => walletConnected ? setIsDropdownOpen(!isDropdownOpen) : 
              (showUserSection ? navigate('/login') : setShowWalletModal(true))}
            className={`flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg w-full sm:w-auto ${
              walletConnected
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white transition-all`}
          >
            <Wallet className="w-4 h-4" />
            {walletConnected ? (
              <>
                <span className="truncate max-w-[80px] sm:max-w-[100px]">
                  {formattedAddress}
                </span>
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
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
                    {showUserSection ? 'Profile' : 'Switch Wallet'}
                  </button>
                  
                  <button
                    onClick={() => {
                      navigate('/curator-dashboard');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-green-600 hover:text-white transition-colors"
                  >
                    My Baskets
                  </button>
                  
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-red-600 hover:text-white transition-colors"
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