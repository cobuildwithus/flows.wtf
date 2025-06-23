import { ponder, type Context, type Event } from "ponder:registry"
import { formatEther, getAddress, zeroAddress } from "viem"
import { grants } from "ponder:schema"

const BATCH_SIZE = 20

ponder.on("TotalEarned:block", handleTotalEarned)

async function handleTotalEarned(params: {
  event: Event<"TotalEarned:block">
  context: Context<"TotalEarned:block">
}) {
  const { context } = params
  const chainId = context.chain.id

  // Get active grants
  const activeGrants = await context.db.sql.query.grants.findMany({
    where: (table, { eq }) => eq(table.chainId, chainId),
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
        const { parentContract, recipient, id } = grant

        let totalEarned = "0"
        if (parentContract !== zeroAddress) {
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
