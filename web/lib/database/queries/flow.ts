"use server"

import database from "@/lib/database/flows-db"
import { cache } from "react"
import type { Grant } from "@/lib/database/types"
import type { DerivedData } from "@prisma/flows"

export const getFlowWithGrants = cache(
  async (
    id: string,
  ): Promise<
    Grant & {
      derivedData: DerivedData | null
      subgrants: Array<
        Omit<Grant, "description"> & {
          derivedData: Pick<
            DerivedData,
            "lastBuilderUpdate" | "overallGrade" | "title" | "coverImage" | "minimumSalary"
          > | null
        }
      >
    }
  > => {
    const result = await database.grant.findFirstOrThrow({
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
    return result as unknown as Grant & {
      derivedData: DerivedData | null
      subgrants: Array<
        Omit<Grant, "description"> & {
          derivedData: Pick<
            DerivedData,
            "lastBuilderUpdate" | "overallGrade" | "title" | "coverImage" | "minimumSalary"
          > | null
        }
      >
    }
  },
)

export const getFlow = cache(async (id: string): Promise<Grant> => {
  const result = await database.grant.findFirstOrThrow({
    where: { id, isFlow: true },
  })
  return result as unknown as Grant
})

export type FlowWithGrants = Awaited<ReturnType<typeof getFlowWithGrants>>
