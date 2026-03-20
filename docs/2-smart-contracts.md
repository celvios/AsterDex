# Smart Contracts Deep Dive

The core logic of APEX resides in `packages/contracts/contracts/`.

## 1. APEXVault (ERC4626)
- **Role:** The main entry point for users. It strictly adheres to the ERC4626 Tokenized Vault standard.
- **Functions:** `deposit()`, `withdraw()`, `mint()`, `redeem()`.
- **Key Features:** 
  - Tracks `hedgeHistory` (an array of snapshots taken during every compound).
  - Charges a 0.1% exit fee on withdrawal, which remains in the vault to boost the APY for remaining stakers.

## 2. APEXBrain (The Risk Engine)
- **Role:** Calculates current Impermanent Loss (IL) and dictates the reward split.
- **How it works:** 
  - Reads the `entryPrice` and `currentPrice` from the Staking Strategy.
  - Computes `ilBps` using advanced math (`ILMath.sol`) to calculate the divergence loss.
  - **Regimes:**
    - `LOW IL (<5%)`: Maximizes growth (70% Staking / 30% Buffer).
    - `MEDIUM IL (5-15%)`: Balanced (60% Staking / 40% Buffer).
    - `HIGH IL (>15%)`: Protects capital (40% Staking / 60% Buffer).

## 3. APEXCompounder (The Harvest Controller)
- **Role:** Handles the complex sequence of claiming rewards, swapping tokens, and reinvesting.
- **The Compound Loop:**
  1. Harvests yield (e.g., asBNB tokens or USDF tokens) from the strategies.
  2. Swaps the harvested yield into USDC via PancakeSwap.
  3. Queries the `APEXBrain` for the target split (e.g., 60/40).
  4. Swaps the USDC back into the underlying assets required by the strategies according to the split.
  5. Reinvests the assets and calls `vault.recordHedgeSnapshot()`.

## 4. Strategies (ERC4626 wrappers)
- **StakingStrategy:** Converts deposited USDC into wrapped BNB (or liquid staked BNB like asBNB) and generates yield.
- **BufferStrategy:** Converts deposited USDC into a stable yield-bearing asset (like USDF) to serve as a dry-powder hedge.

## Important: What to check on deployment
If interactions fail on a live network, check the following:
1. **Allowances:** Does the `Compounder` have maximum allowance to spend the vault's assets on the Router?
2. **Router Paths:** Are the swap paths in the strategies dynamically correct for the network (e.g., `USDC -> WBNB -> asBNB`)?
3. **Decimals:** USDC uses 6 decimals. WBNB/asBNB use 18 decimals. The contracts handle the scaling, but ensure mock tokens match these decimals on testnets.
