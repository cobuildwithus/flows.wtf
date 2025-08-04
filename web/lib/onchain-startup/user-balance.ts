import { cache } from "react"
import { unstable_cache } from "next/cache"
import database from "../database/flows-db"

export const getUserBalance = unstable_cache(
  async (userAddress: string, chainId: number, projectId: number | null) => {
    if (!userAddress) return null
    if (!projectId) return null

    const participant = await database.juiceboxParticipant.findUnique({
      where: {
        chainId_projectId_address: {
          chainId,
          projectId,
          address: userAddress.toLowerCase(),
        },
      },
    })

    if (!participant) return 0

    return Number(participant.balance) / 10 ** 18
  },
  ["user-balance"],
  { revalidate: 60 },
)
