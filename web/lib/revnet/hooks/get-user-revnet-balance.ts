"use server"

import { juiceboxDb } from "@/lib/database/juicebox-db"

export async function getUserRevnetBalance(
  projectId: bigint,
  chainId: number,
  userAddress: string,
): Promise<{
  balance: string
  projectsCount: number
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
      return { balance: "0", projectsCount: 0 }
    }

    // Get all projects with the same suckerGroupId
    const projects = await juiceboxDb.project.findMany({
      where: {
        suckerGroupId: project.suckerGroupId,
      },
      select: {
        chainId: true,
        projectId: true,
      },
    })

    // Get all participant records for this user across all projects in the sucker group
    const participants = await juiceboxDb.participant.findMany({
      where: {
        address: userAddress.toLowerCase(),
        OR: projects.map((p) => ({
          chainId: p.chainId,
          projectId: p.projectId,
        })),
      },
      select: {
        balance: true,
        chainId: true,
        projectId: true,
      },
    })

    // Sum all balances
    const totalBalance = participants.reduce((sum, p) => {
      return sum + Number(p.balance)
    }, 0)

    return {
      balance: totalBalance.toString(),
      projectsCount: participants.length,
    }
  } catch (error) {
    console.error("Error fetching user revnet balance:", error)
    return { balance: "0", projectsCount: 0 }
  }
}
