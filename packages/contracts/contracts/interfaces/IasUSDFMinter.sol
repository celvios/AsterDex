// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IasUSDFMinter
/// @notice Interface for the AsterDEX asUSDF minter contract
/// @dev Real contract: 0xdB57a53C428a9faFcbFefFB6dd80d0f427543695 on BSC mainnet
///      Confirmed functions via BSCScan Read-as-Proxy (March 2026)
interface IasUSDFMinter {
    /// @notice Mint asUSDF by depositing USDF
    /// @param usdfAmount Amount of USDF to deposit
    /// @return asUSDFAmount Amount of asUSDF minted
    function mint(uint256 usdfAmount) external returns (uint256 asUSDFAmount);

    /// @notice Redeem asUSDF for USDF
    /// @param asUSDFAmount Amount of asUSDF to redeem
    /// @return usdfAmount Amount of USDF received
    function redeem(uint256 asUSDFAmount) external returns (uint256 usdfAmount);

    /// @notice Current exchange price of asUSDF in USDF terms (1e18 scale)
    /// @dev Starts at 1e18 at genesis and grows as USDF yield accumulates.
    ///      Use (exchangePrice - 1e18) / 1e18 annualised to derive APY.
    /// @return price Exchange price (18 decimals)
    function exchangePrice() external view returns (uint256 price);
}
