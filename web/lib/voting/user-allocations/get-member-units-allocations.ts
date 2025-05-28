"use server"

import { PERCENTAGE_SCALE } from "@/lib/config"
import database from "@/lib/database/flows-db"

export async function getMemberUnitsAllocations(flowId: string, address: `0x${string}` | null) {
  if (!address) return []

  const flow = await database.grant.findUnique({
    where: {
      id: flowId,
      allocator: address.toLowerCase(),
    },
  })

  if (!flow) return []

  const allocations = await database.grant.findMany({
    select: {
      bonusMemberUnits: true,
      baselineMemberUnits: true,
      recipientId: true,
    },
    where: {
      flowId: flow.id,
      isActive: true,
    },
    distinct: ["recipientId"],
  })

  const totalMemberUnits = allocations.reduce(
    (acc, allocation) =>
      acc + Number(allocation.bonusMemberUnits) + Number(allocation.baselineMemberUnits),
    0,
  )

  return allocations.map((allocation) => ({
    ...allocation,
    bps:
      (((Number(allocation.bonusMemberUnits) + Number(allocation.baselineMemberUnits)) /
        totalMemberUnits) *
        PERCENTAGE_SCALE) /
      100,
  }))
}
