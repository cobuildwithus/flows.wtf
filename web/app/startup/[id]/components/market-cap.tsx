"use client"

import { getRevnetUrl } from "@/lib/revnet/revnet-lib"
import { Startup } from "@/lib/onchain-startup/startup"
import Link from "next/link"
import NumberFlow from "@number-flow/react"
import { useFlowsTreasuryBalance } from "@/lib/revnet/hooks/use-flows-revnet-balance"

interface Props {
  startup: Startup
  chainId: number
  revnetProjectId: number
}

export function MarketCap({ startup, chainId, revnetProjectId }: Props) {
  const { treasuryBalanceUSD, isLoading } = useFlowsTreasuryBalance(
    revnetProjectId,
    chainId,
    startup.isBackedByFlows,
  )

  return (
    <Link
      href={getRevnetUrl(chainId, revnetProjectId)}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
    >
      {isLoading ? (
        "..."
      ) : (
        <NumberFlow
          value={treasuryBalanceUSD}
          format={{
            currency: "USD",
            style: "currency",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }}
          locales="en-US"
        />
      )}
    </Link>
  )
}
