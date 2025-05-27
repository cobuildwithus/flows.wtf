"use client"

import { Currency } from "@/components/ui/currency"
import { Skeleton } from "@/components/ui/skeleton"
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

  if (isLoading) {
    return <Skeleton height={75} />
  }

  const balance = data?.balance || "0"

  return (
    <div className="space-y-2">
      {data && Number(balance) > 0 && (
        <div className="rounded-md bg-muted/50 p-3">
          <div className="text-xs text-muted-foreground">Your balance</div>
          <div className="mt-1 text-lg font-semibold">
            <Currency currency="ERC20">{balance}</Currency> {tokenSymbol}
          </div>
        </div>
      )}
    </div>
  )
}
