// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IAPEXStrategy.sol";
import "../interfaces/IasBNBMinter.sol";

/// @title ILMath
/// @notice IL calculation library using asBNB exchange rate as proxy
///         Formula: IL% = 1 - (2√r / (1+r)) where r = currentRate/entryRate
library ILMath {

    uint256 internal constant BPS  = 10_000;
    uint256 internal constant WAD  = 1e18;

    // ── Core IL Calculations ─────────────────────────────────────

    /// @notice IL as % of position value (bps)
    /// @dev Uses asBNB/BNB exchange rate change as proxy for IL exposure
    /// @param entryRate  asBNB/BNB rate at time of deposit (18 decimals)
    /// @param currentRate asBNB/BNB rate now (18 decimals)
    /// @return ilBps IL in basis points (e.g. 500 = 5%)
    function computeILBps(
        uint256 entryRate,
        uint256 currentRate
    ) internal pure returns (uint256 ilBps) {
        if (entryRate == 0 || currentRate == entryRate) return 0;

        uint256 ratio    = currentRate * WAD / entryRate;
        uint256 sqrtR    = _sqrt(ratio * WAD); // sqrt scaled to WAD
        uint256 twoSqrtR = 2 * sqrtR;
        uint256 onePlusR = WAD + ratio;

        if (twoSqrtR >= onePlusR) return 0;

        uint256 holdFraction = twoSqrtR * WAD / onePlusR;
        ilBps = (WAD - holdFraction) * BPS / WAD;
    }

    /// @notice IL in absolute USDC terms
    /// @param positionValue Total position value in USDC (6 decimals)
    /// @param entryRate  asBNB/BNB rate at deposit
    /// @param currentRate asBNB/BNB rate now
    /// @return ilUSDC IL amount in USDC (6 decimals)
    function computeILUSDC(
        uint256 positionValue,
        uint256 entryRate,
        uint256 currentRate
    ) internal pure returns (uint256 ilUSDC) {
        uint256 ilBps = computeILBps(entryRate, currentRate);
        ilUSDC = positionValue * ilBps / BPS;
    }

    // ── Internal ─────────────────────────────────────────────────

    /// @notice Babylonian square root
    function _sqrt(uint256 x) internal pure returns (uint256 z) {
        if (x == 0) return 0;
        z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
