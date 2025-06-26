"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"
import type { SuperfluidFlowWithState } from "./types"

export async function getExistingFlows(
  address: string | undefined,
  chainId?: number,
): Promise<SuperfluidFlowWithState[]> {
  if (!address) return []

  return unstable_cache(
    async () => {
      const flows = await database.superfluidFlow.findMany({
        where: {
          ...(chainId && { chainId }),
          OR: [{ sender: address.toLowerCase() }, { receiver: address.toLowerCase() }],
        },
        orderBy: {
          lastUpdate: "desc",
        },
      })

      return flows.map((flow) => ({
        ...flow,
        isOutgoing: flow.sender.toLowerCase() === address.toLowerCase(),
        isIncoming: flow.receiver.toLowerCase() === address.toLowerCase(),
        isActive: flow.flowRate !== "0" && !flow.closeTime,
      }))
    },
    [`existing-flows-${address?.toLowerCase()}-${chainId || "all"}`],
    { revalidate: 30 }, // Cache for 30 seconds
  )()
}
