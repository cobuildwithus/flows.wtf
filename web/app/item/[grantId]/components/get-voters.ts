import "server-only"

import database from "@/lib/database/flows-db"

export async function getVoters(contract: `0x${string}`, recipientId: string) {
  const voters = await database.$queryRaw<{ allocator: `0x${string}`; member_units: BigInt }[]>`
         SELECT allocator, SUM(CAST("member_units" AS INTEGER)) as "member_units"
         FROM onchain."Allocation"
         WHERE "contract" = ${contract} AND "recipient_id" = ${recipientId}
         GROUP BY allocator    
        `

  return voters.map((v) => ({
    allocator: v.allocator,
    memberUnits: v.member_units.toString(),
  }))
}
