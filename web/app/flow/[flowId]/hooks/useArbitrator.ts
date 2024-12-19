import { useReadContract } from "wagmi"
import { flowTcrImplAbi } from "@/lib/abis"

export const useArbitrator = (tcrAddress: `0x${string}`) => {
  const { data: arbitrator } = useReadContract({
    address: tcrAddress,
    abi: flowTcrImplAbi,
    functionName: "arbitrator",
  })

  return arbitrator
}
