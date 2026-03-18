import { BigInt } from "@graphprotocol/graph-ts";
import {
    Deposited,
    Withdrawn,
    HedgeSnapshotRecorded,
} from "../generated/APEXVault/APEXVault";
import {
    Compounded,
} from "../generated/APEXCompounder/APEXCompounder";
import {
    SplitUpdated,
} from "../generated/APEXBrain/APEXBrain";
import {
    HedgeSnapshot,
    CompoundEvent,
    SplitUpdate,
    VaultDeposit,
    VaultWithdraw,
} from "../generated/schema";

// ── APEXVault Events ─────────────────────────────────────────

export function handleDeposited(event: Deposited): void {
    const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
    const entity = new VaultDeposit(id);

    entity.timestamp = event.params.timestamp;
    entity.user      = event.params.user;
    entity.assets    = event.params.assets;
    entity.shares    = event.params.shares;

    entity.save();
}

export function handleWithdrawn(event: Withdrawn): void {
    const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
    const entity = new VaultWithdraw(id);

    entity.timestamp = event.params.timestamp;
    entity.user      = event.params.user;
    entity.assets    = event.params.assets;
    entity.shares    = event.params.shares;

    entity.save();
}

export function handleHedgeSnapshotRecorded(event: HedgeSnapshotRecorded): void {
    const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
    const entity = new HedgeSnapshot(id);

    entity.timestamp       = event.params.timestamp;
    entity.ilAmount        = event.params.il;
    entity.hedgeBuffer     = event.params.buffer;
    entity.hedgeEfficiency = event.params.efficiency;
    entity.stakingBps      = event.params.stakingBps;

    entity.save();
}

// ── APEXCompounder Events ────────────────────────────────────

export function handleCompounded(event: Compounded): void {
    const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
    const entity = new CompoundEvent(id);

    entity.timestamp      = event.params.timestamp;
    entity.totalHarvested = event.params.totalHarvested;
    entity.toStaking      = event.params.toStaking;
    entity.toBuffer       = event.params.toBuffer;
    entity.callerBounty   = event.params.callerBounty;
    entity.caller         = event.params.caller;

    entity.save();
}

// ── APEXBrain Events ─────────────────────────────────────────

export function handleSplitUpdated(event: SplitUpdated): void {
    const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
    const entity = new SplitUpdate(id);

    entity.timestamp  = event.block.timestamp;
    entity.stakingBps = event.params.newStakingBps;
    entity.bufferBps  = event.params.newBufferBps;
    entity.ilBps      = event.params.ilBps;
    entity.regime     = event.params.regime;

    entity.save();
}
