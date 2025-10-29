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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const createBasketSteps = [
  {
    title: (
      <>
        Select Tokens <span role="img" aria-label="tokens">🔗</span>
      </>
    ),
    description:
      "Hand-pick tokens that reflect your chosen crypto theme — from DeFi to NFTs to Layer 1 blockchains.",
    icon: <Box className="w-8 h-8 text-purple-500" aria-hidden="true" />,
  },
  {
    title: (
      <>
        Name & Brand <span role="img" aria-label="branding">🎨</span>
      </>
    ),
    description:
      "Give your basket a memorable name, add a description and visuals to build identity and trust.",
    icon: <Image className="w-8 h-8 text-purple-500" aria-hidden="true" />,
  },
  {
    title: (
      <>
        Mint Basket <span role="img" aria-label="mint">🪙</span>
      </>
    ),
    description:
      "Mint a unique bToken representing fractional ownership and a Basket NFT as on-chain identity.",
    icon: <FileText className="w-8 h-8 text-purple-500" aria-hidden="true" />,
  },
];

const buyBasketSteps = [
  {
    title: (
      <>
        Browse Marketplace <span role="img" aria-label="browse">🔍</span>
      </>
    ),
    description:
      "Explore curated thematic baskets created by experts, DAOs, and communities.",
    icon: <Search className="w-8 h-8 text-purple-500" aria-hidden="true" />,
  },
  {
    title: (
      <>
        Buy bTokens <span role="img" aria-label="buy">💸</span>
      </>
    ),
    description:
      "Purchase bTokens to get proportional shares of all underlying tokens in the basket.",
    icon: <DollarSign className="w-8 h-8 text-purple-500" aria-hidden="true" />,
  },
  {
    title: (
      <>
        Receive Basket NFT <span role="img" aria-label="nft">🎟️</span>
      </>
    ),
    description:
      "Get a Basket NFT as proof of ownership and to unlock governance and transparency features.",
    icon: <CheckCircle2 className="w-8 h-8 text-purple-500" aria-hidden="true" />,
  },
];

const rebalanceSteps = [
  {
    title: (
      <>
        AI Monitoring <span role="img" aria-label="monitoring">🤖</span>
      </>
    ),
    description:
      "AI continuously analyzes market trends, token performance, and risk factors.",
    icon: <Cpu className="w-8 h-8 text-purple-500" aria-hidden="true" />,
  },
  {
    title: (
      <>
        Dynamic Rebalancing <span role="img" aria-label="rebalancing">⚖️</span>
      </>
    ),
    description:
      "The AI adjusts token weights to optimize returns and minimize risk automatically.",
    icon: <TrendingUp className="w-8 h-8 text-purple-500" aria-hidden="true" />,
  },
  {
    title: (
      <>
        Smart Growth <span role="img" aria-label="growth">🌱</span>
      </>
    ),
    description:
      "Enjoy a hands-free, evolving portfolio aligned with your thematic investment goals.",
    icon: <RefreshCw className="w-8 h-8 text-purple-500" aria-hidden="true" />,
  },
];

// New Farmer Flow Steps
const becomeFarmerSteps = [
  {
    title: (
      <>
        Setup Profile <span role="img" aria-label="profile">👤</span>
      </>
    ),
    description:
      "Create your farmer profile with expertise areas, bio, and fee structure (management & performance fees).",
    icon: <Crown className="w-8 h-8 text-green-500" aria-hidden="true" />,
  },
  {
    title: (
      <>
        Create Strategy <span role="img" aria-label="strategy">🎯</span>
      </>
    ),
    description:
      "Define your thematic basket with token allocation, deploy via factory contract, and publish metadata.",
    icon: <Target className="w-8 h-8 text-green-500" aria-hidden="true" />,
  },
  {
    title: (
      <>
        Build Following <span role="img" aria-label="following">📈</span>
      </>
    ),
    description:
      "Market your basket, gain subscribers, and earn recurring income from management and performance fees.",
    icon: <BarChart3 className="w-8 h-8 text-green-500" aria-hidden="true" />,
  },
];

const followFarmerSteps = [
  {
    title: (
      <>
        Discover Farmers <span role="img" aria-label="discover">🔍</span>
      </>
    ),
    description:
      "Browse farmers by performance track record, expertise, themes, and subscriber count in the marketplace.",
    icon: <UserPlus className="w-8 h-8 text-blue-500" aria-hidden="true" />,
  },
  {
    title: (
      <>
        Subscribe & Invest <span role="img" aria-label="subscribe">💰</span>
      </>
    ),
    description:
      "Deposit USDC/ETH to subscribe to a farmer's basket and receive cTokens representing your ownership share.",
    icon: <Coins className="w-8 h-8 text-blue-500" aria-hidden="true" />,
  },
  {
    title: (
      <>
        Auto-Sync Portfolio <span role="img" aria-label="sync">🔄</span>
      </>
    ),
    description:
      "When your farmer rebalances, your portfolio automatically mirrors their changes. Get notifications and track performance.",
    icon: <Bell className="w-8 h-8 text-blue-500" aria-hidden="true" />,
  },
];

const farmerManagementSteps = [
  {
    title: (
      <>
        Rebalance Strategy <span role="img" aria-label="rebalance">⚖️</span>
      </>
    ),
    description:
      "Update your basket allocation (e.g., swap 10% ETH → 10% AVAX) and subscribers automatically mirror changes.",
    icon: <PieChart className="w-8 h-8 text-orange-500" aria-hidden="true" />,
  },
  {
    title: (
      <>
        Earn Fees <span role="img" aria-label="earn">💸</span>
      </>
    ),
    description:
      "Earn management fees (recurring % AUM) and performance fees (% of profits) from your subscriber base.",
    icon: <DollarSign className="w-8 h-8 text-orange-500" aria-hidden="true" />,
  },
  {
    title: (
      <>
        Track Performance <span role="img" aria-label="track">📊</span>
      </>
    ),
    description:
      "Monitor earnings, subscriber growth, basket performance, and build reputation through consistent results.",
    icon: <TrendingUp className="w-8 h-8 text-orange-500" aria-hidden="true" />,
  },
];

const Section = ({ darkMode, title, steps, bgColor = "gray" }) => {
  const getBgColors = () => {
    switch (bgColor) {
      case "green":
        return darkMode ? "bg-green-900/20" : "bg-green-50";
      case "blue":
        return darkMode ? "bg-blue-900/20" : "bg-blue-50";
      case "orange":
        return darkMode ? "bg-orange-900/20" : "bg-orange-50";
      default:
        return darkMode ? "bg-gray-800" : "bg-gray-50";
    }
  };

  return (
    <section
      className={`w-full max-w-7xl mx-auto mb-20 p-6 rounded-xl ${getBgColors()}`}
      aria-label={title}
    >
      <h2
        className={`text-3xl font-bold mb-8 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h2>

      <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
        {steps.map(({ title, description, icon }, i) => (
          <div
            key={i}
            className={`min-w-[280px] p-5 rounded-lg shadow-md flex flex-col items-center text-center ${
              darkMode ? "bg-gray-700" : "bg-white"
            }`}
          >
            <div className="mb-4">{icon}</div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                darkMode ? "text-gray-200" : "text-gray-900"
              }`}
            >
              {title}
            </h3>
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {description}
            </p>
            {/* Show arrow except last card */}
            {i < steps.length - 1 && (
              <ArrowRight
                className={`w-6 h-6 mt-4 text-purple-500 self-center ${
                  darkMode ? "text-purple-400" : "text-purple-600"
                }`}
                aria-hidden="true"
              />
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
      className={`min-h-screen py-12 px-4 ${
        darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-900"
      }`}
    >
      <h1 className="text-5xl font-extrabold text-center mb-8">
        How Basketfy Works
      </h1>
      
      <p className={`text-xl text-center mb-16 max-w-4xl mx-auto ${
        darkMode ? "text-gray-300" : "text-gray-600"
      }`}>
        Whether you want to create your own baskets, follow expert farmers, or become a farmer yourself - 
        Basketfy offers multiple paths to diversified crypto investing.
      </p>

      {/* Original Flows */}
      <Section
        darkMode={darkMode}
        title={
          <>
            Create Your Thematic Basket <span role="img" aria-label="create">🧺</span>
          </>
        }
        steps={createBasketSteps}
      />

      <Section
        darkMode={darkMode}
        title={
          <>
            Buy & Own the Basket <span role="img" aria-label="buy">🛒</span>
          </>
        }
        steps={buyBasketSteps}
      />

      <Section
        darkMode={darkMode}
        title={
          <>
            Rebalance with AI Power <span role="img" aria-label="ai">🧠</span>
          </>
        }
        steps={rebalanceSteps}
      />

      {/* Social Investing Section Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h2 className={`text-4xl font-bold mb-4 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}>
          🆕 Social Investing Features
        </h2>
        <p className={`text-lg ${
          darkMode ? "text-gray-300" : "text-gray-600"
        }`}>
          Follow expert farmers or become one yourself to earn from your crypto expertise
        </p>
      </div>

      {/* New Farmer Flows */}
      <Section
        darkMode={darkMode}
        title={
          <>
            Become a Farmer <span role="img" aria-label="farmer">🧑‍🌾</span>
          </>
        }
        steps={becomeFarmerSteps}
        bgColor="green"
      />

      <Section
        darkMode={darkMode}
        title={
          <>
            Follow Expert Farmers <span role="img" aria-label="follow">👥</span>
          </>
        }
        steps={followFarmerSteps}
        bgColor="blue"
      />

      <Section
        darkMode={darkMode}
        title={
          <>
            Manage Your Farm <span role="img" aria-label="manage">🎯</span>
          </>
        }
        steps={farmerManagementSteps}
        bgColor="orange"
      />

      <div className="max-w-7xl mx-auto flex justify-center">
        <button
          onClick={() => navigate("/")}
          className={`mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors
            ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            }
          `}
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>
    </main>
  );
};

export default HowItWorks;