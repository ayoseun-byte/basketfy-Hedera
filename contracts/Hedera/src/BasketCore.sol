// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";

// ============ BasketCore.sol ============
// Individual basket contract for managing a specific basket and user weights

contract BasketCore {
    address public factory;
    address public curator;
    
    string public basketName;
    string public basketTheme;
    
    address public bTokenAddress;
    address public nftAddress;
    address[] public underlyingTokens;
    uint256[] public defaultWeights; // basket's default weights in basis points
    
    // User-specific weights per user
    mapping(address => uint256[]) public userWeights;
    mapping(address => uint256) public userBTokenBalance;
    mapping(address => uint256) public userDepositTimestamp;
    mapping(address => bool) public hasUserWeights; // track if user has custom weights
    
    uint256 public totalValueLocked;
    uint256 public lastRebalanceTime;
    uint256 public rebalanceFrequency;
    uint256 public protocolFeePercentage;
    
    event Deposit(address indexed user, uint256 stablecoinAmount, uint256 bTokenMinted);
    event Withdrawal(address indexed user, uint256 bTokenBurned, uint256 stablecoinReturned);
    event UserWeightsUpdated(address indexed user, uint256[] newWeights, uint256 timestamp);
    event UserRebalanced(address indexed user, uint256[] newWeights, uint256 timestamp);
    event BasketDefaultWeightsUpdated(uint256[] newWeights, uint256 timestamp);
    
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
        defaultWeights = _weights;
        rebalanceFrequency = _rebalanceFrequency;
        protocolFeePercentage = _feePercentage;
        lastRebalanceTime = block.timestamp;
    }
    
    // ============ DEPOSIT & WITHDRAWAL ============
    
    // Called by factory when user deposits
    function recordDeposit(
        address user,
        uint256 stablecoinAmount,
        uint256 bTokenMinted
    ) external onlyFactory {
        require(stablecoinAmount > 0, "Amount > 0");
        
        userBTokenBalance[user] += bTokenMinted;
        userDepositTimestamp[user] = block.timestamp;
        totalValueLocked += stablecoinAmount;
        
        // If user doesn't have custom weights, use default weights
        if (!hasUserWeights[user]) {
            userWeights[user] = defaultWeights;
        }
        
        emit Deposit(user, stablecoinAmount, bTokenMinted);
    }
    
    // Called by factory when user withdraws
    function recordWithdrawal(
        address user,
        uint256 bTokenAmount,
        uint256 stablecoinReturned
    ) external onlyFactory {
        require(userBTokenBalance[user] >= bTokenAmount, "Insufficient balance");
        
        userBTokenBalance[user] -= bTokenAmount;
        totalValueLocked -= stablecoinReturned;
        
        emit Withdrawal(user, bTokenAmount, stablecoinReturned);
    }
    
    // ============ USER WEIGHT MANAGEMENT ============
    
    // User sets their own weight allocation for tokens in this basket
    function setUserWeights(uint256[] memory newWeights) external {
        require(newWeights.length == underlyingTokens.length, "Weight count mismatch");
        require(userBTokenBalance[msg.sender] > 0, "No stake in basket");
        
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < newWeights.length; i++) {
            totalWeight += newWeights[i];
        }
        require(totalWeight == 10000, "Weights must sum to 10000");
        
        userWeights[msg.sender] = newWeights;
        hasUserWeights[msg.sender] = true;
        lastRebalanceTime = block.timestamp;
        
        emit UserWeightsUpdated(msg.sender, newWeights, block.timestamp);
    }
    
    // User rebalances their weights (respects rebalance frequency)
    function rebalanceUserWeights(uint256[] memory newWeights) external {
        require(newWeights.length == underlyingTokens.length, "Weight count mismatch");
        require(userBTokenBalance[msg.sender] > 0, "No stake in basket");
        require(
            block.timestamp >= userDepositTimestamp[msg.sender] + rebalanceFrequency,
            "Rebalance too soon"
        );
        
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < newWeights.length; i++) {
            totalWeight += newWeights[i];
        }
        require(totalWeight == 10000, "Weights must sum to 10000");
        
        userWeights[msg.sender] = newWeights;
        hasUserWeights[msg.sender] = true;
        userDepositTimestamp[msg.sender] = block.timestamp;
        
        emit UserRebalanced(msg.sender, newWeights, block.timestamp);
    }
    
    // Curator can update basket's default weights (affects new deposits)
    function updateDefaultWeights(uint256[] memory newWeights) external onlyCurator {
        require(newWeights.length == underlyingTokens.length, "Weight count mismatch");
        
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < newWeights.length; i++) {
            totalWeight += newWeights[i];
        }
        require(totalWeight == 10000, "Weights must sum to 10000");
        
        defaultWeights = newWeights;
        
        emit BasketDefaultWeightsUpdated(newWeights, block.timestamp);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getUserBTokenBalance(address user) external view returns (uint256) {
        return userBTokenBalance[user];
    }
    
    function getUserWeights(address user) external view returns (uint256[] memory) {
        return userWeights[user];
    }
    
    function getDefaultWeights() external view returns (uint256[] memory) {
        return defaultWeights;
    }
    
    function getTotalValueLocked() external view returns (uint256) {
        return totalValueLocked;
    }
    
    function getUnderlyingTokens() external view returns (address[] memory) {
        return underlyingTokens;
    }
    
    function getTokenCount() external view returns (uint256) {
        return underlyingTokens.length;
    }
    
    function getUserHasCustomWeights(address user) external view returns (bool) {
        return hasUserWeights[user];
    }
}

