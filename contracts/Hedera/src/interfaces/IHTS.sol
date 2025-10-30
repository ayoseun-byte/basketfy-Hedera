pragma solidity ^0.8.20;

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

interface IHCSMirror {
    function submitMessage(
        address topicId,
        bytes memory message
    ) external returns (int64 responseCode);
}

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