"use server"

import type { SuperfluidFlowWithState } from "@/lib/superfluid/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserProfile } from "@/components/user-profile/user-profile"
import { getIncomingFlows } from "@/lib/superfluid/get-incoming-flows"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Currency } from "@/components/ui/currency"
import { Grant } from "@prisma/flows"

interface IncomingFlowsListProps {
  parentFlow: Grant
  maxItems?: number
  showTitle?: boolean
}

export async function IncomingFlowsList({
  parentFlow,
  maxItems = 10,
  showTitle = true,
}: IncomingFlowsListProps) {
  const { recipient: flowContract, chainId } = parentFlow
  const flows = await getIncomingFlows(flowContract, chainId)

  const activeFlows =
    flows
      ?.filter((flow) => flow.isActive)
      .sort((a, b) => {
        // Sort by flow rate descending (highest first)
        const aFlowRate = BigInt(a.flowRate)
        const bFlowRate = BigInt(b.flowRate)
        if (aFlowRate > bFlowRate) return -1
        if (aFlowRate < bFlowRate) return 1
        return 0
      }) || []
  const displayFlows = activeFlows.slice(0, maxItems)

  if (displayFlows.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 border-t pt-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Backers</h4>
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
  parentFlow: Grant
}) {
  const flowRatePerSecond = BigInt(flow.flowRate)
  const flowRatePerMonth = flowRatePerSecond * BigInt(30 * 24 * 60 * 60) // 30 days in seconds

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
