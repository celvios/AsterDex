// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IAPEXVault
/// @notice Interface for the APEX ERC-4626 vault
interface IAPEXVault {
    struct HedgeSnapshot {
        uint256 timestamp;
        uint256 ilAmount;
        uint256 hedgeBuffer;
        uint256 hedgeEfficiency;
        uint256 stakingBps;
    }

    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);
    function totalAssets() external view returns (uint256);
    function pricePerShare() external view returns (uint256);
    function recordHedgeSnapshot(uint256 ilAmount_, uint256 hedgeBuffer_, uint256 stakingBps_) external;
    function latestHedgeSnapshot() external view returns (HedgeSnapshot memory);
    function hedgeHistoryLength() external view returns (uint256);
    function hedgeHistory(uint256 index) external view returns (
        uint256 timestamp,
        uint256 ilAmount,
        uint256 hedgeBuffer,
        uint256 hedgeEfficiency,
        uint256 stakingBps
    );
}
