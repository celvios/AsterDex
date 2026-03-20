# APEX Protocol

An Autonomous Protocol for Exponential yield, designed to provide smart Impermanent Loss hedging on the BNB Chain using an autonomous Brain to dynamically split capital across Staking and Buffer strategies.

## Documentation
Comprehensive documentation on the architecture, smart contracts, frontend, and deployment can be found in the [`docs/`](./docs) directory:

1. [Protocol Overview](./docs/1-overview.md)
2. [Smart Contracts Deep Dive](./docs/2-smart-contracts.md)
3. [Frontend & Subgraph Integration](./docs/3-frontend-and-subgraph.md)
4. [Testing & Deployment Guide](./docs/4-testing-and-deployment.md)

---

## Architecture

```
┌─ User ─────────────────────────────────────────────────────────┐
│  Deposits USDC                                                 │
└──────────────────────────┬─────────────────────────────────────┘
                           ▼
┌─ APEXVault.sol (ERC-4626) ────────────────────────────────────┐
│  • Mints APEX-LP shares 1:1 at launch                         │
│  • 0.1% exit fee on withdraw                                  │
│  • Stores HedgeSnapshot[] on-chain                            │
│  • Pausable by owner                                          │
└──────────────┬─────────────────────────┬──────────────────────┘
               ▼                         ▼
┌─ StakingStrategy ────┐   ┌─ BufferStrategy ──────────────────┐
│  USDC → BNB → asBNB  │   │  USDC → asUSDF (3.6% APY)        │
│  (up to 30% APY)      │   │  IL hedge buffer                  │
└───────────┬───────────┘   └───────────┬──────────────────────┘
            ▼                           ▼
┌─ APEXCompounder.sol ─────────────────────────────────────────┐
│  • Permissionless compound()                                  │
│  • 0.5% caller bounty                                         │
│  • Splits yield: 60% → staking, 40% → buffer                 │
│  • Mints asBNB + asUSDF via Riquid minters                    │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌─ APEXBrain.sol ──────────────────────────────────────────────┐
│  • Reads IL from on-chain oracle                              │
│  • LOW regime  (<300 bps): 70/30 staking/buffer               │
│  • MEDIUM regime (300–600): 60/40                             │
│  • HIGH regime (>600 bps): 40/60 protect capital              │
│  • Emits SplitUpdated event                                   │
└──────────────────────────────────────────────────────────────┘
```

## Packages

| Package | Description | Stack |
|---------|-------------|-------|
| `packages/contracts` | Smart contracts | Solidity ^0.8.24, Hardhat, OpenZeppelin |
| `packages/frontend` | Dashboard UI | Next.js 14, wagmi v2, viem, Recharts |
| `packages/subgraph` | Event indexer | The Graph, AssemblyScript |

## Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Compile

```bash
# Clone and install all dependencies
git clone https://github.com/asterdex/asterdex.git
cd asterdex
npm install

# Compile contracts
cd packages/contracts
npx hardhat compile
```

### Run Tests

```bash
cd packages/contracts
npx hardhat test
```

All **77 tests** cover:
- Brain regime detection (LOW / MEDIUM / HIGH IL thresholds)
- Compounder unit tests (bounty calc, threshold guards, permissionless)
- Integration tests (deposit → compound → snapshot → withdraw flow)

### Start Frontend

```bash
cd packages/frontend
npm run dev
# → http://localhost:3000
```

The dashboard shows:
- **IL Protection Score** — animated conic ring with regime badge
- **Vault Stats** — TVL, blended APY, user balance, yield
- **Brain Status** — live split gauge with regime label
- **APY Chart** — 30-day blended APY line chart
- **IL Score Chart** — hedge efficiency over time
- **Yield Breakdown** — staking vs buffer APY
- **Hedge History** — last 10 snapshots table
- **Deposit / Withdraw** widgets with live share previews

### Deploy Subgraph

```bash
cd packages/subgraph
npx graph codegen
npx graph build
npx graph deploy --studio asterdex --deploy-key <YOUR_KEY> --version-label v1.0.0
```

**Live endpoint:** `https://api.studio.thegraph.com/query/1744631/asterdex/v1.0.0`

## Environment Setup

```bash
cp packages/contracts/.env.example packages/contracts/.env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `BSC_RPC_URL` | BNB Chain RPC (default: `https://bsc-dataseed.binance.org/`) |
| `PRIVATE_KEY` | Deployer private key |
| `BSCSCAN_API_KEY` | For contract verification |
| `NEXT_PUBLIC_VAULT_ADDRESS` | Deployed APEXVault address |
| `NEXT_PUBLIC_BRAIN_ADDRESS` | Deployed APEXBrain address |
| `NEXT_PUBLIC_COMPOUNDER_ADDRESS` | Deployed APEXCompounder address |
| `NEXT_PUBLIC_GRAPH_URL` | Subgraph query endpoint |

## Smart Contracts

| Contract | Purpose | Key Functions |
|----------|---------|---------------|
| **APEXVault** | ERC-4626 vault | `deposit`, `withdraw`, `recordHedgeSnapshot` |
| **APEXBrain** | IL regime engine | `computeSplit`, `updateSplit`, `currentRegime` |
| **APEXCompounder** | Yield compounder | `compound` (permissionless, 0.5% bounty) |
| **StakingStrategy** | asBNB yield | `deposit`, `withdraw`, `totalDeposited` |
| **BufferStrategy** | asUSDF buffer | `deposit`, `withdraw`, `totalDeposited` |

## Security

- All contracts use OpenZeppelin `Ownable`, `Pausable`, `ReentrancyGuard`
- ERC-4626 standard for vault share accounting
- Exit fee (10 bps) on withdrawals prevents flash-loan attacks
- `MIN_DEPOSIT` guard (1 USDC) on deposits
- `MIN_COMPOUND_USDC` threshold (1 USDC) prevents dust compounds
- Compounder is fully permissionless — anyone can call `compound()`

## Design System

White minimalist glassmorphism:
- **Fonts:** Inter (UI) + JetBrains Mono (numbers/addresses)
- **Glass cards:** `backdrop-filter: blur(20px)` with white borders
- **Liquid glass:** Hero sections with saturated blur
- **Ambient blobs:** Fixed-position gradient circles for refraction
- **Regime badges:** Green (LOW) / Amber (MEDIUM) / Red (HIGH)

## License

MIT
