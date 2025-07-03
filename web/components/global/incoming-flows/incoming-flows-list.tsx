"use server"

import type { SuperfluidFlowWithState } from "@/lib/superfluid/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { UserProfile } from "@/components/user-profile/user-profile"
import {
  formatTokenAmount,
  TOKENS,
  type TokenInfo,
} from "@/components/fund-flow/libs/funding-token-lib"
import { getIncomingFlows } from "@/lib/superfluid/get-incoming-flows"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { FlowWithGrants } from "@/lib/database/queries/flow"
import { Currency } from "@/components/ui/currency"

interface IncomingFlowsListProps {
  parentFlow: FlowWithGrants
  maxItems?: number
  showTitle?: boolean
  tokens?: Record<string, TokenInfo>
}

export async function IncomingFlowsList({
  parentFlow,
  maxItems = 10,
  showTitle = true,
  tokens = TOKENS,
}: IncomingFlowsListProps) {
  const { recipient: flowContract, chainId } = parentFlow
  const flows = await getIncomingFlows(flowContract, chainId)

  const activeFlows = flows?.filter((flow) => flow.isActive) || []
  const displayFlows = activeFlows.slice(0, maxItems)

  if (displayFlows.length === 0) {
    return (
      <EmptyState
        title="No funding contributors"
        description="This flow has no active contributors yet"
      />
    )
  }

  return (
    <div className="space-y-3 border-t pt-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Funding Contributors</h4>
          {activeFlows.length > maxItems && (
            <Badge variant="secondary" className="text-xs">
              +{activeFlows.length - maxItems} more
            </Badge>
          )}
        </div>
      )}

      <div className="space-y-2">
        {displayFlows.map((flow, index) => (
          <IncomingFlowItem
            key={`${flow.token}-${flow.sender}-${flow.receiver}-${index}`}
            flow={flow}
            parentFlow={parentFlow}
          />
        ))}
      </div>
    </div>
  )
}

function IncomingFlowItem({
  flow,
  parentFlow,
}: {
  flow: SuperfluidFlowWithState
  parentFlow: FlowWithGrants
}) {
  const flowRatePerSecond = BigInt(flow.flowRate)
  const flowRatePerMonth = flowRatePerSecond * BigInt(30 * 24 * 60 * 60) // 30 days in seconds

  const symbol = parentFlow.underlyingTokenSymbol
  const decimals = parentFlow.underlyingTokenDecimals

  const displayRate = formatTokenAmount(flowRatePerMonth, decimals, symbol)

  return (
    <Card className="group relative border-l-4 border-l-primary transition-colors hover:bg-muted/50">
      <CardContent className="p-2 md:p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserProfile withPopover={false} address={flow.sender as `0x${string}`}>
              {(profile) => (
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={profile.pfp_url} />
                    <AvatarFallback>{profile.display_name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium">{profile.display_name}</div>
                  <div className="text-xs text-muted-foreground">
                    <Currency flow={parentFlow} currency="ERC20">
                      {flowRatePerMonth}
                    </Currency>
                    /mo
                  </div>
                </div>
              )}
            </UserProfile>
          </div>

          <Badge variant="default" className="text-[10px]">
            Active
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
