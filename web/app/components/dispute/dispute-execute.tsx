"use client"

import { Button } from "@/components/ui/button"
import {
  erc20VotesArbitratorImplAbi,
  erc20VotesMintableImplAbi,
  flowTcrImplAbi,
  nounsFlowImplAbi,
} from "@/lib/abis"
import { canDisputeBeExecuted } from "@/app/components/dispute/helpers"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Dispute } from "@prisma/flows"
import { useRouter } from "next/navigation"
import { base } from "viem/chains"

interface Props {
  arbitrator: `0x${string}`
  flowId: string
  dispute: Dispute
  className?: string
  size?: "default" | "sm"
}

export function DisputeExecuteButton(props: Props) {
  const { dispute, flowId, arbitrator, className, size = "default" } = props
  const router = useRouter()

  const { writeContract, prepareWallet } = useContractTransaction({
    onSuccess: async () => {
      // wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push(`/flow/${flowId}`)
    },
  })

  return (
    <Button
      className={className}
      type="button"
      size={size}
      disabled={!canDisputeBeExecuted(dispute)}
      onClick={async () => {
        await prepareWallet()

        writeContract({
          address: arbitrator,
          abi: [
            ...erc20VotesArbitratorImplAbi,
            ...erc20VotesMintableImplAbi,
            ...flowTcrImplAbi,
            ...nounsFlowImplAbi,
          ],
          functionName: "executeRuling",
          args: [BigInt(dispute.disputeId)],
          chainId: base.id,
        })
      }}
    >
      Execute
    </Button>
  )
}
