// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============ BasketCore.sol ============
// Core logic for individual basket operations

contract BasketCore {
    address public factory;
    address public curator;
    
    string public basketName;
    string public basketTheme;
    
    address public bTokenAddress;
    address public nftAddress;
    address[] public underlyingTokens;
    uint256[] public currentWeights; // in basis points
    
    mapping(address => uint256) public userBTokenBalance;
    mapping(address => uint256) public userDepositTimestamp;
    
    uint256 public totalValueLocked;
    uint256 public lastRebalanceTime;
    uint256 public rebalanceFrequency;
    uint256 public protocolFeePercentage;
    
    event Deposit(address indexed user, uint256 amount, uint256 bTokenMinted);
    event Withdrawal(address indexed user, uint256 bTokenBurned, uint256 stablecoinReturned);
    event WeightsUpdated(uint256[] newWeights, uint256 timestamp);
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }
    
    modifier onlyCurator() {
        require(msg.sender == curator, "Only curator");
        _;
    }
    
    constructor(
        address _factory,
        address _curator,
        string memory _name,
        string memory _theme,
        address _bToken,
        address _nft,
        address[] memory _tokens,
        uint256[] memory _weights,
        uint256 _rebalanceFrequency,
        uint256 _feePercentage
    ) {
        factory = _factory;
        curator = _curator;
        basketName = _name;
        basketTheme = _theme;
        bTokenAddress = _bToken;
        nftAddress = _nft;
        underlyingTokens = _tokens;
        currentWeights = _weights;
        rebalanceFrequency = _rebalanceFrequency;
        protocolFeePercentage = _feePercentage;
        lastRebalanceTime = block.timestamp;
    }
    
    // Deposit stablecoin and mint bToken
    function deposit(
        address stablecoin,
        uint256 stablecoinAmount
    ) external returns (uint256 bTokenMinted) {
        require(stablecoinAmount > 0, "Amount > 0");
        
        // Calculate protocol fee
        uint256 fee = (stablecoinAmount * protocolFeePercentage) / 10000;
        bTokenMinted = stablecoinAmount - fee;
        
        // Transfer stablecoin from user
        IERC20(stablecoin).transferFrom(msg.sender, address(this), stablecoinAmount);
        
        // Mint bToken
        _mintBToken(msg.sender, bTokenMinted);
        
        // Update state
        userBTokenBalance[msg.sender] += bTokenMinted;
        userDepositTimestamp[msg.sender] = block.timestamp;
        totalValueLocked += stablecoinAmount;
        
        emit Deposit(msg.sender, stablecoinAmount, bTokenMinted);
        return bTokenMinted;
    }
    
    // Withdraw: burn bToken and return stablecoin
    function withdraw(
        address stablecoin,
        uint256 bTokenAmount
    ) external returns (uint256 stablecoinReturned) {
        require(userBTokenBalance[msg.sender] >= bTokenAmount, "Insufficient balance");
        
        // Calculate return (with fee deduction)
        uint256 fee = (bTokenAmount * protocolFeePercentage) / 10000;
        stablecoinReturned = bTokenAmount - fee;
        
        // Burn bToken
        _burnBToken(msg.sender, bTokenAmount);
        
        // Return stablecoin
        IERC20(stablecoin).transfer(msg.sender, stablecoinReturned);
        
        // Update state
        userBTokenBalance[msg.sender] -= bTokenAmount;
        totalValueLocked -= stablecoinReturned;
        
        emit Withdrawal(msg.sender, bTokenAmount, stablecoinReturned);
        return stablecoinReturned;
    }
    
    // Rebalance basket weights (curator only)
    function rebalance(uint256[] memory newWeights) external onlyCurator {
        require(
            block.timestamp >= lastRebalanceTime + rebalanceFrequency,
            "Rebalance too soon"
        );
        
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < newWeights.length; i++) {
            totalWeight += newWeights[i];
        }
        require(totalWeight == 10000, "Weights must sum to 10000");
        
        currentWeights = newWeights;
        lastRebalanceTime = block.timestamp;
        
        emit WeightsUpdated(newWeights, block.timestamp);
    }
    
    // View functions
    function getBTokenBalance(address user) external view returns (uint256) {
        return userBTokenBalance[user];
    }
    
    function getTotalValueLocked() external view returns (uint256) {
        return totalValueLocked;
    }
    
    function getCurrentWeights() external view returns (uint256[] memory) {
        return currentWeights;
    }
    
    function getUnderlyingTokens() external view returns (address[] memory) {
        return underlyingTokens;
    }
    
    // Internal token operations
    function _mintBToken(address to, uint256 amount) internal {
        // Call HTS mint via interface
        IMintable(bTokenAddress).mint(amount);
        IERC20(bTokenAddress).transfer(to, amount);
    }
    
    function _burnBToken(address from, uint256 amount) internal {
        // Transfer bToken from user
        IERC20(bTokenAddress).transferFrom(from, address(this), amount);
        // Call HTS burn via interface
        IBurnable(bTokenAddress).burn(amount);
    }
}

// ============ RebalancingOracle.sol ============
// Manages rebalancing with price oracle integration

contract RebalancingOracle {
    address public factory;
    address public dataProvider; // Off-chain oracle
    
    mapping(uint256 => uint256) public lastRebalanceTime;
    mapping(address => uint256) public tokenLatestPrice;
    
    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);
    event RebalancingTriggered(uint256 indexed basketId, uint256 timestamp);
    
    modifier onlyDataProvider() {
        require(msg.sender == dataProvider, "Only data provider");
        _;
    }
    
    constructor(address _factory, address _dataProvider) {
        factory = _factory;
        dataProvider = _dataProvider;
    }
    
    // Update token prices (called by off-chain oracle)
    function updatePrices(
        address[] memory tokens,
        uint256[] memory prices
    ) external onlyDataProvider {
        require(tokens.length == prices.length, "Array length mismatch");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            tokenLatestPrice[tokens[i]] = prices[i];
            emit PriceUpdated(tokens[i], prices[i], block.timestamp);
        }
    }
    
    // Get single token price
    function getPrice(address token) external view returns (uint256) {
        return tokenLatestPrice[token];
    }
    
    // Calculate basket NAV based on latest prices
    function calculateBasketNAV(
        address[] memory tokens,
        uint256[] memory balances
    ) external view returns (uint256 totalValue) {
        require(tokens.length == balances.length, "Length mismatch");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 tokenValue = balances[i] * tokenLatestPrice[tokens[i]];
            totalValue += tokenValue;
        }
    }
    
    // Trigger rebalancing logic
    function triggerRebalancing(uint256 basketId) external {
        lastRebalanceTime[basketId] = block.timestamp;
        emit RebalancingTriggered(basketId, block.timestamp);
    }
}

// ============ FeederVault.sol ============
// Manages liquidity provider deposits and yield

contract FeederVault {
    address public factory;
    
    struct Feeder {
        string did; // Decentralized Identity
        uint256 stablecoinBalance;
        uint256 depositTimestamp;
        uint256 yieldEarned;
        bool verified;
    }
    
    mapping(address => Feeder) public feeders;
    mapping(string => address) public didToAddress; // DID to wallet mapping
    
    uint256 public totalFeederLiquidity;
    uint256 public yieldRate; // basis points (e.g., 100 = 1% APY)
    
    event FeederRegistered(address indexed feederAddress, string did);
    event LiquidityDeposited(address indexed feeder, uint256 amount);
    event LiquidityWithdrawn(address indexed feeder, uint256 amount);
    event YieldClaimed(address indexed feeder, uint256 yieldAmount);
    
    constructor(address _factory) {
        factory = _factory;
        yieldRate = 500; // 5% default APY
    }
    
    // Register feeder with DID verification
    function registerFeeder(
        string memory did,
        address feederAddress
    ) external {
        require(bytes(did).length > 0, "Invalid DID");
        require(feederAddress != address(0), "Invalid address");
        
        feeders[feederAddress].did = did;
        feeders[feederAddress].verified = true;
        feeders[feederAddress].depositTimestamp = block.timestamp;
        
        didToAddress[did] = feederAddress;
        
        emit FeederRegistered(feederAddress, did);
    }
    
    // Feeder deposits stablecoin liquidity
    function depositLiquidity(
        address feeder,
        address stablecoin,
        uint256 amount
    ) external {
        require(feeders[feeder].verified, "Feeder not verified");
        require(amount > 0, "Amount > 0");
        
        IERC20(stablecoin).transferFrom(msg.sender, address(this), amount);
        
        feeders[feeder].stablecoinBalance += amount;
        totalFeederLiquidity += amount;
        
        emit LiquidityDeposited(feeder, amount);
    }
    
    // Feeder withdraws liquidity
    function withdrawLiquidity(
        address feeder,
        address stablecoin,
        uint256 amount
    ) external {
        require(feeders[feeder].verified, "Feeder not verified");
        require(feeders[feeder].stablecoinBalance >= amount, "Insufficient balance");
        
        feeders[feeder].stablecoinBalance -= amount;
        totalFeederLiquidity -= amount;
        
        IERC20(stablecoin).transfer(msg.sender, amount);
        
        emit LiquidityWithdrawn(feeder, amount);
    }
    
    // Claim accrued yield
    function claimYield(address feeder) external {
        require(feeders[feeder].verified, "Feeder not verified");
        
        uint256 yield = calculateYield(feeder);
        require(yield > 0, "No yield to claim");
        
        feeders[feeder].yieldEarned += yield;
        
        emit YieldClaimed(feeder, yield);
    }
    
    // Calculate yield for feeder
    function calculateYield(address feeder) public view returns (uint256) {
        Feeder memory f = feeders[feeder];
        
        uint256 timeElapsed = block.timestamp - f.depositTimestamp;
        uint256 secondsPerYear = 365 days;
        uint256 yield = (f.stablecoinBalance * yieldRate * timeElapsed) / (10000 * secondsPerYear);
        
        return yield;
    }
    
    // View feeder info
    function getFeederInfo(address feeder) external view returns (Feeder memory) {
        return feeders[feeder];
    }
    
    // View total feeder liquidity
    function getTotalFeederLiquidity() external view returns (uint256) {
        return totalFeederLiquidity;
    }
}

// ============ INTERFACES ============

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IMintable {
    function mint(uint256 amount) external;
}

interface IBurnable {
    function burn(uint256 amount) external;
}