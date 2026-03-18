// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../libraries/ILMath.sol";

/// @title APEXBrain
/// @notice Reads on-chain IL exposure and computes the optimal
///         staking/buffer split for the current market regime.
///         Called by APEXCompounder before every reward distribution.
contract APEXBrain {

    // ── Constants ────────────────────────────────────────────────
    uint256 public constant BPS               = 10_000;
    uint256 public constant LOW_IL_THRESHOLD  = 500;    // < 5% IL
    uint256 public constant HIGH_IL_THRESHOLD = 1500;   // > 15% IL

    // ── Immutables ───────────────────────────────────────────────
    address public immutable vault;
    address public immutable stakingStrategy;
    address public immutable bufferStrategy;
    address public immutable compounder;

    // ── State ────────────────────────────────────────────────────
    struct SplitVector {
        uint256 stakingBps;  // % of rewards → asBNB
        uint256 bufferBps;   // % of rewards → asUSDF
        // invariant: stakingBps + bufferBps == BPS
    }

    SplitVector public currentSplit;

    // ── Events ───────────────────────────────────────────────────
    event SplitUpdated(
        uint256 oldStakingBps,
        uint256 newStakingBps,
        uint256 newBufferBps,
        uint256 ilBps,
        string  regime
    );

    // ── Errors ───────────────────────────────────────────────────
    error NotCompounder();
    error InvalidSplit(uint256 sum);
    error ZeroAddress();

    // ── Constructor ──────────────────────────────────────────────
    constructor(
        address vault_,
        address stakingStrategy_,
        address bufferStrategy_,
        address compounder_
    ) {
        if (vault_ == address(0))            revert ZeroAddress();
        if (stakingStrategy_ == address(0))  revert ZeroAddress();
        if (bufferStrategy_ == address(0))   revert ZeroAddress();
        if (compounder_ == address(0))       revert ZeroAddress();

        vault           = vault_;
        stakingStrategy = stakingStrategy_;
        bufferStrategy  = bufferStrategy_;
        compounder      = compounder_;
        currentSplit    = SplitVector(6000, 4000); // default per hackathon spec
    }

    // ── Core ─────────────────────────────────────────────────────

    /// @notice Compute split based on current IL. Pure view — no state changes.
    /// @return split The recommended SplitVector for current market conditions
    function computeSplit() public view returns (SplitVector memory split) {
        uint256 ilBps = _currentILBps();

        if (ilBps < LOW_IL_THRESHOLD) {
            // Low IL — maximize growth
            return SplitVector(7000, 3000);
        } else if (ilBps > HIGH_IL_THRESHOLD) {
            // High IL — protect capital
            return SplitVector(4000, 6000);
        } else {
            // Medium IL — hackathon spec default
            return SplitVector(6000, 4000);
        }
    }

    /// @notice Called by compounder before reward distribution
    /// @dev Updates stored split and emits event for The Graph indexing
    /// @return newSplit The new split that was applied
    function updateSplit() external returns (SplitVector memory newSplit) {
        if (msg.sender != compounder) revert NotCompounder();
        newSplit = computeSplit();
        uint256 ilBps = _currentILBps();

        emit SplitUpdated(
            currentSplit.stakingBps,
            newSplit.stakingBps,
            newSplit.bufferBps,
            ilBps,
            _regime(ilBps)
        );

        currentSplit = newSplit;
    }

    /// @notice Get the current market regime label
    /// @return regime "LOW", "MEDIUM", or "HIGH"
    function currentRegime() external view returns (string memory) {
        return _regime(_currentILBps());
    }

    // ── Internal ─────────────────────────────────────────────────

    /// @notice IL as % of staking position value (bps)
    /// @dev Reads entry and current exchange rates from StakingStrategy
    function _currentILBps() internal view returns (uint256) {
        // Read exchange rates from StakingStrategy
        (bool s1, bytes memory d1) = stakingStrategy.staticcall(
            abi.encodeWithSignature("entryPrice()")
        );
        (bool s2, bytes memory d2) = stakingStrategy.staticcall(
            abi.encodeWithSignature("currentPrice()")
        );

        if (!s1 || !s2) return 0;

        uint256 entryRate   = abi.decode(d1, (uint256));
        uint256 currentRate = abi.decode(d2, (uint256));

        return ILMath.computeILBps(entryRate, currentRate);
    }

    /// @notice Map IL bps to regime string
    function _regime(uint256 ilBps) internal pure returns (string memory) {
        if (ilBps < LOW_IL_THRESHOLD)  return "LOW";
        if (ilBps > HIGH_IL_THRESHOLD) return "HIGH";
        return "MEDIUM";
    }
}
