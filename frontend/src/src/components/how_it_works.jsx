import React from "react";
import {
  Box,
  ShoppingCart,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Layers,
  Image,
  FileText,
  Search,
  DollarSign,
  CheckCircle2,
  Cpu,
  TrendingUp,
  Users,
  Crown,
  Target,
  BarChart3,
  UserPlus,
  Bell,
  Coins,
  PieChart,
  ArrowDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const createBasketSteps = [
  {
    title: "Select Tokens",
    emoji: "🔗",
    description: "Hand-pick tokens that reflect your chosen crypto theme — from DeFi to NFTs to Layer 1 blockchains.",
    icon: <Box className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" aria-hidden="true" />,
  },
  {
    title: "Name & Brand",
    emoji: "🎨",
    description: "Give your basket a memorable name, add a description and visuals to build identity and trust.",
    icon: <Image className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" aria-hidden="true" />,
  },
  {
    title: "Mint Basket",
    emoji: "🪙",
    description: "Mint a unique bToken representing fractional ownership and a Basket NFT as on-chain identity.",
    icon: <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" aria-hidden="true" />,
  },
];

const buyBasketSteps = [
  {
    title: "Browse Marketplace",
    emoji: "🔍",
    description: "Explore curated thematic baskets created by experts, DAOs, and communities.",
    icon: <Search className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" aria-hidden="true" />,
  },
  {
    title: "Buy bTokens",
    emoji: "💸",
    description: "Purchase bTokens to get proportional shares of all underlying tokens in the basket.",
    icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" aria-hidden="true" />,
  },
  {
    title: "Receive Basket NFT",
    emoji: "🎟️",
    description: "Get a Basket NFT as proof of ownership and to unlock governance and transparency features.",
    icon: <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" aria-hidden="true" />,
  },
];

const rebalanceSteps = [
  {
    title: "AI Monitoring",
    emoji: "🤖",
    description: "AI continuously analyzes market trends, token performance, and risk factors.",
    icon: <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" aria-hidden="true" />,
  },
  {
    title: "Dynamic Rebalancing",
    emoji: "⚖️",
    description: "The AI adjusts token weights to optimize returns and minimize risk automatically.",
    icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" aria-hidden="true" />,
  },
  {
    title: "Smart Growth",
    emoji: "🌱",
    description: "Enjoy a hands-free, evolving portfolio aligned with your thematic investment goals.",
    icon: <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" aria-hidden="true" />,
  },
];

// New Farmer Flow Steps
const becomeFarmerSteps = [
  {
    title: "Setup Profile",
    emoji: "👤",
    description: "Create your farmer profile with expertise areas, bio, and fee structure (management & performance fees).",
    icon: <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" aria-hidden="true" />,
  },
  {
    title: "Create Strategy",
    emoji: "🎯",
    description: "Define your thematic basket with token allocation, deploy via factory contract, and publish metadata.",
    icon: <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" aria-hidden="true" />,
  },
  {
    title: "Build Following",
    emoji: "📈",
    description: "Market your basket, gain subscribers, and earn recurring income from management and performance fees.",
    icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" aria-hidden="true" />,
  },
];

const followFarmerSteps = [
  {
    title: "Discover Farmers",
    emoji: "🔍",
    description: "Browse farmers by performance track record, expertise, themes, and subscriber count in the marketplace.",
    icon: <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" aria-hidden="true" />,
  },
  {
    title: "Subscribe & Invest",
    emoji: "💰",
    description: "Deposit USDC/ETH to subscribe to a farmer's basket and receive cTokens representing your ownership share.",
    icon: <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" aria-hidden="true" />,
  },
  {
    title: "Auto-Sync Portfolio",
    emoji: "🔄",
    description: "When your farmer rebalances, your portfolio automatically mirrors their changes. Get notifications and track performance.",
    icon: <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" aria-hidden="true" />,
  },
];

const farmerManagementSteps = [
  {
    title: "Rebalance Strategy",
    emoji: "⚖️",
    description: "Update your basket allocation (e.g., swap 10% ETH → 10% AVAX) and subscribers automatically mirror changes.",
    icon: <PieChart className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" aria-hidden="true" />,
  },
  {
    title: "Earn Fees",
    emoji: "💸",
    description: "Earn management fees (recurring % AUM) and performance fees (% of profits) from your subscriber base.",
    icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" aria-hidden="true" />,
  },
  {
    title: "Track Performance",
    emoji: "📊",
    description: "Monitor earnings, subscriber growth, basket performance, and build reputation through consistent results.",
    icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" aria-hidden="true" />,
  },
];

const Section = ({ darkMode, title, steps, bgColor = "gray", emoji }) => {
  const getBgColors = () => {
    switch (bgColor) {
      case "green":
        return darkMode ? "bg-green-900/20 border-green-800/30" : "bg-green-50 border-green-200";
      case "blue":
        return darkMode ? "bg-blue-900/20 border-blue-800/30" : "bg-blue-50 border-blue-200";
      case "orange":
        return darkMode ? "bg-orange-900/20 border-orange-800/30" : "bg-orange-50 border-orange-200";
      default:
        return darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200";
    }
  };

  const getTextColor = () => {
    switch (bgColor) {
      case "green":
        return darkMode ? "text-green-400" : "text-green-600";
      case "blue":
        return darkMode ? "text-blue-400" : "text-blue-600";
      case "orange":
        return darkMode ? "text-orange-400" : "text-orange-600";
      default:
        return darkMode ? "text-purple-400" : "text-purple-600";
    }
  };

  return (
    <section
      className={`w-full max-w-7xl mx-auto mb-12 sm:mb-16 lg:mb-20 p-4 sm:p-6 lg:p-8 rounded-xl border-2 ${getBgColors()} transition-all duration-300`}
      aria-label={typeof title === 'string' ? title : 'Process section'}
    >
      <h2
        className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {typeof title === 'string' ? title : title}
        {emoji && <span className="ml-2" role="img" aria-label="">{emoji}</span>}
      </h2>

      {/* Mobile: Vertical Stack */}
      <div className="lg:hidden space-y-6">
        {steps.map(({ title, description, icon, emoji }, index) => (
          <div key={index} className="relative">
            <div
              className={`p-4 sm:p-6 rounded-lg shadow-sm border ${
                darkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
              } transition-all duration-300 hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getTextColor()} bg-opacity-10 flex-shrink-0`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-lg sm:text-xl font-semibold mb-2 ${
                      darkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {title} {emoji && <span role="img" aria-label="">{emoji}</span>}
                  </h3>
                  <p className={`text-sm sm:text-base ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {description}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Arrow between steps (mobile) */}
            {index < steps.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className={`w-5 h-5 ${getTextColor()}`} aria-hidden="true" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: Horizontal Grid */}
      <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {steps.map(({ title, description, icon, emoji }, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-sm border ${
              darkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
            } transition-all duration-300 hover:shadow-md hover:scale-105`}
          >
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${getTextColor()} bg-opacity-10 mx-auto`}>
                {icon}
              </div>
              <h3
                className={`text-xl font-semibold mb-3 ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {title} {emoji && <span role="img" aria-label="">{emoji}</span>}
              </h3>
              <p className={`text-base ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {description}
              </p>
            </div>
            
            {/* Arrow between steps (desktop) */}
            {index < steps.length - 1 && (
              <div className="hidden xl:flex justify-center items-center absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className={`w-6 h-6 ${getTextColor()}`} aria-hidden="true" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const HowItWorks = ({ darkMode }) => {
  const navigate = useNavigate();

  return (
    <main
      className={`min-h-screen py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 ${
        darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            How Basketfy Works
          </h1>
          
          <p className={`text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto px-4 ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            Whether you want to create your own baskets, follow expert farmers, or become a farmer yourself - 
            Basketfy offers multiple paths to diversified crypto investing.
          </p>
        </header>

        {/* Original Flows */}
        <Section
          darkMode={darkMode}
          title="Create Your Thematic Basket"
          emoji="🧺"
          steps={createBasketSteps}
        />

        <Section
          darkMode={darkMode}
          title="Buy & Own the Basket"
          emoji="🛒"
          steps={buyBasketSteps}
        />

        <Section
          darkMode={darkMode}
          title="Rebalance with AI Power"
          emoji="🧠"
          steps={rebalanceSteps}
        />

        {/* Social Investing Section Header */}
        <div className="max-w-7xl mx-auto mb-12 sm:mb-16 text-center">
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            🆕 Social Investing Features
          </h2>
          <p className={`text-base sm:text-lg lg:text-xl ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            Follow expert farmers or become one yourself to earn from your crypto expertise
          </p>
        </div>

        {/* New Farmer Flows */}
        <Section
          darkMode={darkMode}
          title="Become a Farmer"
          emoji="🧑‍🌾"
          steps={becomeFarmerSteps}
          bgColor="green"
        />

        <Section
          darkMode={darkMode}
          title="Follow Expert Farmers"
          emoji="👥"
          steps={followFarmerSteps}
          bgColor="blue"
        />

        <Section
          darkMode={darkMode}
          title="Manage Your Farm"
          emoji="🎯"
          steps={farmerManagementSteps}
          bgColor="orange"
        />

        {/* Back Button */}
        <div className="max-w-7xl mx-auto flex justify-center mt-12">
          <button
            onClick={() => navigate("/")}
            className={`inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold transition-all duration-300 min-h-[44px] text-base sm:text-lg
              ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
              }
            `}
            aria-label="Go back to home page"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
};

export default HowItWorks;