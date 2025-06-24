"use client"

import { canRequestBeExecuted } from "@/app/components/dispute/helpers"
import { Button } from "@/components/ui/button"
import { erc20VotesMintableImplAbi, flowTcrImplAbi, nounsFlowImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import type { Grant } from "@prisma/flows"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Address } from "viem"
import { base } from "viem/chains"

interface Props {
  grant: Omit<Grant, "description">
  flow: Omit<Grant, "description">
  className?: string
  size?: "default" | "sm"
}

export function RequestExecuteButton(props: Props) {
  const { grant, flow, className, size = "default" } = props
  const router = useRouter()

  const { writeContract, prepareWallet, toastId } = useContractTransaction({
    onSuccess: async () => {
      // wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 2000))
      router.push(`/flow/${flow.id}`)
    },
    chainId: flow.chainId,
  })

  return (
    <Button
      type="button"
      disabled={!canRequestBeExecuted(grant)}
      className={className}
      size={size}
      onClick={async () => {
        await prepareWallet()

        if (!flow.tcr) {
          toast.error("You cannot execute a grant in this flow. No TCR found.", { id: toastId })
          return
        }

        writeContract({
          address: getEthAddress(flow.tcr),
          abi: [...flowTcrImplAbi, ...nounsFlowImplAbi, ...erc20VotesMintableImplAbi],
          functionName: "executeRequest",
          args: [grant.id as Address],
          chainId: base.id,
        })
      }}
    >
      Execute
    </Button>
  )
}
