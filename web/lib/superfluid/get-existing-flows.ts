"use server"

import database from "@/lib/database/flows-db"
import type { SuperfluidFlowWithState } from "./types"

export async function getExistingFlows(
  address: string | undefined,
  chainId?: number,
): Promise<SuperfluidFlowWithState[]> {
  if (!address) return []

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
}
