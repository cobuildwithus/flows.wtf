"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"

export const getRevnetHolders = unstable_cache(
  async (projectId: number, chainId: number): Promise<number> => {
    try {
      // First, find the project to get its suckerGroupId
      const project = await database.juiceboxProject.findUnique({
        where: {
          chainId_projectId: {
            chainId,
            projectId: Number(projectId),
          },
        },
        select: {
          suckerGroupId: true,
        },
      })

      if (!project?.suckerGroupId) {
        return 0
      }

      // Get all unique participants across all projects in the sucker group
      const participants = await database.juiceboxParticipant.findMany({
        where: {
          suckerGroupId: project.suckerGroupId,
        },
        select: {
          address: true,
          balance: true,
        },
        distinct: ["address"],
      })

      return participants.filter((p) => Number(p.balance) > 0).length
    } catch (error) {
      console.error("Error fetching revnet balance:", error)
      return 0
    }
  },
  ["revnet-holders"],
  {
    revalidate: 30, // Cache for 30 seconds
    tags: ["revnet-holders"],
  },
)
