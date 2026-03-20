// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockAsBNBMinter
/// @notice Test-only mock for the AsterDEX asBNB minter (IasBNBMinter).
///         Spec: 1:1 BNB minting, static exchangeRate of 1.05e18 (5% earned).
/// @dev Deploy alongside MockERC20("asBNB") — this contract mints the asBNB token.
contract MockAsBNBMinter {
    ERC20 public immutable asBnb;

    /// @dev Fixed exchange rate: 1.05 BNB per asBNB (18-decimal, 1e18 = 1:1)
    uint256 public constant EXCHANGE_RATE = 1.05e18;

    constructor(address asBnbToken) {
        asBnb = ERC20(asBnbToken);
    }

    /// @notice Deposit BNB and receive asBNB 1:1 (ignores exchange rate for simplicity)
    function deposit() external payable returns (uint256 asBNBAmount) {
        require(msg.value > 0, "MockAsBNBMinter: zero deposit");
        asBNBAmount = msg.value; // 1:1 minting
        // Requires the asBNB token to have minted to this contract, or use a mintable interface
        // For tests: pre-fund this contract with asBNB tokens
        IERC20(address(asBnb)).transfer(msg.sender, asBNBAmount);
    }

    /// @notice Static exchange rate — 1.05e18 (simulates 5% yield earned)
    function exchangeRate() external pure returns (uint256) {
        return EXCHANGE_RATE;
    }

    /// @notice Redeem asBNB for BNB 1:1
    function redeem(uint256 asBNBAmount) external returns (uint256 bnbAmount) {
        require(asBNBAmount > 0, "MockAsBNBMinter: zero amount");
        IERC20(address(asBnb)).transferFrom(msg.sender, address(this), asBNBAmount);
        bnbAmount = asBNBAmount;
        (bool ok, ) = msg.sender.call{value: bnbAmount}("");
        require(ok, "MockAsBNBMinter: BNB transfer failed");
    }

    receive() external payable {}
}
