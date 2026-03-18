// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockStakingWithIL
/// @notice Mock staking strategy that returns configurable exchange rates
///         so we can test Brain regime shifts at different IL levels
contract MockStakingWithIL {
    uint256 private _entryPrice;
    uint256 private _currentPrice;
    uint256 private _totalAssets;

    constructor(uint256 entryPrice_, uint256 currentPrice_) {
        _entryPrice = entryPrice_;
        _currentPrice = currentPrice_;
    }

    function setEntryPrice(uint256 p) external { _entryPrice = p; }
    function setCurrentPrice(uint256 p) external { _currentPrice = p; }
    function setTotalAssets(uint256 a) external { _totalAssets = a; }

    function entryPrice() external view returns (uint256) { return _entryPrice; }
    function currentPrice() external view returns (uint256) { return _currentPrice; }
    function totalAssets() external view returns (uint256) { return _totalAssets; }
    function currentAPY() external pure returns (uint256) { return 1200; }

    function deposit(uint256) external {}
    function withdraw(uint256) external returns (uint256) { return 0; }
    function harvest() external returns (uint256) { return 0; }

    receive() external payable {}
}
