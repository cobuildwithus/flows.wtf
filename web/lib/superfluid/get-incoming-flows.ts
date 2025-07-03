"use server"

import database from "@/lib/database/flows-db"
import type { SuperfluidFlowWithState } from "./types"

export async function getIncomingFlows(
  flowContract: string,
  chainId?: number,
): Promise<SuperfluidFlowWithState[]> {
  if (!flowContract) return []

  const flows = await database.superfluidFlow.findMany({
    where: {
      ...(chainId && { chainId }),
      receiver: flowContract.toLowerCase(),
    },
    orderBy: {
      lastUpdate: "desc",
    },
  })

  return flows.map((flow) => ({
    ...flow,
    isOutgoing: false,
    isIncoming: true,
    isActive: flow.flowRate !== "0" && !flow.closeTime,
  }))
}
