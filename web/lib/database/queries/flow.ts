"use server"

import database from "@/lib/database/edge"
import { cache } from "react"

export const getFlowWithGrants = cache(async (flowId: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id: flowId },
    include: {
      subgrants: {
        omit: { description: true },
        include: {
          derivedData: {
            select: { lastBuilderUpdate: true, overallGrade: true, title: true, coverImage: true },
          },
        },
        orderBy: { monthlyIncomingFlowRate: "desc" },
      },
      derivedData: true,
    },
  })
})

export const getFlow = cache(async (flowId: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id: flowId, isFlow: true },
  })
})

export type FlowWithGrants = Awaited<ReturnType<typeof getFlowWithGrants>>
