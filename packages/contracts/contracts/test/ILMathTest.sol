// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../../contracts/libraries/ILMath.sol";

/// @title ILMathTest
/// @notice Test wrapper to expose ILMath library functions
contract ILMathTest {
    function computeILBps(
        uint256 entryRate,
        uint256 currentRate
    ) external pure returns (uint256) {
        return ILMath.computeILBps(entryRate, currentRate);
    }

    function computeILUSDC(
        uint256 positionValue,
        uint256 entryRate,
        uint256 currentRate
    ) external pure returns (uint256) {
        return ILMath.computeILUSDC(positionValue, entryRate, currentRate);
    }
}
