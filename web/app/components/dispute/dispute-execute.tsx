"use client"

import { Button } from "@/components/ui/button"
import {
  erc20VotesArbitratorImplAbi,
  erc20VotesMintableImplAbi,
  flowTcrImplAbi,
  nounsFlowImplAbi,
} from "@/lib/abis"
import { canDisputeBeExecuted } from "@/app/components/dispute/helpers"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Dispute, Grant } from "@prisma/flows"
import { useRouter } from "next/navigation"
import { base } from "viem/chains"

interface Props {
  flow: Pick<Grant, "id" | "arbitrator">
  dispute: Dispute
  className?: string
  size?: "default" | "sm"
}

export function DisputeExecuteButton(props: Props) {
  const { dispute, flow, className, size = "default" } = props
  const router = useRouter()

  const { writeContract, prepareWallet } = useContractTransaction({
    onSuccess: async () => {
      // wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push(`/flow/${flow.id}`)
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
          address: getEthAddress(flow.arbitrator),
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
