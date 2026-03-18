// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IAPEXStrategy.sol";

/// @title MockStrategy
/// @notice Mock strategy for vault unit tests — stores USDC and returns it on withdraw
contract MockStrategy is IAPEXStrategy {
    using SafeERC20 for IERC20;

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
        // Transfer USDC back to caller (vault)
        uint256 balance = IERC20(usdc).balanceOf(address(this));
        uint256 toTransfer = amount > balance ? balance : amount;
        if (toTransfer > 0) {
            IERC20(usdc).safeTransfer(msg.sender, toTransfer);
        }
        return toTransfer;
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
