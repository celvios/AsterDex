// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title APEXStrategy
/// @notice Abstract base for all APEX strategy modules.
///         Enforces a standard interface for deposit/withdraw/harvest.
abstract contract APEXStrategy {
    using SafeERC20 for IERC20;

    // ── Errors ───────────────────────────────────────────────────
    error ZeroAddress();
    error NotVault();
    error NotCompounder();

    // ── Immutables ───────────────────────────────────────────────
    address public immutable vault;
    address public immutable compounder;
    address public immutable usdc;

    // ── Constructor ──────────────────────────────────────────────
    constructor(address vault_, address compounder_, address usdc_) {
        if (vault_ == address(0))      revert ZeroAddress();
        if (compounder_ == address(0)) revert ZeroAddress();
        if (usdc_ == address(0))       revert ZeroAddress();

        vault      = vault_;
        compounder = compounder_;
        usdc       = usdc_;
    }

    // ── Interface ────────────────────────────────────────────────

    /// @notice Deploy assets into this strategy
    function deposit(uint256 amount) external virtual;

    /// @notice Withdraw assets and return to vault
    function withdraw(uint256 amount) external virtual returns (uint256);

    /// @notice Harvest pending rewards — return USDC amount
    function harvest() external virtual returns (uint256);

    /// @notice Total assets in USDC terms (including unrealised yield)
    function totalAssets() external view virtual returns (uint256);

    /// @notice Current APY in bps (e.g. 1500 = 15.00%)
    function currentAPY() external view virtual returns (uint256);

    // ── Modifiers ────────────────────────────────────────────────

    modifier onlyVault() {
        if (msg.sender != vault) revert NotVault();
        _;
    }

    modifier onlyCompounder() {
        if (msg.sender != compounder) revert NotCompounder();
        _;
    }
}
