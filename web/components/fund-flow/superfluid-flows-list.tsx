"use client"

import { useExistingFlows } from "@/lib/superfluid/use-existing-flows"
import type { SuperfluidFlowWithState } from "@/lib/superfluid/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import { useDeleteFlow } from "@/lib/erc20/super-token/use-delete-flow"
import { TokenLogo } from "@/app/token/token-logo"
import { formatTokenAmount, TOKENS, type TokenInfo } from "./libs/funding-token-lib"
import { EmptyState } from "../ui/empty-state"
import { useRouter } from "next/navigation"

interface SuperfluidFlowsListProps {
  address: string | undefined
  chainId: number
  receiver?: string
  token?: string
  maxItems?: number
  showTitle?: boolean
  tokens?: Record<string, TokenInfo>
}

export function SuperfluidFlowsList({
  address,
  chainId,
  receiver,
  token,
  maxItems = 5,
  showTitle = true,
  tokens = TOKENS,
}: SuperfluidFlowsListProps) {
  const { data: flows, error, mutate } = useExistingFlows(address, chainId)

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

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        Error loading streams
      </div>
    )
  }

  if (displayFlows.length === 0) {
    return (
      <div className="mt-10">
        <EmptyState
          size={100}
          title="No flows found"
          description="You are not funding any flows yet"
        />
      </div>
    )
  }

  return (
    <div className="space-y-3 border-t pt-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">You are funding</h4>
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
            tokens={tokens}
            address={address}
            mutate={mutate}
          />
        ))}
      </div>
    </div>
  )
}

interface SuperfluidFlowItemProps {
  flow: SuperfluidFlowWithState
  tokens: Record<string, TokenInfo>
  address: string
  mutate: () => void
}

function SuperfluidFlowItem({ flow, tokens, address, mutate }: SuperfluidFlowItemProps) {
  const router = useRouter()
  const { deleteFlow, isLoading: isDeleting } = useDeleteFlow({
    chainId: flow.chainId,
    superTokenAddress: flow.token as `0x${string}`,
    onSuccess: () => {
      setTimeout(() => {
        mutate()
        router.refresh()
      }, 2000)
    },
  })
  const flowRatePerSecond = BigInt(flow.flowRate)
  const flowRatePerMonth = flowRatePerSecond * BigInt(30 * 24 * 60 * 60) // 30 days in seconds

  // Try to find token info, fallback to basic display
  // Only match non-native tokens that have an address property
  const tokenInfo = Object.values(tokens).find(
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
    <Card className="group relative border-l-4 border-l-primary transition-colors hover:bg-muted/50">
      <CardContent className="p-2 md:p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tokenLogo ? (
              <TokenLogo src={tokenLogo} alt={tokenSymbol} size={20} />
            ) : (
              <div className="h-5 w-5 rounded-full bg-muted" />
            )}
            <div>
              <div className="text-xs text-muted-foreground">
                {displayRate} {tokenSymbol} per month
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Badge variant={flow.isActive ? "default" : "secondary"} className="text-[10px]">
              {flow.isActive ? "Active" : "Closed"}
            </Badge>
            {flow.isActive && (
              <div className="grid grid-cols-[0fr] transition-all duration-200 group-hover:grid-cols-[1fr]">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 overflow-hidden opacity-0 transition-all duration-200 group-hover:opacity-100"
                  onClick={() =>
                    deleteFlow(address as `0x${string}`, flow.receiver as `0x${string}`)
                  }
                  disabled={isDeleting}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
