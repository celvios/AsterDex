// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IAPEXStrategy.sol";
import "../interfaces/IAPEXVault.sol";
import "../interfaces/IAPEXBrain.sol";
import "../interfaces/IasBNBMinter.sol";
import "../interfaces/IasUSDFMinter.sol";
import "../interfaces/IPancakeRouter.sol";
import "../libraries/ILMath.sol";

/// @title APEXCompounder
/// @notice Permissionless compounder. Anyone calls compound() and earns
///         0.5% of harvested rewards. Triggers Brain split update,
///         mints asBNB + asUSDF, records HedgeSnapshot on vault.
contract APEXCompounder is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Constants ────────────────────────────────────────────────
    uint256 public constant CALLER_BOUNTY_BPS = 50;      // 0.5%
    uint256 public constant MIN_COMPOUND_USDC = 1e6;     // 1 USDC minimum
    uint256 public constant BPS               = 10_000;

    // ── Immutables ───────────────────────────────────────────────
    address public immutable vault;
    address public immutable brain;
    address public immutable stakingStrategy;
    address public immutable bufferStrategy;
    address public immutable usdc;
    address public immutable wbnb;
    address public immutable usdf;
    address public immutable asBNB;
    address public immutable asBNBMinter;
    address public immutable asUSDFMinter;
    address public immutable pancakeRouter;

    // ── State ────────────────────────────────────────────────────
    uint256 public lastCompound;
    uint256 public totalCompounds;

    // ── Events ───────────────────────────────────────────────────
    event Compounded(
        uint256 totalHarvested,
        uint256 toStaking,
        uint256 toBuffer,
        uint256 callerBounty,
        address indexed caller,
        uint256 timestamp
    );
    event MintFailed(string token, string reason);

    // ── Errors ───────────────────────────────────────────────────
    error BelowThreshold(uint256 amount, uint256 minimum);
    error ZeroAddress();

    // ── Constructor ──────────────────────────────────────────────
    constructor(
        address vault_,
        address brain_,
        address stakingStrategy_,
        address bufferStrategy_,
        address usdc_,
        address wbnb_,
        address usdf_,
        address asBNB_,
        address asBNBMinter_,
        address asUSDFMinter_,
        address pancakeRouter_
    ) {
        if (vault_ == address(0))           revert ZeroAddress();
        if (brain_ == address(0))           revert ZeroAddress();
        if (stakingStrategy_ == address(0)) revert ZeroAddress();
        if (bufferStrategy_ == address(0))  revert ZeroAddress();
        if (usdc_ == address(0))            revert ZeroAddress();
        if (wbnb_ == address(0))            revert ZeroAddress();
        if (usdf_ == address(0))            revert ZeroAddress();
        if (asBNB_ == address(0))           revert ZeroAddress();
        if (asBNBMinter_ == address(0))     revert ZeroAddress();
        if (asUSDFMinter_ == address(0))    revert ZeroAddress();
        if (pancakeRouter_ == address(0))   revert ZeroAddress();

        vault           = vault_;
        brain           = brain_;
        stakingStrategy = stakingStrategy_;
        bufferStrategy  = bufferStrategy_;
        usdc            = usdc_;
        wbnb            = wbnb_;
        usdf            = usdf_;
        asBNB           = asBNB_;
        asBNBMinter     = asBNBMinter_;
        asUSDFMinter    = asUSDFMinter_;
        pancakeRouter   = pancakeRouter_;
    }

    // ── Core ─────────────────────────────────────────────────────

    /// @notice Permissionless — anyone can call. Caller earns 0.5% bounty.
    /// @dev Full compound cycle: harvest → bounty → Brain split → mint → snapshot
    /// @return totalHarvested Total USDC harvested from staking strategy
    function compound() external nonReentrant returns (uint256 totalHarvested) {
        // Step 1: harvest yield from staking strategy
        totalHarvested = IAPEXStrategy(stakingStrategy).harvest();

        // Step 2: guard — skip dust
        if (totalHarvested < MIN_COMPOUND_USDC) {
            revert BelowThreshold(totalHarvested, MIN_COMPOUND_USDC);
        }

        // Step 3: pay caller bounty FIRST, then work with remainder
        uint256 bounty    = totalHarvested * CALLER_BOUNTY_BPS / BPS;
        uint256 remaining = totalHarvested - bounty;
        IERC20(usdc).safeTransfer(msg.sender, bounty);

        // Step 4: get Brain's current split
        IAPEXBrain.SplitVector memory split = IAPEXBrain(brain).updateSplit();

        // Step 5: split rewards
        uint256 toStaking = remaining * split.stakingBps / BPS;
        uint256 toBuffer  = remaining - toStaking;

        // Step 6: mint asBNB with staking allocation
        if (toStaking > 0) {
            _mintAsBNB(toStaking);
        }

        // Step 7: mint asUSDF with buffer allocation
        if (toBuffer > 0) {
            _mintAsUSDF(toBuffer);
        }

        // Step 8: record IL snapshot on-chain
        _recordSnapshot(split.stakingBps);

        // Step 9: update state
        lastCompound    = block.timestamp;
        totalCompounds += 1;

        emit Compounded(
            totalHarvested,
            toStaking,
            toBuffer,
            bounty,
            msg.sender,
            block.timestamp
        );
    }

    // ── Internal ─────────────────────────────────────────────────

    /// @notice Swap USDC → BNB → mint asBNB → send to staking strategy
    function _mintAsBNB(uint256 usdcAmount) internal {
        IERC20(usdc).forceApprove(pancakeRouter, usdcAmount);

        address[] memory path = new address[](2);
        path[0] = usdc;
        path[1] = wbnb;

        try IPancakeRouter(pancakeRouter).swapExactTokensForETH(
            usdcAmount, 0, path, address(this), block.timestamp + 300
        ) returns (uint256[] memory amounts) {
            uint256 bnbReceived = amounts[amounts.length - 1];

            try IasBNBMinter(asBNBMinter).deposit{value: bnbReceived}() {
                uint256 asBNBBalance = IERC20(asBNB).balanceOf(address(this));
                IERC20(asBNB).safeTransfer(stakingStrategy, asBNBBalance);
            } catch Error(string memory reason) {
                emit MintFailed("asBNB", reason);
            }
        } catch Error(string memory reason) {
            emit MintFailed("asBNB-swap", reason);
        }
    }

    /// @notice Swap USDC → USDF → mint asUSDF → send to buffer strategy
    function _mintAsUSDF(uint256 usdcAmount) internal {
        IERC20(usdc).forceApprove(pancakeRouter, usdcAmount);

        address[] memory path = new address[](2);
        path[0] = usdc;
        path[1] = usdf;

        try IPancakeRouter(pancakeRouter).swapExactTokensForTokens(
            usdcAmount, 0, path, address(this), block.timestamp + 300
        ) returns (uint256[] memory amounts) {
            uint256 usdfReceived = amounts[amounts.length - 1];

            IERC20(usdf).forceApprove(asUSDFMinter, usdfReceived);
            try IasUSDFMinter(asUSDFMinter).mint(usdfReceived) {
                uint256 asUSDFBalance = IERC20(asUSDFMinter).balanceOf(address(this));
                IERC20(asUSDFMinter).safeTransfer(bufferStrategy, asUSDFBalance);
            } catch Error(string memory reason) {
                emit MintFailed("asUSDF", reason);
            }
        } catch Error(string memory reason) {
            emit MintFailed("asUSDF-swap", reason);
        }
    }

    /// @notice Read IL + buffer and record snapshot on vault
    function _recordSnapshot(uint256 stakingBps) internal {
        (bool s1, bytes memory d1) = stakingStrategy.staticcall(
            abi.encodeWithSignature("entryPrice()")
        );
        (bool s2, bytes memory d2) = stakingStrategy.staticcall(
            abi.encodeWithSignature("currentPrice()")
        );

        uint256 ilAmount = 0;
        if (s1 && s2) {
            uint256 entryRate   = abi.decode(d1, (uint256));
            uint256 currentRate = abi.decode(d2, (uint256));
            uint256 posValue    = IAPEXStrategy(stakingStrategy).totalAssets();
            ilAmount = ILMath.computeILUSDC(posValue, entryRate, currentRate);
        }

        uint256 hedgeBuffer = IAPEXStrategy(bufferStrategy).totalAssets();
        IAPEXVault(vault).recordHedgeSnapshot(ilAmount, hedgeBuffer, stakingBps);
    }

    /// @notice Allow contract to receive BNB (needed for swap routing)
    receive() external payable {}
}
