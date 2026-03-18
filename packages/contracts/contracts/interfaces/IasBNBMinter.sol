// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IasBNBMinter
/// @notice Interface for the AsterDEX asBNB minter contract
interface IasBNBMinter {
    /// @notice Deposit BNB and receive asBNB
    /// @return asBNBAmount Amount of asBNB minted
    function deposit() external payable returns (uint256 asBNBAmount);

    /// @notice Current exchange rate of asBNB/BNB
    /// @return rate The exchange rate (18 decimals)
    function exchangeRate() external view returns (uint256 rate);

    /// @notice Redeem asBNB for BNB
    /// @param asBNBAmount Amount of asBNB to redeem
    /// @return bnbAmount Amount of BNB received
    function redeem(uint256 asBNBAmount) external returns (uint256 bnbAmount);
}
