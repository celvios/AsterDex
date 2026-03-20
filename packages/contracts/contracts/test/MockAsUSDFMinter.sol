// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockAsUSDFMinter
/// @notice Test-only mock for the AsterDEX asUSDF minter (IasUSDFMinter).
///         Spec: 1:1 USDF minting, static exchangePrice slightly above 1e18
///               to simulate 360 bps (~3.6%) APY accumulated over 6 months.
/// @dev 3.6% APY / 2 = 1.8% over 6 months → exchangePrice = 1.018e18
contract MockAsUSDFMinter {
    ERC20 public immutable asUsdf;
    ERC20 public immutable usdf;

    /// @dev 360 bps = 3.6% APY
    ///      Over 6 months: 1e18 + (1e18 * 360 / 10000 / 2) = 1.018e18
    uint256 public constant EXCHANGE_PRICE = 1.018e18;

    constructor(address asUsdfToken, address usdfToken) {
        asUsdf = ERC20(asUsdfToken);
        usdf   = ERC20(usdfToken);
    }

    /// @notice Mint asUSDF 1:1 for USDF deposited
    function mint(uint256 usdfAmount) external returns (uint256 asUSDFAmount) {
        require(usdfAmount > 0, "MockAsUSDFMinter: zero amount");
        IERC20(address(usdf)).transferFrom(msg.sender, address(this), usdfAmount);
        asUSDFAmount = usdfAmount; // 1:1
        IERC20(address(asUsdf)).transfer(msg.sender, asUSDFAmount);
    }

    /// @notice Redeem asUSDF 1:1 for USDF
    function redeem(uint256 asUSDFAmount) external returns (uint256 usdfAmount) {
        require(asUSDFAmount > 0, "MockAsUSDFMinter: zero amount");
        IERC20(address(asUsdf)).transferFrom(msg.sender, address(this), asUSDFAmount);
        usdfAmount = asUSDFAmount; // 1:1
        IERC20(address(usdf)).transfer(msg.sender, usdfAmount);
    }

    /// @notice Current exchange price — 1.018e18 (simulates 3.6% APY over 6 months)
    /// @return price 1.018e18
    function exchangePrice() external pure returns (uint256) {
        return EXCHANGE_PRICE;
    }
}
