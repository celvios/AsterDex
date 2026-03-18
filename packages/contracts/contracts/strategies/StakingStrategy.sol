// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../core/APEXStrategy.sol";
import "../interfaces/IasBNBMinter.sol";
import "../interfaces/IPancakeRouter.sol";
import "../libraries/ILMath.sol";
import "../libraries/YieldMath.sol";

/// @title StakingStrategy
/// @notice Primary yield strategy — USDC → BNB → asBNB via AsterDEX Earn.
///         asBNB appreciates in value every epoch (staking + HODLer airdrops + Megadrops).
///         Tracks entry exchange rate for IL calculation.
contract StakingStrategy is APEXStrategy {
    using SafeERC20 for IERC20;

    // ── Constants ────────────────────────────────────────────────
    uint256 public constant BPS = 10_000;

    // ── Immutables ───────────────────────────────────────────────
    address public immutable asBNB;
    address public immutable asBNBMinter;
    address public immutable wbnb;
    address public immutable pancakeRouter;

    // ── State ────────────────────────────────────────────────────
    uint256 private entryExchangeRate;  // asBNB/BNB at time of last deposit
    uint256 private entryUSDCValue;     // USDC value at deposit (for IL calc)
    uint256 private entryTimestamp;     // timestamp of first deposit

    // ── Events ───────────────────────────────────────────────────
    event StrategyDeposited(uint256 usdcAmount, uint256 bnbReceived, uint256 asBNBMinted);
    event StrategyHarvested(uint256 yieldUSDC);
    event StrategyWithdrawn(uint256 amount);

    // ── Errors ───────────────────────────────────────────────────
    error SwapFailed();

    // ── Constructor ──────────────────────────────────────────────
    constructor(
        address vault_,
        address compounder_,
        address usdc_,
        address asBNB_,
        address asBNBMinter_,
        address wbnb_,
        address pancakeRouter_
    ) APEXStrategy(vault_, compounder_, usdc_) {
        if (asBNB_ == address(0))        revert ZeroAddress();
        if (asBNBMinter_ == address(0))  revert ZeroAddress();
        if (wbnb_ == address(0))         revert ZeroAddress();
        if (pancakeRouter_ == address(0)) revert ZeroAddress();

        asBNB         = asBNB_;
        asBNBMinter   = asBNBMinter_;
        wbnb          = wbnb_;
        pancakeRouter = pancakeRouter_;
    }

    // ── Strategy Interface ───────────────────────────────────────

    /// @notice Deposit USDC into staking strategy
    /// @dev Swaps USDC → BNB via PancakeSwap, then mints asBNB via AsterDEX Earn
    /// @param usdcAmount Amount of USDC to deploy (6 decimals)
    function deposit(uint256 usdcAmount) external override onlyVault {
        // 1. Approve and swap USDC → BNB via PancakeSwap
        IERC20(usdc).forceApprove(pancakeRouter, usdcAmount);

        address[] memory path = new address[](2);
        path[0] = usdc;
        path[1] = wbnb;

        uint256[] memory amounts = IPancakeRouter(pancakeRouter).swapExactTokensForETH(
            usdcAmount, 0, path, address(this), block.timestamp + 300
        );
        uint256 bnbReceived = amounts[amounts.length - 1];

        // 2. Mint asBNB with received BNB
        IasBNBMinter(asBNBMinter).deposit{value: bnbReceived}();
        uint256 asBNBMinted = IERC20(asBNB).balanceOf(address(this));

        // 3. Record entry state for IL calculation
        entryExchangeRate = IasBNBMinter(asBNBMinter).exchangeRate();
        entryUSDCValue   += usdcAmount;
        if (entryTimestamp == 0) {
            entryTimestamp = block.timestamp;
        }

        emit StrategyDeposited(usdcAmount, bnbReceived, asBNBMinted);
    }

    /// @notice Withdraw assets and return USDC to vault
    /// @param amount Amount to withdraw in USDC terms
    /// @return usdcReturned Actual USDC returned
    function withdraw(uint256 amount) external override onlyVault returns (uint256 usdcReturned) {
        // Convert USDC amount to asBNB amount
        uint256 asBNBToSell = _usdcToAsBNB(amount);
        usdcReturned = _sellAsBNBForUSDC(asBNBToSell);

        // Send USDC back to vault
        IERC20(usdc).safeTransfer(vault, usdcReturned);

        // Update entry value
        if (entryUSDCValue > amount) {
            entryUSDCValue -= amount;
        } else {
            entryUSDCValue = 0;
        }

        emit StrategyWithdrawn(usdcReturned);
    }

    /// @notice Harvest yield — sell the appreciation above entry value
    /// @dev asBNB is a rebase token — yield is reflected in exchange rate
    /// @return harvestedUSDC Amount of USDC harvested
    function harvest() external override onlyCompounder returns (uint256 harvestedUSDC) {
        uint256 currentValue = this.totalAssets();
        if (currentValue <= entryUSDCValue) return 0;

        uint256 yieldUSDC = currentValue - entryUSDCValue;

        // Sell yield portion: asBNB → BNB → USDC
        uint256 asBNBToSell = _usdcToAsBNB(yieldUSDC);
        harvestedUSDC = _sellAsBNBForUSDC(asBNBToSell);

        // Send harvested USDC to compounder
        IERC20(usdc).safeTransfer(compounder, harvestedUSDC);

        // Reset baseline
        entryUSDCValue = this.totalAssets();

        emit StrategyHarvested(harvestedUSDC);
    }

    /// @notice Total position value in USDC terms
    function totalAssets() external view override returns (uint256) {
        uint256 asBNBBalance = IERC20(asBNB).balanceOf(address(this));
        if (asBNBBalance == 0) return 0;

        uint256 exchangeRate = IasBNBMinter(asBNBMinter).exchangeRate();
        uint256 bnbValue     = asBNBBalance * exchangeRate / 1e18;
        return _bnbToUSDC(bnbValue);
    }

    /// @notice Current APY based on exchange rate growth
    function currentAPY() external view override returns (uint256) {
        uint256 currentRate = IasBNBMinter(asBNBMinter).exchangeRate();
        if (entryExchangeRate == 0 || currentRate <= entryExchangeRate) return 0;

        uint256 elapsed = block.timestamp - entryTimestamp;
        return YieldMath.annualizedRateBps(entryExchangeRate, currentRate, elapsed);
    }

    // ── IL Price Feeds ───────────────────────────────────────────

    /// @notice Entry exchange rate for IL calculation
    function entryPrice() external view returns (uint256) {
        return entryExchangeRate;
    }

    /// @notice Current exchange rate for IL calculation
    function currentPrice() external view returns (uint256) {
        return IasBNBMinter(asBNBMinter).exchangeRate();
    }

    // ── Internal Helpers ─────────────────────────────────────────

    /// @notice Convert USDC amount to equivalent asBNB amount
    function _usdcToAsBNB(uint256 usdcAmount) internal view returns (uint256) {
        uint256 bnbValue     = _usdcToBNB(usdcAmount);
        uint256 exchangeRate = IasBNBMinter(asBNBMinter).exchangeRate();
        if (exchangeRate == 0) return 0;
        return bnbValue * 1e18 / exchangeRate;
    }

    /// @notice Sell asBNB → BNB → USDC via PancakeSwap
    function _sellAsBNBForUSDC(uint256 asBNBAmount) internal returns (uint256) {
        if (asBNBAmount == 0) return 0;

        // Redeem asBNB for BNB
        uint256 bnbReceived = IasBNBMinter(asBNBMinter).redeem(asBNBAmount);

        // Swap BNB → USDC
        address[] memory path = new address[](2);
        path[0] = wbnb;
        path[1] = usdc;

        uint256[] memory amounts = IPancakeRouter(pancakeRouter).swapExactETHForTokens{value: bnbReceived}(
            0, path, address(this), block.timestamp + 300
        );

        return amounts[amounts.length - 1];
    }

    /// @notice Get BNB value of USDC via router quote
    function _usdcToBNB(uint256 usdcAmount) internal view returns (uint256) {
        if (usdcAmount == 0) return 0;
        address[] memory path = new address[](2);
        path[0] = usdc;
        path[1] = wbnb;
        uint256[] memory amounts = IPancakeRouter(pancakeRouter).getAmountsOut(usdcAmount, path);
        return amounts[amounts.length - 1];
    }

    /// @notice Get USDC value of BNB via router quote
    function _bnbToUSDC(uint256 bnbAmount) internal view returns (uint256) {
        if (bnbAmount == 0) return 0;
        address[] memory path = new address[](2);
        path[0] = wbnb;
        path[1] = usdc;
        uint256[] memory amounts = IPancakeRouter(pancakeRouter).getAmountsOut(bnbAmount, path);
        return amounts[amounts.length - 1];
    }

    /// @notice Allow contract to receive BNB
    receive() external payable {}
}
