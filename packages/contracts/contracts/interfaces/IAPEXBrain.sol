// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IAPEXBrain
/// @notice Interface for the APEX Brain — dynamic split engine
interface IAPEXBrain {
    struct SplitVector {
        uint256 stakingBps;
        uint256 bufferBps;
    }

    function computeSplit() external view returns (SplitVector memory);
    function updateSplit() external returns (SplitVector memory);
    function currentSplit() external view returns (uint256 stakingBps, uint256 bufferBps);
    function currentRegime() external view returns (string memory);
}
