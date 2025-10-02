import { ponder, type Context, type Event } from "ponder:registry"
import { getAddress, zeroAddress } from "viem"
import { isBlockRecent } from "../utils"
import { grants } from "ponder:schema"

const BATCH_SIZE = 20

ponder.on("TotalEarned:block", handleTotalEarned)

async function handleTotalEarned(params: {
  event: Event<"TotalEarned:block">
  context: Context<"TotalEarned:block">
}) {
  const { context, event } = params
  // Skip during backfill; only run near tip-of-chain
  if (!isBlockRecent(event.block.timestamp)) return
  const chainId = context.chain.id

  // Track total payout per parent flow in wei for accuracy
  const parentTotals: Record<string, bigint> = {}

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

    // Prepare multicall contracts for all non-zero parent contracts
    const contracts = batch
      .filter((g) => g.parentContract !== zeroAddress)
      .map((g) => ({
        address: getAddress(g.parentContract),
        abi: [
          {
            type: "function" as const,
            name: "getTotalReceivedByMember" as const,
            stateMutability: "view" as const,
            inputs: [{ name: "member", type: "address" as const }],
            outputs: [{ type: "uint256" as const }],
          },
        ],
        functionName: "getTotalReceivedByMember" as const,
        args: [getAddress(g.recipient)] as const,
      }))

    const results = contracts.length
      ? await context.client.multicall({
          contracts,
          allowFailure: true,
        })
      : ([] as const)

    // Map results back to batch grants
    let callIndex = 0
    const updates = batch.map((grant) => {
      const { parentContract, id } = grant

      let totalEarned = 0n
      if (parentContract !== zeroAddress) {
        const res = results[callIndex++]
        const total =
          res && (res as any).status === "success" ? ((res as any).result as bigint) : 0n
        totalEarned = total

        // Accumulate payout for the parent flow
        parentTotals[parentContract] = (parentTotals[parentContract] || 0n) + total
      }

      return context.db.update(grants, { id }).set({
        totalEarned,
      })
    })

    await Promise.all(updates)
  }

  // After all grants have been processed, update totalPaidOut for parent flows
  const parentUpdates = Object.entries(parentTotals).map(([parentContract, totalWei]) => {
    return context.db.update(grants, { id: parentContract }).set({
      totalPaidOut: totalWei,
    })
  })

  await Promise.all(parentUpdates)
}
