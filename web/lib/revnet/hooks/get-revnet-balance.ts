"use server"

import { juiceboxDb } from "@/lib/database/juicebox-db"

export async function getRevnetBalance(
  projectId: bigint,
  chainId: number,
): Promise<{
  balance: string
  participantsCount: number
}> {
  try {
    // First, find the project to get its suckerGroupId
    const project = await juiceboxDb.project.findUnique({
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
      return { balance: "0", participantsCount: 0 }
    }

    // Get all projects with the same suckerGroupId
    const projects = await juiceboxDb.project.findMany({
      where: {
        suckerGroupId: project.suckerGroupId,
      },
      select: {
        balance: true,
        chainId: true,
        projectId: true,
      },
    })

    // Sum all balances
    const totalBalance = projects.reduce((sum, p) => {
      return sum + Number(p.balance)
    }, 0)

    // Get all unique participants across all projects in the sucker group
    const participants = await juiceboxDb.participant.findMany({
      where: {
        OR: projects.map((p) => ({
          chainId: p.chainId,
          projectId: p.projectId,
        })),
      },
      select: {
        address: true,
      },
      distinct: ["address"],
    })

    return {
      balance: totalBalance.toString(),
      participantsCount: participants.length,
    }
  } catch (error) {
    console.error("Error fetching revnet balance:", error)
    return { balance: "0", participantsCount: 0 }
  }
}
