# APEX — Autonomous Protocol for Exponential Yield

> **BNB Chain | Riquid Hackathon**

APEX is the only vault that stores verifiable IL protection scores permanently on BNB Chain. It stacks two yield sources simultaneously: asBNB staking (up to 30% APY) and an asUSDF buffer earning 3.6% while protecting capital. A Brain adjusts the split dynamically based on live IL exposure.

## Architecture

```
User deposits USDC
  → APEXVault.sol (ERC-4626) → mints APEX-LP shares
  → StakingStrategy → swaps USDC → BNB → mints asBNB (up to 30% APY)
  → APEXCompounder (permissionless, 0.5% caller bounty)
      → 60% → more asBNB (growth)
      → 40% → asUSDF (IL hedge buffer earning 3.6%)
  → APEXBrain dynamically adjusts split based on IL exposure
  → HedgeSnapshot stored on-chain every cycle
```

## Packages

- `packages/contracts` — Solidity smart contracts (Hardhat)
- `packages/frontend` — Dashboard UI (Next.js 14 + wagmi v2)
- `packages/subgraph` — The Graph indexer

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests (BNB mainnet fork)
npm run test

# Start frontend
npm run dev
```

## Environment Setup

```bash
cp packages/contracts/.env.example packages/contracts/.env
# Fill in BSC_RPC_URL and PRIVATE_KEY
```
