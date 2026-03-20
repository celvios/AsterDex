// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title MockPancakeRouter
/// @notice Test-only mock PancakeSwap router. Uses passthrough amounts
///         (no decimal scaling, no slippage). For testnet only.
/// @dev Pre-fund this contract with output tokens and BNB.
///      Swap amounts: raw input = raw output (no scaling).
///      This means 1000 USDC (1000e6 raw) → 1000e6 wei BNB (0.001 BNB).
///      TVL will look small, but the entire flow works end-to-end.
contract MockPancakeRouter {

    /// @notice Swap exact tokens for ETH (BNB) — passthrough amount
    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 /* amountOutMin */,
        address[] calldata path,
        address to,
        uint256 /* deadline */
    ) external returns (uint256[] memory amounts) {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);

        // Passthrough: same raw number as BNB wei
        // 1000 USDC (1000e6) → 1000e6 wei BNB (≈ 0.001 BNB)
        uint256 amountOut = amountIn;
        (bool ok, ) = to.call{value: amountOut}("");
        require(ok, "MockRouter: BNB transfer failed");

        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        amounts[path.length - 1] = amountOut;
    }

    /// @notice Swap exact tokens for tokens — passthrough amount
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 /* amountOutMin */,
        address[] calldata path,
        address to,
        uint256 /* deadline */
    ) external returns (uint256[] memory amounts) {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        IERC20(path[path.length - 1]).transfer(to, amountIn);

        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        amounts[path.length - 1] = amountIn;
    }

    /// @notice Swap exact ETH for tokens — passthrough amount
    function swapExactETHForTokens(
        uint256 /* amountOutMin */,
        address[] calldata path,
        address to,
        uint256 /* deadline */
    ) external payable returns (uint256[] memory amounts) {
        uint256 amountOut = msg.value;
        IERC20(path[path.length - 1]).transfer(to, amountOut);

        amounts = new uint256[](path.length);
        amounts[0] = msg.value;
        amounts[path.length - 1] = amountOut;
    }

    /// @notice Get amounts out — passthrough quote
    function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external pure returns (uint256[] memory amounts) {
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        amounts[path.length - 1] = amountIn;
    }

    receive() external payable {}
}
