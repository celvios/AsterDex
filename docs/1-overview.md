# APEX Protocol Overview

## What is APEX?
APEX (Autonomous Protocol for Exponential yield) is a smart DeFi vault built on the BNB Chain. It solves one of the biggest problems for Liquidity Providers (LPs): **Impermanent Loss (IL)**. 

When users deposit USDC into APEX, the protocol doesn't just blindly yield farm. Instead, it splits the capital into two distinct strategies:
1. **Staking Strategy (The Engine):** Generates high yield (via BNB liquid staking or similar high-growth assets).
2. **Buffer Strategy (The Shield):** Generates stable, low-risk yield (via stablecoin lending) to act as a hedge against volatility.

## The Core Innovation: APEX Brain 🧠
The magic of APEX lies in the **APEXBrain**. It is an autonomous, on-chain risk-engine that continuously calculates the Impermanent Loss experienced by the Staking Strategy. 

Based on the real-time IL calculation, the Brain dynamically shifts the protocol's reward distribution (the "Split") between the Staking and Buffer strategies to maintain the optimal balance of growth and protection.

## System Architecture
The protocol is composed of three main layers:
1. **Smart Contracts (Solidity):** The immutable, trustless execution layer handling deposits, strategies, IL math, and compounding.
2. **The Graph (Subgraph):** An indexing layer that listens to events emitted by the smart contracts and organizes the historical data (Hedge Snapshots, TVL, APY).
3. **Frontend (Next.js):** The sleek, glassmorphism dashboard that users interact with, reading both live contract state (via Wagmi) and historical analytics (via The Graph).

## The User Flow
1. **Deposit:** User deposits USDC into the `APEXVault`. They receive `APEX-LP` receipt tokens in return.
2. **Compound:** Anyone (usually a keeper bot) can trigger the `APEXCompounder.compound()` function. 
3. **Harvest & Split:** The Compounder harvests yield from both strategies, queries the `APEXBrain` for the optimal split, and distributes the new yield accordingly.
4. **Hedge Snapshot:** A snapshot of the current IL, Buffer size, and Hedge Efficiency is recorded on-chain and indexed by the Subgraph.
5. **Withdraw:** User burns their `APEX-LP` shares to receive their original USDC plus their share of the blended yield, minus a small exit fee (0.1%).
