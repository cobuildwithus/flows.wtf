import { Badge } from "@/components/ui/badge"
import { useRevnetBalance } from "@/lib/revnet/hooks/use-revnet-balance"
import { getRevnetUrl } from "@/lib/revnet/revnet-lib"
import { Startup } from "@/lib/onchain-startup/startup"
import Link from "next/link"
import { useEffect, useState, useRef, useMemo } from "react"
import { useETHPrice } from "@/app/token/hooks/useETHPrice"
import NumberFlow from "@number-flow/react"
import { cn } from "@/lib/utils"

interface Props {
  startup: Startup
  chainId: number
  ethRaised: number
}

export function TreasuryTitle({ startup, chainId, ethRaised }: Props) {
  const { data, isLoading, error } = useRevnetBalance(
    BigInt(startup.revnetProjectIds.base),
    chainId,
  )
  const { ethPrice } = useETHPrice()

  const [isFlashing, setIsFlashing] = useState(false)
  const prevEthRaisedRef = useRef(ethRaised)

  if (error) {
    console.error("Error loading treasury balance:", error)
  }

  const balance = data?.balance ? BigInt(data.balance) : BigInt(0)
  const ethRaisedWei = BigInt(Math.floor(ethRaised * 1e18))

  // Convert to USD for display
  const balanceUSD = ethPrice ? (Number(balance) / 1e18) * ethPrice : 0
  const ethRaisedUSD = ethPrice ? (Number(ethRaisedWei) / 1e18) * ethPrice : 0
  const totalUSD = useMemo(() => balanceUSD + ethRaisedUSD, [balanceUSD, ethRaisedUSD])

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
        href={getRevnetUrl(chainId, Number(startup.revnetProjectIds.base))}
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
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }}
            locales="en-US"
            trend={isFlashing ? 1 : 0}
          />
        )}
      </Badge>
    </div>
  )
}
