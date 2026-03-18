// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockSimple
/// @notice Minimal mock contract that just exists at an address (for brain/compounder slots)
contract MockSimple {
    // No-op — just needs a non-zero address
    receive() external payable {}
}
