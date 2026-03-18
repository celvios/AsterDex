// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IAPEXStrategy.sol";

/// @title MockStrategy
/// @notice Mock strategy for vault unit tests — tracks deposits as USDC balance
contract MockStrategy is IAPEXStrategy {
    address public usdc;
    uint256 private _totalAssets;

    constructor(address usdc_) {
        usdc = usdc_;
    }

    function deposit(uint256 amount) external override {
        _totalAssets += amount;
    }

    function withdraw(uint256 amount) external override returns (uint256) {
        if (_totalAssets >= amount) {
            _totalAssets -= amount;
        }
        return amount;
    }

    function harvest() external override returns (uint256) {
        return 0;
    }

    function totalAssets() external view override returns (uint256) {
        return _totalAssets;
    }

    function currentAPY() external pure override returns (uint256) {
        return 0;
    }
}
