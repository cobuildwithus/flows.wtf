"use client"

import { useExistingFlows } from "@/lib/superfluid/use-existing-flows"
import type { SuperfluidFlowWithState } from "@/lib/superfluid/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatUnits } from "viem"
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"
import { TokenLogo } from "@/app/token/token-logo"
import { formatTokenAmount, TOKENS } from "./libs/funding-token-lib"

interface SuperfluidFlowsListProps {
  address: string | undefined
  chainId?: number
  receiver?: string
  token?: string
  maxItems?: number
  showTitle?: boolean
}

export function SuperfluidFlowsList({
  address,
  chainId,
  receiver,
  token,
  maxItems = 5,
  showTitle = true,
}: SuperfluidFlowsListProps) {
  const { data: flows, isLoading, error } = useExistingFlows(address, chainId)

  if (!address) return null

  // Filter flows based on provided parameters
  const filteredFlows =
    flows?.filter((flow) => {
      if (receiver && flow.receiver.toLowerCase() !== receiver.toLowerCase()) return false
      if (token && flow.token.toLowerCase() !== token.toLowerCase()) return false
      return true
    }) || []

  // Limit the number of items displayed
  const displayFlows = filteredFlows.slice(0, maxItems)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {showTitle && <h4 className="text-sm font-medium">Existing Streams</h4>}
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" height={64} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        Error loading streams
      </div>
    )
  }

  if (displayFlows.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-muted-foreground">No existing streams found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Existing flow</h4>
          {filteredFlows.length > maxItems && (
            <Badge variant="secondary" className="text-xs">
              +{filteredFlows.length - maxItems} more
            </Badge>
          )}
        </div>
      )}

      <div className="space-y-2">
        {displayFlows.map((flow, index) => (
          <SuperfluidFlowItem
            key={`${flow.token}-${flow.sender}-${flow.receiver}-${index}`}
            flow={flow}
          />
        ))}
      </div>
    </div>
  )
}

interface SuperfluidFlowItemProps {
  flow: SuperfluidFlowWithState
}

function SuperfluidFlowItem({ flow }: SuperfluidFlowItemProps) {
  const flowRatePerSecond = BigInt(flow.flowRate)
  const flowRatePerMonth = flowRatePerSecond * BigInt(30 * 24 * 60 * 60) // 30 days in seconds

  // Try to find token info, fallback to basic display
  // Only match non-native tokens that have an address property
  const tokenInfo = Object.values(TOKENS).find(
    (token) =>
      !token.isNative &&
      "address" in token &&
      typeof token.address === "string" &&
      token.address.toLowerCase() === flow.token.toLowerCase() &&
      token.chainId === flow.chainId,
  )

  const tokenSymbol = tokenInfo?.symbol || "TOKEN"
  const tokenDecimals = tokenInfo?.decimals || 18
  const tokenLogo = tokenInfo?.logo

  const displayRate = formatTokenAmount(flowRatePerMonth, tokenDecimals, tokenSymbol)

  return (
    <Card className="border-l-4 border-l-primary transition-colors hover:bg-muted/50">
      <CardContent className="p-2 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tokenLogo && <TokenLogo src={tokenLogo} alt={tokenSymbol} size={20} />}
            <div>
              <div className="text-xs text-muted-foreground">
                {displayRate} {tokenSymbol}/mo
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={flow.isActive ? "default" : "secondary"} className="text-xs">
              {flow.isActive ? "Active" : "Closed"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
