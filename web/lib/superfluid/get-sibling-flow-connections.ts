"use server"

import database from "@/lib/database/flows-db"

export async function getIncomingFlowFromSiblings(
  flowContract: string,
  receiverFlowId: string,
  chainId?: number,
) {
  if (!flowContract) return []

  const flows = await database.grant.findMany({
    where: {
      ...(chainId && { chainId }),
      recipient: flowContract.toLowerCase(),
      id: { not: receiverFlowId },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      recipient: true,
      title: true,
      image: true,
      parentContract: true,
      flow: {
        select: {
          id: true,
          title: true,
          image: true,
        },
      },
      monthlyIncomingFlowRate: true,
    },
  })

  return flows.map((flow) => ({
    ...flow.flow,
    flowRate: String(flow.monthlyIncomingFlowRate),
  }))
}
