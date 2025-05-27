"use client"

import { EthInUsd } from "@/components/global/eth-in-usd"
import { useRevnetBalance } from "@/lib/revnet/hooks/use-revnet-balance"

interface Props {
  projectId: bigint
  chainId: number
}

export function Treasury({ projectId, chainId }: Props) {
  const { data, isLoading, error } = useRevnetBalance(projectId, chainId)

  if (error) {
    console.error("Error loading treasury balance:", error)
  }

  const balance = data?.balance ? BigInt(data.balance) : BigInt(0)
  const participantsCount = isLoading ? "..." : data?.participantsCount || 0

  return (
    <div className="flex flex-col justify-between text-sm text-muted-foreground">
      <div>
        {isLoading ? (
          <span className="font-medium">...</span>
        ) : (
          <strong>
            <EthInUsd amount={balance} />
          </strong>
        )}{" "}
        balance
      </div>
      <div>
        <strong className="font-medium">{participantsCount}</strong> owners
      </div>
    </div>
  )
}
