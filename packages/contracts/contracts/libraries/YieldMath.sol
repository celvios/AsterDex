// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title YieldMath
/// @notice Helper library for APY calculations and BPS utilities
library YieldMath {

    uint256 internal constant BPS            = 10_000;
    uint256 internal constant SECONDS_PER_YEAR = 365 days;

    // ── APY Helpers ──────────────────────────────────────────────

    /// @notice Calculate annualized rate from two exchange rates and elapsed time
    /// @param entryRate  Rate at entry (18 decimals)
    /// @param currentRate Rate now (18 decimals)
    /// @param elapsed    Seconds elapsed since entry
    /// @return apyBps Annualized rate in bps
    function annualizedRateBps(
        uint256 entryRate,
        uint256 currentRate,
        uint256 elapsed
    ) internal pure returns (uint256 apyBps) {
        if (entryRate == 0 || currentRate <= entryRate || elapsed == 0) return 0;

        uint256 growth = (currentRate - entryRate) * BPS / entryRate;
        apyBps = growth * SECONDS_PER_YEAR / elapsed;
    }

    /// @notice Blend two APYs weighted by allocation bps
    /// @param apy1 First APY in bps
    /// @param weight1 Weight of first APY in bps
    /// @param apy2 Second APY in bps
    /// @param weight2 Weight of second APY in bps
    /// @return blendedBps Blended APY in bps
    function blendAPY(
        uint256 apy1,
        uint256 weight1,
        uint256 apy2,
        uint256 weight2
    ) internal pure returns (uint256 blendedBps) {
        blendedBps = (apy1 * weight1 + apy2 * weight2) / BPS;
    }
}
