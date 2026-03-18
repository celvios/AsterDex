// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IAPEXStrategy
/// @notice Interface for all APEX strategy modules
interface IAPEXStrategy {
    /// @notice Deploy assets into this strategy
    function deposit(uint256 amount) external;

    /// @notice Withdraw assets and return to vault
    function withdraw(uint256 amount) external returns (uint256);

    /// @notice Harvest pending rewards — return USDC amount
    function harvest() external returns (uint256);

    /// @notice Total assets in USDC terms (including unrealised yield)
    function totalAssets() external view returns (uint256);

    /// @notice Current APY in bps (e.g. 1500 = 15.00%)
    function currentAPY() external view returns (uint256);
}
