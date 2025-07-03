"use server"

import database from "@/lib/database/flows-db"
import { cache } from "react"

export const getFlowWithGrants = cache(async (id: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id },
    include: {
      subgrants: {
        omit: { description: true },
        include: {
          derivedData: {
            select: {
              lastBuilderUpdate: true,
              overallGrade: true,
              title: true,
              coverImage: true,
              minimumSalary: true,
            },
          },
        },
        orderBy: { monthlyIncomingFlowRate: "desc" },
      },
      derivedData: true,
    },
  })
})

export const getFlow = cache(async (id: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id, isFlow: true },
  })
})

export type FlowWithGrants = Awaited<ReturnType<typeof getFlowWithGrants>>
