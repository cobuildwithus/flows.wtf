import { ponder, type Context, type Event } from "ponder:registry"
import { formatEther, getAddress } from "viem"
import { grants } from "ponder:schema"
import { eq } from "ponder"
import { and } from "ponder"

const BATCH_SIZE = 10

ponder.on("TotalEarned:block", handleTotalEarned)

async function handleTotalEarned(params: {
  event: Event<"TotalEarned:block">
  context: Context<"TotalEarned:block">
}) {
  const { context } = params
  const blockTimestamp = Number(params.event.block.timestamp)

  const FIVE_MINUTES = 5 * 60
  const currentTime = Math.floor(Date.now() / 1000)
  if (currentTime - blockTimestamp < FIVE_MINUTES) {
    return
  }

  // Get active grants
  const activeGrants = await context.db.sql.query.grants.findMany({
    where: (grants) => and(eq(grants.isActive, true), eq(grants.isRemoved, false)),
    columns: {
      id: true,
      parentContract: true,
      recipient: true,
      isTopLevel: true,
    },
  })

  // Process grants in batches
  for (let i = 0; i < activeGrants.length; i += BATCH_SIZE) {
    const batch = activeGrants.slice(i, i + BATCH_SIZE)

    // Process batch in parallel
    const updates = await Promise.all(
      batch.map(async (grant) => {
        const { parentContract, recipient, isTopLevel, id } = grant

        let totalEarned = "0"
        if (!isTopLevel) {
          const total = await context.client.readContract({
            address: getAddress(parentContract),
            abi: [
              {
                inputs: [{ name: "member", type: "address" }],
                name: "getTotalReceivedByMember",
                outputs: [{ type: "uint256" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "getTotalReceivedByMember",
            args: [getAddress(recipient)],
          })
          totalEarned = formatEther(total)
        }

        return context.db.update(grants, { id }).set({
          totalEarned,
        })
      })
    )

    await Promise.all(updates)
  }
}
