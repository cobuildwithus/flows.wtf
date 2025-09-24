"use server"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserProfile } from "@/components/user-profile/user-profile"
import { getIncomingFlows } from "@/lib/superfluid/get-incoming-flows"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Currency } from "@/components/ui/currency"
import { Grant } from "@/lib/database/types"
import { getIncomingFlowFromSiblings } from "@/lib/superfluid/get-sibling-flow-connections"

interface IncomingFlowsListProps {
  flow: Grant
  maxItems?: number
  showTitle?: boolean
}

export async function IncomingFlowsList({
  flow,
  maxItems = 10,
  showTitle = true,
}: IncomingFlowsListProps) {
  const { recipient: flowContract, chainId, id } = flow
  const superfluidFlows = await getIncomingFlows(flowContract, chainId)
  const siblingFlows = await getIncomingFlowFromSiblings(flowContract, id, chainId)

  // Filter and sort active superfluid flows
  const activeFlows =
    superfluidFlows
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

  // Sibling flows: sort by flowRate descending, slice to maxItems
  const sortedSiblingFlows =
    siblingFlows?.sort((a, b) => {
      const aFlowRate = Number(a.flowRate)
      const bFlowRate = Number(b.flowRate)
      if (aFlowRate > bFlowRate) return -1
      if (aFlowRate < bFlowRate) return 1
      return 0
    }) || []
  const displaySiblingFlows = sortedSiblingFlows.slice(0, maxItems)

  // If both lists are empty, return null
  if (displayFlows.length === 0 && displaySiblingFlows.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 border-t pt-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Backers</h4>
          {(activeFlows.length > maxItems || sortedSiblingFlows.length > maxItems) && (
            <Badge variant="secondary" className="text-xs">
              +{activeFlows.length + sortedSiblingFlows.length - maxItems} more
            </Badge>
          )}
        </div>
      )}

      <div className="space-y-2">
        {displayFlows.map((superfluidFlow, index) => (
          <IncomingSuperfluidFlowItem
            key={`sf-${superfluidFlow.token}-${superfluidFlow.sender}-${superfluidFlow.receiver}-${index}`}
            flow={superfluidFlow}
            parentFlow={flow}
          />
        ))}
        {displaySiblingFlows.map((siblingFlow, index) => (
          <IncomingSiblingFlowItem
            key={`sib-${siblingFlow.id}-${index}`}
            flow={siblingFlow}
            parentFlow={flow}
          />
        ))}
      </div>
    </div>
  )
}

function IncomingSuperfluidFlowItem({
  flow,
  parentFlow,
}: {
  flow: {
    token: string
    sender: string
    receiver: string
    flowRate: string
  }
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
                    <Currency display={parentFlow} currency="ERC20">
                      {flowRatePerMonth.toString()}
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

function IncomingSiblingFlowItem({
  flow: { id, title, image, flowRate },
  parentFlow,
}: {
  flow: {
    id: string
    title: string
    image?: string | null
    flowRate: string
  }
  parentFlow: Grant
}) {
  return (
    <Card className="group relative border-l-4 border-l-primary/60 transition-colors hover:bg-muted/50">
      <CardContent className="p-2 md:p-3">
        <div className="flex items-center justify-between space-x-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-7">
              {image ? (
                <AvatarImage src={image} />
              ) : (
                <AvatarFallback>{title ? title.slice(0, 2) : "SB"}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <a
                href={`/flow/${id}`}
                className="max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium outline-none hover:underline focus:underline"
              >
                {title || "Sibling Flow"}
              </a>
              <div className="text-xs text-muted-foreground">
                <Currency display={parentFlow}>{String(flowRate)}</Currency>
                /mo
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            Flow
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
