import { useReadContract } from "wagmi";
import { APEX_VAULT_ABI, getVaultAddress } from "@/lib/contracts";

export function useVault() {
    const address = getVaultAddress();

    const { data: totalAssets }    = useReadContract({ address, abi: APEX_VAULT_ABI, functionName: "totalAssets" });
    const { data: pricePerShare }  = useReadContract({ address, abi: APEX_VAULT_ABI, functionName: "pricePerShare" });
    const { data: latestSnapshot } = useReadContract({ address, abi: APEX_VAULT_ABI, functionName: "latestHedgeSnapshot" });
    const { data: historyLength }  = useReadContract({ address, abi: APEX_VAULT_ABI, functionName: "hedgeHistoryLength" });

    return { totalAssets, pricePerShare, latestSnapshot, historyLength };
}
