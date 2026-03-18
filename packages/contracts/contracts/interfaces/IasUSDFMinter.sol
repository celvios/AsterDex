// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IasUSDFMinter
/// @notice Interface for the AsterDEX asUSDF minter contract
interface IasUSDFMinter {
    /// @notice Mint asUSDF by depositing USDF
    /// @param usdfAmount Amount of USDF to deposit
    /// @return asUSDFAmount Amount of asUSDF minted
    function mint(uint256 usdfAmount) external returns (uint256 asUSDFAmount);

    /// @notice Redeem asUSDF for USDF
    /// @param asUSDFAmount Amount of asUSDF to redeem
    /// @return usdfAmount Amount of USDF received
    function redeem(uint256 asUSDFAmount) external returns (uint256 usdfAmount);

    /// @notice Current APY of asUSDF in bps
    /// @return apy Current APY
    function currentAPY() external view returns (uint256 apy);
}
