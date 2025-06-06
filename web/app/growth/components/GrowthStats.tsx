"use server"

import { cn } from "@/lib/utils"
import { Stat } from "@/app/item/[grantId]/cards/stats"
import type { Grant } from "@prisma/flows"
import { getTotalUsers } from "@/lib/database/queries/total-users"
import { TotalUsersExplainerDialog } from "./total-users-explainer"

interface Props {
  flow: Omit<Grant, "description">
  topLevelRecipientCount: number
  className?: string
}

export async function GrowthStats(props: Props) {
  const { flow, topLevelRecipientCount, className } = props

  const users = await getTotalUsers(flow.id, flow.isTopLevel, flow.erc20 as `0x${string}`)

  return (
    <div className={cn(className, "flex flex-col gap-4")}>
      <div className="grid grid-cols-12 gap-x-2 gap-y-4 py-1 lg:gap-x-4">
        {flow.isTopLevel && (
          <div className="col-span-full xl:col-span-3">
            <Stat label="Active projects">{topLevelRecipientCount}</Stat>
          </div>
        )}
        {!flow.isTopLevel && (
          <div className="col-span-full xl:col-span-3">
            <Stat label="Active projects">{flow.activeRecipientCount}</Stat>
          </div>
        )}
        {users && <TotalUsersExplainerDialog users={users} flow={flow} />}
      </div>
    </div>
  )
}
