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