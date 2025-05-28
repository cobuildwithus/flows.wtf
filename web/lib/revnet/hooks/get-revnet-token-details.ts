"use server"

import database from "@/lib/database/flows-db"

export async function getRevnetTokenDetails(
  projectId: bigint,
  chainId: number,
): Promise<{
  symbol: string | null
  name: string | null
  address: string | null
}> {
  try {
    const project = await database.juiceboxProject.findUnique({
      where: {
        chainId_projectId: {
          chainId,
          projectId: Number(projectId),
        },
      },
      select: {
        erc20Symbol: true,
        erc20Name: true,
        erc20: true,
      },
    })

    if (!project) {
      return { symbol: null, name: null, address: null }
    }

    return {
      symbol: project.erc20Symbol,
      name: project.erc20Name,
      address: project.erc20,
    }
  } catch (error) {
    console.error("Error fetching revnet token details:", error)
    return { symbol: null, name: null, address: null }
  }
}
