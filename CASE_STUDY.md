# Case Study: AMM Impermanent Loss Hedging via Autonomous Regime Detection

**Author:** Tolu King — Quantitative Trader & Systems Architect  
**Stack:** Solidity · Python · Node.js · The Graph · BNB Chain  
**GitHub:** [AsterDex](https://github.com/celvios/AsterDex)  
**Context:** BNB Chain · Riquid Hackathon · $75,000 Prize Pool

---

## The Problem

Automated Market Makers (AMMs) suffer from a structural flaw known as **Impermanent Loss (IL)**: liquidity providers earn fees, but lose value relative to simply holding their assets whenever the price diverges from their entry point.

The existing solutions were either passive (wait for price to return) or required constant manual rebalancing — neither of which is viable at scale.

The engineering challenge: **build a system that autonomously detects the current IL regime and adjusts capital allocation in real time to minimize loss and maximise yield simultaneously.**

---

## The Market Microstructure Problem

To understand why this is hard, consider what an LP position actually represents:

- At low IL (prices near entry): Staking rewards outperform any hedging cost → aggressive yield is optimal
- At medium IL (moderate divergence): A balanced approach is needed — hold some stable buffer while collecting staking yield
- At high IL (extreme divergence): Capital preservation dominates — shift heavily to stablecoins to limit downside

A human cannot monitor this 24/7. A static smart contract cannot adapt. The solution required an **on-chain AI-like regime engine**: `APEXBrain`.

---

## System Architecture

```
User Deposits USDC
        │
        ▼
APEXVault (ERC-4626)
  • Mints LP shares 1:1 at launch
  • 0.1% exit fee (flash loan protection)
  • Stores HedgeSnapshot[] permanently on-chain
        │
        ├──────────────────────────────────────┐
        ▼                                      ▼
StakingStrategy                         BufferStrategy
  USDC → BNB → asBNB                    USDC → asUSDF
  (up to 30% APY)                       (3.6% APY — IL hedge)
        │                                      │
        └──────────────┬───────────────────────┘
                       ▼
              APEXCompounder
  • Permissionless compound()
  • 0.5% caller bounty (incentivises external actors)
  • Reinvests yield: 60% staking / 40% buffer
                       │
                       ▼
                APEXBrain
  • Reads live IL from on-chain oracle
  • LOW  (<300 bps):  70/30 staking/buffer
  • MED  (300-600):   60/40
  • HIGH (>600 bps):  40/60 (capital protection)
  • Emits SplitUpdated event on every regime change
```

---

## The APEXBrain: Regime Detection Logic

The Brain is the core quantitative innovation. It works like a simple but highly effective **market microstructure classifier**:

```
IL Exposure (bps) → Regime Classification → Capital Split Decision
```

Three regimes are defined based on empirically observed AMM IL thresholds:

| IL Exposure | Regime | Staking Allocation | Buffer Allocation | Rationale |
|---|---|---|---|---|
| < 300 bps | 🟢 LOW | 70% | 30% | IL is negligible, maximise yield aggressively |
| 300–600 bps | 🟡 MEDIUM | 60% | 40% | IL becoming meaningful, maintain partial hedge |
| > 600 bps | 🔴 HIGH | 40% | 60% | IL is severe, prioritise capital preservation |

This functions similarly to a **spread adjustment algorithm** used in traditional market making: when inventory risk increases (IL in our case), tighten the allocation toward safety.

---

## Key Engineering Decisions

**1. On-Chain Regime State (Verifiable IL Protection)**  
Unlike off-chain bots that can be manipulated or fail silently, `APEXBrain` stores every `HedgeSnapshot` permanently on-chain. This gives LPs **cryptographic proof** that their IL was being managed — a first in the space.

**2. Permissionless Compounding**  
Anyone can call `compound()` and earn a 0.5% bounty. This creates a **decentralised network of incentivised actors** to keep the vault compounding continuously, removing any single point of failure.

**3. ERC-4626 Standard**  
The vault follows the ERC-4626 tokenised vault standard, ensuring compatibility with the entire DeFi ecosystem (aggregators, dashboards, composability).

**4. Flash Loan Protection**  
A 10 basis point exit fee prevents attackers from depositing and withdrawing in the same transaction to manipulate regime state.

---

## Quantitative Results

| Metric | Value |
|---|---|
| Smart Contract Test Coverage | 77 tests passing |
| Regimes Modelled | 3 (LOW / MEDIUM / HIGH IL) |
| IL Protection | Dynamic: 30–60% capital in stable buffer |
| Blended APY (LOW regime) | ~24% (70% at 30% APY + 30% at 3.6%) |
| Blended APY (HIGH regime) | ~14% (40% at 30% APY + 60% at 3.6%) |
| System Capacity | Up to $1,000,000 in vault TVL |

---

## Challenges & Solutions

| Challenge | Solution |
|---|---|
| IL is continuous but regimes must be discrete | Threshold-based classification with clear breakpoints at 300/600 bps |
| On-chain data is expensive to store | Packed `HedgeSnapshot` structs with minimal storage slots |
| Compounding must be decentralised | Permissionless `compound()` with 0.5% caller bounty |
| Regime changes can be front-run | Brain reads oracle first, then updates split atomically in one tx |

---

## Connection to Market Making

This system directly mirrors the logic used by professional market makers managing inventory risk:

| Market Making Concept | AsterDex Equivalent |
|---|---|
| Inventory skew | IL exposure (bps) |
| Spread widening | Shift capital to stable buffer |
| Regime detection | APEXBrain (LOW / MED / HIGH) |
| Position sizing | Dynamic staking/buffer split |
| Risk limit | HIGH regime forces defensive 40/60 allocation |

Building this deepened my understanding of **how pricing and allocation decisions must respond to real-time market conditions** — the core skill required in any quantitative trading or market making role.
