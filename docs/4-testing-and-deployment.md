# Testing & Deployment Guide

## 1. Local Testing
The contracts use Hardhat and Chai for extensive unit testing.
- **Run Unit Tests:** `npx hardhat test`
- **Run Fork Tests:** `npx hardhat test test/fork/fork-connectivity.test.ts`
  - Fork tests simulate the BNB Mainnet environment to ensure `PancakeRouter` and token swaps work with real liquidity.

### E2E Flow (Testnet)
To test the full lifecycle on BSC Testnet locally via terminal:
```bash
npx hardhat run scripts/test-flow.ts --network bscTestnet
```
This script will:
1. Mint mock USDC.
2. Approve and deposit into the Vault.
3. Trigger a `compound()` call (which harvests yield and records a Hedge Snapshot).

## 2. Deployment
To deploy the whole suite to BNB Mainnet or BSC Testnet:

**Testnet (`scripts/deploy-testnet.ts`):** 
Deploys mock tokens, minters, and routers alongside the APEX contracts.
```bash
npx hardhat run scripts/deploy-testnet.ts --network bscTestnet
```

**Mainnet (`scripts/deploy.ts`):** 
Deploys only the APEX contracts and points to live BNB Chain addresses (USDC, WBNB, asBNB, Router).
```bash
npx hardhat run scripts/deploy.ts --network bsc
```

### Pre-Deployment Checklist ⚠️
- **Gas:** Does the deployer wallet have sufficient BNB/tBNB?
- **Constructor Args:** Are the token addresses in `/lib/addresses.ts` 100% matching the deployed addresses?
- **Environment Variables:** 
  - `PRIVATE_KEY`
  - `BSCSCAN_API_KEY` (for contract verification)
  - `NEXT_PUBLIC_CHAIN_ID`
  - `NEXT_PUBLIC_GRAPH_URL`

## 3. Subgraph Deployment
The Graph Studio is used to deploy the subgraph.
1. Authenticate: `npx graph auth --studio <DEPLOY_KEY>`
2. Codegen: `npm run codegen`
3. Build: `npm run build`
4. Deploy: `npm run deploy`

### Subgraph Updates
If you redeploy the smart contracts to a new address:
1. Update the addresses in `subgraph.yaml`.
2. Update the `startBlock` to the block number where the new Vault was deployed (saves huge syncing time).
3. Re-run `npm run deploy` to index the new contracts.
