// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IAPEXStrategy.sol";

/// @title MockHarvestableStrategy
/// @notice Mock strategy that can simulate harvesting a configurable yield amount
contract MockHarvestableStrategy is IAPEXStrategy {
    using SafeERC20 for IERC20;

    address public usdc;
    uint256 private _totalAssets;
    uint256 private _harvestAmount;
    uint256 private _entryPrice;
    uint256 private _currentPrice;

    constructor(address usdc_) {
        usdc = usdc_;
        _entryPrice = 1e18;
        _currentPrice = 1e18;
    }

    function setHarvestAmount(uint256 amount) external { _harvestAmount = amount; }
    function setEntryPrice(uint256 p) external { _entryPrice = p; }
    function setCurrentPrice(uint256 p) external { _currentPrice = p; }

    function entryPrice() external view returns (uint256) { return _entryPrice; }
    function currentPrice() external view returns (uint256) { return _currentPrice; }

    function deposit(uint256 amount) external override {
        _totalAssets += amount;
    }

    function withdraw(uint256 amount) external override returns (uint256) {
        if (_totalAssets >= amount) _totalAssets -= amount;
        return amount;
    }

    /// @notice Returns the configured harvest amount and transfers USDC to caller
    function harvest() external override returns (uint256) {
        uint256 amount = _harvestAmount;
        if (amount > 0 && IERC20(usdc).balanceOf(address(this)) >= amount) {
            IERC20(usdc).safeTransfer(msg.sender, amount);
        }
        return amount;
    }

    function totalAssets() external view override returns (uint256) {
        return _totalAssets;
    }

    function currentAPY() external pure override returns (uint256) {
        return 1200;
    }

    receive() external payable {}
}
