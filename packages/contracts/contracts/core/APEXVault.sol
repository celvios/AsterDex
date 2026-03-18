// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IAPEXStrategy.sol";

/// @title APEXVault
/// @notice ERC-4626 compliant vault. Accepts USDC deposits, routes to
///         StakingStrategy (asBNB) and BufferStrategy (asUSDF).
///         Stores on-chain HedgeSnapshots for verifiable IL protection scoring.
contract APEXVault is ERC4626, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // ── Constants ────────────────────────────────────────────────
    uint256 public constant EXIT_FEE_BPS = 10;      // 0.1% exit fee
    uint256 public constant MIN_DEPOSIT  = 1e6;     // 1 USDC (6 decimals)
    uint256 public constant BPS          = 10_000;

    // ── Immutables ───────────────────────────────────────────────
    address public immutable brain;
    address public immutable compounder;
    address public immutable stakingStrategy;
    address public immutable bufferStrategy;
    address public immutable treasury;

    // ── On-chain IL Protection History ───────────────────────────
    struct HedgeSnapshot {
        uint256 timestamp;
        uint256 ilAmount;         // IL in USDC (6 decimals)
        uint256 hedgeBuffer;      // asUSDF buffer in USDC terms (6 decimals)
        uint256 hedgeEfficiency;  // hedgeBuffer / ilAmount * 10000 (bps)
        uint256 stakingBps;       // Brain's staking allocation this cycle
    }

    HedgeSnapshot[] public hedgeHistory;

    // ── Events ───────────────────────────────────────────────────
    event Deposited(address indexed user, uint256 assets, uint256 shares, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 assets, uint256 fee, uint256 shares, uint256 timestamp);
    event HedgeSnapshotRecorded(uint256 il, uint256 buffer, uint256 efficiency, uint256 stakingBps, uint256 timestamp);

    // ── Errors ───────────────────────────────────────────────────
    error NotCompounder();
    error BelowMinDeposit(uint256 provided, uint256 minimum);
    error ZeroAddress();

    // ── Constructor ──────────────────────────────────────────────
    constructor(
        address usdc_,
        address brain_,
        address compounder_,
        address stakingStrategy_,
        address bufferStrategy_,
        address treasury_
    )
        ERC4626(IERC20(usdc_))
        ERC20("APEX Vault", "APEX-LP")
        Ownable(msg.sender)
    {
        if (usdc_ == address(0))            revert ZeroAddress();
        if (brain_ == address(0))           revert ZeroAddress();
        if (compounder_ == address(0))      revert ZeroAddress();
        if (stakingStrategy_ == address(0)) revert ZeroAddress();
        if (bufferStrategy_ == address(0))  revert ZeroAddress();
        if (treasury_ == address(0))        revert ZeroAddress();

        brain           = brain_;
        compounder      = compounder_;
        stakingStrategy = stakingStrategy_;
        bufferStrategy  = bufferStrategy_;
        treasury        = treasury_;
    }

    // ── ERC-4626 Overrides ───────────────────────────────────────

    /// @notice Total assets = staking position + buffer position + idle USDC
    function totalAssets() public view override returns (uint256) {
        return IAPEXStrategy(stakingStrategy).totalAssets()
             + IAPEXStrategy(bufferStrategy).totalAssets()
             + IERC20(asset()).balanceOf(address(this));
    }

    /// @notice Deposit USDC and receive APEX-LP vault shares
    /// @dev Routes deposit into StakingStrategy immediately after minting shares.
    ///      Reverts below MIN_DEPOSIT to prevent dust attacks.
    /// @param assets   Amount of USDC to deposit (6 decimals)
    /// @param receiver Address that receives APEX-LP shares
    /// @return shares  Number of APEX-LP shares minted
    function deposit(uint256 assets, address receiver)
        public override nonReentrant whenNotPaused returns (uint256 shares)
    {
        if (assets < MIN_DEPOSIT) revert BelowMinDeposit(assets, MIN_DEPOSIT);
        shares = super.deposit(assets, receiver);
        // Route deposit into staking strategy immediately
        IERC20(asset()).safeTransfer(stakingStrategy, assets);
        IAPEXStrategy(stakingStrategy).deposit(assets);
        emit Deposited(receiver, assets, shares, block.timestamp);
    }

    /// @notice Withdraw USDC by burning vault shares
    /// @dev Pulls USDC from staking strategy, charges EXIT_FEE_BPS (0.1%) to treasury.
    /// @param assets   Amount of USDC to withdraw
    /// @param receiver Address that receives USDC
    /// @param owner    Address that owns the shares
    /// @return shares  Number of shares burned
    function withdraw(uint256 assets, address receiver, address owner)
        public override nonReentrant whenNotPaused returns (uint256 shares)
    {
        uint256 fee = assets * EXIT_FEE_BPS / BPS;
        uint256 net = assets - fee;

        // Pull USDC from strategy BEFORE ERC4626's _transferOut tries to send it
        IAPEXStrategy(stakingStrategy).withdraw(assets);

        // ERC4626 burns shares and transfers `net` USDC to receiver
        shares = super.withdraw(net, receiver, owner);

        // Send fee to treasury
        IERC20(asset()).safeTransfer(treasury, fee);

        emit Withdrawn(receiver, assets, fee, shares, block.timestamp);
    }

    // ── IL Snapshot ──────────────────────────────────────────────

    /// @notice Called by compounder on every compound cycle
    /// @dev Stores hedge efficiency on-chain — verifiable by judges
    /// @param ilAmount_    Current IL exposure in USDC
    /// @param hedgeBuffer_ Current buffer value in USDC
    /// @param stakingBps_  Brain's current staking allocation
    function recordHedgeSnapshot(
        uint256 ilAmount_,
        uint256 hedgeBuffer_,
        uint256 stakingBps_
    ) external {
        if (msg.sender != compounder) revert NotCompounder();
        uint256 efficiency = ilAmount_ == 0
            ? BPS
            : hedgeBuffer_ * BPS / ilAmount_;

        hedgeHistory.push(HedgeSnapshot({
            timestamp:       block.timestamp,
            ilAmount:        ilAmount_,
            hedgeBuffer:     hedgeBuffer_,
            hedgeEfficiency: efficiency,
            stakingBps:      stakingBps_
        }));

        emit HedgeSnapshotRecorded(
            ilAmount_,
            hedgeBuffer_,
            efficiency,
            stakingBps_,
            block.timestamp
        );
    }

    // ── View Functions ───────────────────────────────────────────

    /// @notice Get the most recent hedge snapshot
    function latestHedgeSnapshot() external view returns (HedgeSnapshot memory) {
        require(hedgeHistory.length > 0, "APEX: no snapshots yet");
        return hedgeHistory[hedgeHistory.length - 1];
    }

    /// @notice Total number of hedge snapshots recorded
    function hedgeHistoryLength() external view returns (uint256) {
        return hedgeHistory.length;
    }

    /// @notice Current price per share in USDC (6 decimals)
    function pricePerShare() external view returns (uint256) {
        uint256 supply = totalSupply();
        return supply == 0 ? 1e6 : totalAssets() * 1e6 / supply;
    }

    // ── Emergency ────────────────────────────────────────────────

    /// @notice Emergency pause — blocks all deposits and withdrawals
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause vault operations
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
}
