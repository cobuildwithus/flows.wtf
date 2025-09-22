import "server-only"

import database from "@/lib/database/flows-db"

export async function getVoters(contract: `0x${string}`, recipientId: string) {
  const voters = await database.$queryRaw<
    { allocator: `0x${string}`; allocations_count: BigInt }[]
  >`
         SELECT allocator, SUM(CAST("allocations_count" AS INTEGER)) as "allocations_count"
         FROM onchain."Allocation"
         WHERE "contract" = ${contract} AND "recipient_id" = ${recipientId}
         GROUP BY allocator    
        `

  return voters.map((v) => ({
    allocator: v.allocator,
    memberUnits: v.allocations_count.toString(),
  }))
}
