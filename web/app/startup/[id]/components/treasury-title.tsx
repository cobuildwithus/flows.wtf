import { Badge } from "@/components/ui/badge"
import { getRevnetUrl } from "@/lib/revnet/revnet-lib"
import { Startup } from "@/lib/onchain-startup/startup"
import Link from "next/link"
import { useEffect, useState, useRef, useMemo } from "react"
import { useETHPrice } from "@/app/token/hooks/useETHPrice"
import NumberFlow from "@number-flow/react"
import { cn } from "@/lib/utils"
import { useFlowsTreasuryBalance } from "@/lib/revnet/hooks/use-flows-revnet-balance"

interface Props {
  startup: Startup
  chainId: number
  ethRaised: number
  revnetProjectId: number
}

export function TreasuryTitle({ startup, chainId, ethRaised, revnetProjectId }: Props) {
  const { ethPrice } = useETHPrice()

  const { treasuryBalanceUSD, isLoading, error } = useFlowsTreasuryBalance(
    revnetProjectId,
    chainId,
    startup.isBackedByFlows,
  )

  const [isFlashing, setIsFlashing] = useState(false)
  const prevEthRaisedRef = useRef(ethRaised)

  if (error) {
    console.error("Error loading treasury balance:", error)
  }

  // Convert ethRaised to USD for display
  const ethRaisedUSD = ethPrice ? ethRaised * ethPrice : 0
  const totalUSD = useMemo(
    () => treasuryBalanceUSD + ethRaisedUSD,
    [treasuryBalanceUSD, ethRaisedUSD],
  )

  useEffect(() => {
    // Detect if ethRaised increased
    if (ethRaised > prevEthRaisedRef.current) {
      setIsFlashing(true)
      setTimeout(() => setIsFlashing(false), 1000)
    }
    prevEthRaisedRef.current = ethRaised
  }, [ethRaised])

  return (
    <div className="flex w-full items-center justify-between gap-1 text-base">
      <Link
        href={getRevnetUrl(chainId, revnetProjectId)}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        Treasury
      </Link>
      <Badge
        className={cn(
          "text-sm transition-all duration-500 ease-in-out",
          isFlashing && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        )}
        variant="secondary"
      >
        {isLoading ? (
          "..."
        ) : (
          <NumberFlow
            value={totalUSD}
            format={{
              currency: "USD",
              style: "currency",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }}
            locales="en-US"
            trend={isFlashing ? 1 : 0}
          />
        )}
      </Badge>
    </div>
  )
}
