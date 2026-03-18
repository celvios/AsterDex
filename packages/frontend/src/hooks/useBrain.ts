import { useReadContract } from "wagmi";
import { APEX_BRAIN_ABI, getBrainAddress } from "@/lib/contracts";

export function useBrain() {
    const address = getBrainAddress();

    const { data: currentSplit }  = useReadContract({ address, abi: APEX_BRAIN_ABI, functionName: "currentSplit" });
    const { data: computedSplit } = useReadContract({ address, abi: APEX_BRAIN_ABI, functionName: "computeSplit" });
    const { data: regime }        = useReadContract({ address, abi: APEX_BRAIN_ABI, functionName: "currentRegime" });

    return { currentSplit, computedSplit, regime };
}
