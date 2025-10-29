// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IHTS {
    function createFungibleToken(
        IHederaTokenService.HederaToken memory token,
        uint64 initialSupply,
        uint32 decimals
    ) external returns (int64 responseCode, address tokenAddress);

    function createNonFungibleToken(
        IHederaTokenService.HederaToken memory token
    ) external returns (int64 responseCode, address tokenAddress);

    function mintToken(
        address token,
        uint64 amount,
        bytes[] memory metadata
    ) external returns (int64 responseCode, uint64 serialNumber);

    function burnToken(
        address token,
        uint64 amount,
        int64[] memory serialNumbers
    ) external returns (int64 responseCode);

    function transfer(
        address token,
        address from,
        address to,
        int64 amount
    ) external returns (int64 responseCode);

    function transferNFT(
        address token,
        address from,
        address to,
        int64 serialNumber
    ) external returns (int64 responseCode);
}

interface IHCSMirror {
    function submitMessage(
        address topicId,
        bytes memory message
    ) external returns (int64 responseCode);
}

contract BasketFactory {
    address public admin;
    address public htsAddress = 0x0000000000000000000000000000000000000167;
    address public hcsTopicId;
    
    uint256 public basketCounter;
    uint256 public protocolFeePercentage = 25; // 0.25%

    struct BasketConfig {
        string name;
        string theme;
        address[] tokens;
        uint256[] weights; // in basis points (10000 = 100%)
        uint256 rebalanceFrequency; // in seconds
        uint256 feePercentage; // in basis points
        address curator;
        bool active;
    }

    struct Basket {
        uint256 basketId;
        address bTokenAddress;
        address nftAddress;
        BasketConfig config;
        uint256 totalValueLocked;
        uint256 lastRebalanceTime;
        uint256 createdAt;
    }

    mapping(uint256 => Basket) public baskets;
    mapping(address => uint256[]) public userBaskets;
    mapping(address => uint256) public basketShares; // bToken balance tracking

    event BasketCreated(
        uint256 indexed basketId,
        string name,
        address bTokenAddress,
        address nftAddress,
        address curator
    );

    event BasketPurchased(
        uint256 indexed basketId,
        address indexed buyer,
        uint256 stablecoinAmount,
        uint256 bTokenMinted
    );

    event BasketRedeemed(
        uint256 indexed basketId,
        address indexed redeemer,
        uint256 bTokenBurned,
        uint256 stablecoinReturned
    );

    event BasketRebalanced(
        uint256 indexed basketId,
        uint256[] newWeights,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier basketExists(uint256 basketId) {
        require(baskets[basketId].config.active, "Basket not active");
        _;
    }

    constructor(address _hcsTopicId) {
        admin = msg.sender;
        hcsTopicId = _hcsTopicId;
    }

    // ============ BASKET CREATION ============

    function createBasket(
        string memory _name,
        string memory _theme,
        address[] memory _tokens,
        uint256[] memory _weights,
        uint256 _rebalanceFrequency,
        uint256 _feePercentage,
        string memory _tokenName,
        string memory _tokenSymbol
    ) external returns (uint256 basketId) {
        require(_tokens.length == _weights.length, "Tokens/weights mismatch");
        
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < _weights.length; i++) {
            totalWeight += _weights[i];
        }
        require(totalWeight == 10000, "Weights must sum to 10000");

        basketId = basketCounter++;

        // Create bToken (fungible HTS token)
        address bTokenAddress = _createBToken(_tokenName, _tokenSymbol);
        
        // Create Basket Identity NFT
        address nftAddress = _createBasketNFT(_name, _theme);

        BasketConfig memory config = BasketConfig({
            name: _name,
            theme: _theme,
            tokens: _tokens,
            weights: _weights,
            rebalanceFrequency: _rebalanceFrequency,
            feePercentage: _feePercentage,
            curator: msg.sender,
            active: true
        });

        baskets[basketId] = Basket({
            basketId: basketId,
            bTokenAddress: bTokenAddress,
            nftAddress: nftAddress,
            config: config,
            totalValueLocked: 0,
            lastRebalanceTime: block.timestamp,
            createdAt: block.timestamp
        });

        // Log to HCS
        _logToHCS(abi.encodePacked(
            "BASKET_CREATED:",
            basketId,
            ":",
            _name,
            ":",
            bTokenAddress,
            ":",
            nftAddress
        ));

        emit BasketCreated(basketId, _name, bTokenAddress, nftAddress, msg.sender);
    }

    // ============ BASKET OPERATIONS ============

    function buyBasket(
        uint256 basketId,
        address stablecoin,
        uint256 stablecoinAmount
    ) external basketExists(basketId) returns (uint256 bTokenMinted) {
        Basket storage basket = baskets[basketId];
        require(stablecoinAmount > 0, "Amount must be > 0");

        // Transfer stablecoin from user to contract
        IERC20(stablecoin).transferFrom(msg.sender, address(this), stablecoinAmount);

        // Calculate bToken amount (1:1 ratio with stablecoin for simplicity)
        uint256 protocolFee = (stablecoinAmount * protocolFeePercentage) / 10000;
        bTokenMinted = stablecoinAmount - protocolFee;

        // Mint bToken to user
        IHTS(htsAddress).mintToken(
            basket.bTokenAddress,
            uint64(bTokenMinted),
            new bytes[](0)
        );

        IERC20(basket.bTokenAddress).transfer(msg.sender, bTokenMinted);

        basket.totalValueLocked += stablecoinAmount;
        basketShares[msg.sender] += bTokenMinted;
        userBaskets[msg.sender].push(basketId);

        // Log to HCS
        _logToHCS(abi.encodePacked(
            "BASKET_PURCHASE:",
            basketId,
            ":",
            msg.sender,
            ":",
            stablecoinAmount,
            ":",
            bTokenMinted
        ));

        emit BasketPurchased(basketId, msg.sender, stablecoinAmount, bTokenMinted);
    }

    function redeemBasket(
        uint256 basketId,
        address stablecoin,
        uint256 bTokenAmount
    ) external basketExists(basketId) returns (uint256 stablecoinReturned) {
        Basket storage basket = baskets[basketId];
        require(bTokenAmount > 0, "Amount must be > 0");

        // Transfer bToken from user to contract
        IERC20(basket.bTokenAddress).transferFrom(msg.sender, address(this), bTokenAmount);

        // Burn bToken
        IHTS(htsAddress).burnToken(
            basket.bTokenAddress,
            uint64(bTokenAmount),
            new int64[](0)
        );

        // Calculate stablecoin return (with protocol fee deduction)
        uint256 protocolFee = (bTokenAmount * protocolFeePercentage) / 10000;
        stablecoinReturned = bTokenAmount - protocolFee;

        // Return stablecoin to user
        IERC20(stablecoin).transfer(msg.sender, stablecoinReturned);

        basket.totalValueLocked -= stablecoinReturned;
        basketShares[msg.sender] -= bTokenAmount;

        // Log to HCS
        _logToHCS(abi.encodePacked(
            "BASKET_REDEMPTION:",
            basketId,
            ":",
            msg.sender,
            ":",
            bTokenAmount,
            ":",
            stablecoinReturned
        ));

        emit BasketRedeemed(basketId, msg.sender, bTokenAmount, stablecoinReturned);
    }

    function rebalanceBasket(
        uint256 basketId,
        uint256[] memory newWeights
    ) external basketExists(basketId) {
        Basket storage basket = baskets[basketId];
        require(msg.sender == basket.config.curator, "Only curator");
        require(
            block.timestamp >= basket.lastRebalanceTime + basket.config.rebalanceFrequency,
            "Too soon"
        );

        uint256 totalWeight = 0;
        for (uint256 i = 0; i < newWeights.length; i++) {
            totalWeight += newWeights[i];
        }
        require(totalWeight == 10000, "Weights must sum to 10000");

        basket.config.weights = newWeights;
        basket.lastRebalanceTime = block.timestamp;

        // Log to HCS
        _logToHCS(abi.encodePacked(
            "BASKET_REBALANCED:",
            basketId,
            ":",
            block.timestamp
        ));

        emit BasketRebalanced(basketId, newWeights, block.timestamp);
    }

    // ============ INTERNAL HELPERS ============

    function _createBToken(
        string memory tokenName,
        string memory tokenSymbol
    ) internal returns (address) {
        // In production, use HTS API
        // For now, return placeholder
        return address(0);
    }

    function _createBasketNFT(
        string memory basketName,
        string memory theme
    ) internal returns (address) {
        // In production, use HTS NFT API
        // For now, return placeholder
        return address(0);
    }

    function _logToHCS(bytes memory message) internal {
        // Log to Hedera Consensus Service
        IHCSMirror(hcsTopicId).submitMessage(hcsTopicId, message);
    }

    // ============ VIEW FUNCTIONS ============

    function getBasket(uint256 basketId) external view returns (Basket memory) {
        return baskets[basketId];
    }

    function getUserBaskets(address user) external view returns (uint256[] memory) {
        return userBaskets[user];
    }

    function getBasketConfig(uint256 basketId) external view returns (BasketConfig memory) {
        return baskets[basketId].config;
    }
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IHederaTokenService {
    struct HederaToken {
        string name;
        string symbol;
        address treasury;
        string memo;
        bool defaultFreezeStatus;
        bool defaultKycStatus;
        bool freezeDefault;
        bool kycDefault;
    }
}