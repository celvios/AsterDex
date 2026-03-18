// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../core/APEXStrategy.sol";
import "../interfaces/IasUSDFMinter.sol";
import "../interfaces/IPancakeRouter.sol";

/// @title BufferStrategy
/// @notice IL hedge buffer — USDC → USDF → asUSDF via AsterDEX Earn.
///         asUSDF earns ~3.6% base APY. Buffer is never idle.
contract BufferStrategy is APEXStrategy {
    using SafeERC20 for IERC20;

    // ── Immutables ───────────────────────────────────────────────
    address public immutable asUSDF;
    address public immutable asUSDFMinter;
    address public immutable usdf;
    address public immutable pancakeRouter;

    // ── Events ───────────────────────────────────────────────────
    event BufferDeposited(uint256 usdcAmount, uint256 usdfReceived, uint256 asUSDFMinted);
    event BufferWithdrawn(uint256 amount);

    // ── Constructor ──────────────────────────────────────────────
    constructor(
        address vault_,
        address compounder_,
        address usdc_,
        address asUSDF_,
        address asUSDFMinter_,
        address usdf_,
        address pancakeRouter_
    ) APEXStrategy(vault_, compounder_, usdc_) {
        if (asUSDF_ == address(0))        revert ZeroAddress();
        if (asUSDFMinter_ == address(0))  revert ZeroAddress();
        if (usdf_ == address(0))          revert ZeroAddress();
        if (pancakeRouter_ == address(0)) revert ZeroAddress();

        asUSDF        = asUSDF_;
        asUSDFMinter  = asUSDFMinter_;
        usdf          = usdf_;
        pancakeRouter = pancakeRouter_;
    }

    // ── Strategy Interface ───────────────────────────────────────

    /// @notice Deposit USDC into buffer strategy
    /// @dev Swaps USDC → USDF via PancakeSwap, then mints asUSDF
    /// @param usdcAmount Amount of USDC to deploy
    function deposit(uint256 usdcAmount) external override onlyVault {
        // 1. Swap USDC → USDF via PancakeSwap
        IERC20(usdc).forceApprove(pancakeRouter, usdcAmount);

        address[] memory path = new address[](2);
        path[0] = usdc;
        path[1] = usdf;

        uint256[] memory amounts = IPancakeRouter(pancakeRouter).swapExactTokensForTokens(
            usdcAmount, 0, path, address(this), block.timestamp + 300
        );
        uint256 usdfReceived = amounts[amounts.length - 1];

        // 2. Mint asUSDF
        IERC20(usdf).forceApprove(asUSDFMinter, usdfReceived);
        IasUSDFMinter(asUSDFMinter).mint(usdfReceived);

        uint256 asUSDFMinted = IERC20(asUSDF).balanceOf(address(this));
        emit BufferDeposited(usdcAmount, usdfReceived, asUSDFMinted);
    }

    /// @notice Withdraw assets and return USDC to vault
    /// @param amount Amount to withdraw in USDC terms
    /// @return usdcReturned Actual USDC returned
    function withdraw(uint256 amount) external override onlyVault returns (uint256 usdcReturned) {
        // Redeem asUSDF → USDF
        uint256 asUSDFToRedeem = amount; // 1:1 accounting
        uint256 usdfReceived = IasUSDFMinter(asUSDFMinter).redeem(asUSDFToRedeem);

        // Swap USDF → USDC
        IERC20(usdf).forceApprove(pancakeRouter, usdfReceived);

        address[] memory path = new address[](2);
        path[0] = usdf;
        path[1] = usdc;

        uint256[] memory amounts = IPancakeRouter(pancakeRouter).swapExactTokensForTokens(
            usdfReceived, 0, path, address(this), block.timestamp + 300
        );
        usdcReturned = amounts[amounts.length - 1];

        IERC20(usdc).safeTransfer(vault, usdcReturned);

        emit BufferWithdrawn(usdcReturned);
    }

    /// @notice No explicit harvest — asUSDF yield is embedded in token value
    /// @return Always returns 0
    function harvest() external override onlyCompounder returns (uint256) {
        return 0;
    }

    /// @notice Total buffer value in USDC terms
    /// @dev asUSDF is pegged to USDC — 1:1 accounting
    function totalAssets() external view override returns (uint256) {
        return IERC20(asUSDF).balanceOf(address(this));
    }

    /// @notice Current APY of the buffer
    function currentAPY() external view override returns (uint256) {
        return IasUSDFMinter(asUSDFMinter).currentAPY();
    }
}
