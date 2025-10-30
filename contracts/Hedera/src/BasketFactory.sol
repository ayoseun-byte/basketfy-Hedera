
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BasketCore.sol";


// ============ BasketFactory.sol ============
// Factory for creating baskets and managing purchases/redemptions

contract BasketFactory {
    address public admin;
    
    uint256 public basketCounter;
    uint256 public protocolFeePercentage = 25; // 0.25%

    struct BasketConfig {
        string name;
        string theme;
        address basketAddress;
        address bTokenAddress;
        address nftAddress;
        address[] underlyingTokens;
        uint256[] defaultWeights;
        uint256 rebalanceFrequency;
        uint256 feePercentage;
        address curator;
        bool active;
    }

    mapping(uint256 => BasketConfig) public baskets;
    mapping(uint256 => uint256) public basketLatestNAV;
    mapping(uint256 => uint256) public basketLastNAVUpdate;
    mapping(address => uint256[]) public userBaskets;

    event BasketCreated(
        uint256 indexed basketId,
        string name,
        address indexed basketAddress,
        address bTokenAddress,
        address nftAddress,
        address curator,
        uint256 timestamp
    );

    event BasketPurchased(
        uint256 indexed basketId,
        address indexed buyer,
        uint256 stablecoinAmount,
        uint256 bTokenMinted,
        uint256 timestamp
    );

    event BasketRedeemed(
        uint256 indexed basketId,
        address indexed redeemer,
        uint256 bTokenBurned,
        uint256 stablecoinReturned,
        uint256 timestamp
    );

    event BasketNAVUpdated(
        uint256 indexed basketId,
        uint256 nav,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier basketExists(uint256 basketId) {
        require(baskets[basketId].active, "Basket not active");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // ============ BASKET CREATION ============

    function createBasket(
        string memory _name,
        string memory _theme,
        address[] memory _tokens,
        uint256[] memory _weights,
        uint256 _rebalanceFrequency,
        uint256 _feePercentage,
        address _basketAddress,
        address _bTokenAddress,
        address _nftAddress,
        address _curator
    ) external onlyAdmin returns (uint256 basketId) {
        require(_tokens.length == _weights.length, "Tokens/weights mismatch");
        require(_basketAddress != address(0), "Invalid basket address");
        require(_bTokenAddress != address(0), "Invalid bToken address");
        require(_nftAddress != address(0), "Invalid NFT address");
        require(_curator != address(0), "Invalid curator");

        uint256 totalWeight = 0;
        for (uint256 i = 0; i < _weights.length; i++) {
            totalWeight += _weights[i];
        }
        require(totalWeight == 10000, "Weights must sum to 10000");

        basketId = basketCounter++;

        baskets[basketId] = BasketConfig({
            name: _name,
            theme: _theme,
            basketAddress: _basketAddress,
            bTokenAddress: _bTokenAddress,
            nftAddress: _nftAddress,
            underlyingTokens: _tokens,
            defaultWeights: _weights,
            rebalanceFrequency: _rebalanceFrequency,
            feePercentage: _feePercentage,
            curator: _curator,
            active: true
        });

        emit BasketCreated(
            basketId,
            _name,
            _basketAddress,
            _bTokenAddress,
            _nftAddress,
            _curator,
            block.timestamp
        );

        return basketId;
    }

    // ============ BASKET OPERATIONS ============

    function buyBasket(
        uint256 basketId,
        address user,
        uint256 stablecoinAmount
    ) external basketExists(basketId) onlyAdmin returns (uint256 bTokenMinted) {
        BasketConfig storage basket = baskets[basketId];
        require(stablecoinAmount > 0, "Amount must be > 0");

        // Calculate bToken amount (1:1 ratio after fee deduction)
        uint256 protocolFee = (stablecoinAmount * basket.feePercentage) / 10000;
        bTokenMinted = stablecoinAmount - protocolFee;

        // Transfer bToken to user (backend already minted on HTS)
        require(
            IERC20(basket.bTokenAddress).transfer(user, bTokenMinted),
            "bToken transfer failed"
        );

        // Record deposit in basket contract
        BasketCore(basket.basketAddress).recordDeposit(user, stablecoinAmount, bTokenMinted);

        // Track user's baskets
        userBaskets[user].push(basketId);

        emit BasketPurchased(basketId, user, stablecoinAmount, bTokenMinted, block.timestamp);
        return bTokenMinted;
    }

    function redeemBasket(
        uint256 basketId,
        address user,
        uint256 bTokenAmount
    ) external basketExists(basketId) onlyAdmin returns (uint256 stablecoinReturned) {
        BasketConfig storage basket = baskets[basketId];
        require(bTokenAmount > 0, "Amount must be > 0");

        // Transfer bToken from user to contract (backend will burn on HTS)
        require(
            IERC20(basket.bTokenAddress).transferFrom(user, address(this), bTokenAmount),
            "bToken transfer from user failed"
        );

        // Calculate stablecoin return (1:1 ratio after fee deduction)
        uint256 protocolFee = (bTokenAmount * basket.feePercentage) / 10000;
        stablecoinReturned = bTokenAmount - protocolFee;

        // Record withdrawal in basket contract
        BasketCore(basket.basketAddress).recordWithdrawal(user, bTokenAmount, stablecoinReturned);

        emit BasketRedeemed(basketId, user, bTokenAmount, stablecoinReturned, block.timestamp);
        return stablecoinReturned;
    }

    // ============ NAV MANAGEMENT ============

    function updateBasketNAV(
        uint256 basketId,
        uint256 nav
    ) external onlyAdmin {
        require(baskets[basketId].active, "Basket not active");
        basketLatestNAV[basketId] = nav;
        basketLastNAVUpdate[basketId] = block.timestamp;
        emit BasketNAVUpdated(basketId, nav, block.timestamp);
    }

    // ============ BASKET MANAGEMENT ============

    function deactivateBasket(uint256 basketId) external onlyAdmin {
        require(baskets[basketId].active, "Already inactive");
        baskets[basketId].active = false;
    }

    function activateBasket(uint256 basketId) external onlyAdmin {
        require(!baskets[basketId].active, "Already active");
        baskets[basketId].active = true;
    }

    // ============ VIEW FUNCTIONS ============

    function getBasketConfig(uint256 basketId) external view returns (BasketConfig memory) {
        return baskets[basketId];
    }

    function getUserBaskets(address user) external view returns (uint256[] memory) {
        return userBaskets[user];
    }

    function getBasketNAV(uint256 basketId) 
        external 
        view 
        returns (uint256 nav, uint256 lastUpdate) 
    {
        nav = basketLatestNAV[basketId];
        lastUpdate = basketLastNAVUpdate[basketId];
    }

    function getBasketIdCounter() external view returns (uint256) {
        return basketCounter;
    }

    function isBasketActive(uint256 basketId) external view returns (bool) {
        return baskets[basketId].active;
    }

    function getBasketDefaultWeights(uint256 basketId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return baskets[basketId].defaultWeights;
    }

    function getBasketUnderlyingTokens(uint256 basketId) 
        external 
        view 
        returns (address[] memory) 
    {
        return baskets[basketId].underlyingTokens;
    }

    // ============ ADMIN FUNCTIONS ============

    function setProtocolFeePercentage(uint256 _feePercentage) external onlyAdmin {
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        protocolFeePercentage = _feePercentage;
    }

    function changeAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }
}