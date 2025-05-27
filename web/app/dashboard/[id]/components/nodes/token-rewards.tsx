"use client"

import { Currency } from "@/components/ui/currency"
import { useUserRevnetBalance } from "@/lib/revnet/hooks/use-user-revnet-balance"
import { useRevnetTokenDetails } from "@/lib/revnet/hooks/use-revnet-token-details"

interface Props {
  projectId: bigint
  chainId: number
  userAddress: string | undefined
}

export function TokenRewards({ projectId, chainId, userAddress }: Props) {
  const { data, isLoading } = useUserRevnetBalance(projectId, chainId, userAddress)
  const { data: tokenDetails } = useRevnetTokenDetails(projectId, chainId)

  const tokenSymbol = tokenDetails?.symbol || ""

  if (!userAddress) {
    return (
      <div className="text-pretty text-sm text-muted-foreground">
        Connect wallet to see your rewards
      </div>
    )
  }

  const balance = data?.balance || "0"

  return (
    <div className="flex flex-col justify-between text-sm text-muted-foreground">
      <div>
        You hold{" "}
        {isLoading ? (
          <span className="font-medium">...</span>
        ) : Number(balance) > 0 ? (
          <strong>
            <Currency currency="ERC20">{balance}</Currency> {tokenSymbol}
          </strong>
        ) : (
          <span className="font-medium">0 {tokenSymbol}</span>
        )}{" "}
      </div>
    </div>
  )
}
