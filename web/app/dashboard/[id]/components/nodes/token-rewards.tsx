"use client"

import { useUserRevnetBalance } from "@/lib/revnet/hooks/use-user-revnet-balance"
import { useRevnetTokenDetails } from "@/lib/revnet/hooks/use-revnet-token-details"
import Link from "next/link"
import { useEffect, useState, useRef, useMemo } from "react"
import NumberFlow from "@number-flow/react"
import { cn } from "@/lib/utils"
import { AnimatedBenefits } from "../animated-benefits"

interface Props {
  projectId: bigint
  chainId: number
  userAddress: string | undefined
  extraRevnetTokens: string
  startupTitle: string
}

export function TokenRewards({
  projectId,
  chainId,
  userAddress,
  extraRevnetTokens,
  startupTitle,
}: Props) {
  const { data, isLoading } = useUserRevnetBalance(projectId, chainId, userAddress)
  const { data: tokenDetails } = useRevnetTokenDetails(projectId, chainId)

  const [isFlashing, setIsFlashing] = useState(false)
  const prevExtraTokensRef = useRef(extraRevnetTokens)

  const tokenSymbol = tokenDetails?.symbol || ""

  const balance = data?.balance || "0"
  const totalTokens = useMemo(() => {
    return Number(balance) / 1e18 + Number(extraRevnetTokens)
  }, [balance, extraRevnetTokens])

  useEffect(() => {
    // Detect if extraRevnetTokens increased
    if (Number(extraRevnetTokens) > Number(prevExtraTokensRef.current)) {
      setIsFlashing(true)
      setTimeout(() => setIsFlashing(false), 1000)
    }
    prevExtraTokensRef.current = extraRevnetTokens
  }, [extraRevnetTokens])

  if (!userAddress) {
    return <div className="text-pretty text-sm text-muted-foreground">Earn on every order</div>
  }

  return (
    <div className="flex flex-col">
      <Link
        href={`https://revda.sh/account/${userAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto text-sm text-muted-foreground transition-opacity hover:opacity-80"
      >
        <div>
          You {Number(extraRevnetTokens) > 0 ? "will" : ""} hold{" "}
          {isLoading ? (
            <span className="font-medium">...</span>
          ) : totalTokens > 0 ? (
            <strong
              className={cn(
                "transition-all duration-500 ease-in-out",
                isFlashing && "text-green-600 dark:text-green-400",
              )}
            >
              <NumberFlow
                value={totalTokens}
                format={{
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }}
                trend={isFlashing ? 1 : 0}
              />{" "}
              {tokenSymbol}
            </strong>
          ) : (
            <span className="font-medium">0 {tokenSymbol}</span>
          )}{" "}
        </div>
      </Link>
      {Number(extraRevnetTokens) > 0 && (
        <AnimatedBenefits startupTitle={startupTitle} projectId={projectId} chainId={chainId} />
      )}
    </div>
  )
}
