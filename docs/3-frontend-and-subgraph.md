# Frontend & Subgraph Integration

## The Frontend (`packages/frontend`)
Built with Next.js 14, React, viem, and wagmi.

### Key Components
- **`DepositWidget` & `WithdrawWidget`**: Handles user interactions. Critically, these widgets enforce that the user is on the correct network (checking `chainId`). If the user is on a wrong network (e.g., BNB Mainnet instead of BSC Testnet), the button switches to **"Switch Network"** and intercepts the transaction to prevent reverted calls.
- **Two-Step Approve & Deposit**: The `DepositWidget` correctly checks the vault's allowance to spend the user's USDC. If insufficient, the first transaction is an `Approve`, followed automatically by the `Deposit`.
- **`BrainStatus` & `ILProtectionScore`**: Reads live data tightly coupled to the `APEXBrain` state, translating raw BigInts to formatted decimals.
- **Charts (`recharts`)**: Populated exclusively by historical data pulled from The Graph.

### Styling Aesthetic
The frontend utilizes a custom "Dark Glassmorphism" aesthetic globally defined in `globals.css`:
- **Ambient Blobs**: Large, blurred, `mix-blend-mode: normal` circular gradients sitting behind the main layout.
- **`.glass-card` & `.liquid-glass`**: Linear directional gradients coupled with `backdrop-filter: blur`, bordered by highly opaque, asymmetrical white borders to achieve a refractive 3D effect.

## The Subgraph (`packages/subgraph`)
Built using The Graph Protocol.

### Architecture
- **`subgraph.yaml`**: Defines the data sources. It listens to the `APEXVault` and `APEXBrain` contracts.
- **`schema.graphql`**: Defines the entities (`Vault`, `HedgeSnapshot`, `DailySnapshot`, `Deposit`, `Withdraw`).
- **`mappings.ts`**: The AssemblyScript handlers that translate EVM events (`Deposit`, `HedgeSnapshotRecorded`) into GraphQL entities.

### What to check for (Troubleshooting)
1. **Empty Charts:** If the "Yield Breakdown" or "Hedge History" charts in the UI are empty, it means the Subgraph hasn't indexed any `HedgeSnapshotRecorded` events. *Solution: ensure `compound()` has been called at least once.*
2. **Stale Data:** Ensure the `NEXT_PUBLIC_GRAPH_URL` in `.env.local` points to your latest deployed studio version.
3. **Subgraph Syncing:** In The Graph Studio, check the progress bar. If it is stuck at 0%, ensure the `startBlock` in `subgraph.yaml` is not greater than the block where the contracts were actually deployed.
