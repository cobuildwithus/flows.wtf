import { NextResponse } from "next/server"
import { getBalanceFlowRatesWalletClient } from "@/lib/viem/walletClient"
import { waitForTransactionReceipt } from "viem/actions"
import { nounsFlowImplAbi } from "@/lib/abis"
import { getContract } from "viem"
import database from "@/lib/database/flows-db"
import { getClient } from "@/lib/viem/client"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

export async function GET() {
  try {
    const flows = await database.grant.findMany({
      where: {
        isFlow: true,
        isActive: true,
        monthlyOutgoingFlowRate: {
          not: "0",
        },
      },
    })

    let nUpdated = 0

    // Process each flow using its chainId
    for (const flow of flows) {
      console.log("Working on flow", flow.title)
      const client = getBalanceFlowRatesWalletClient(flow.chainId)

      try {
        const contract = getContract({
          address: flow.id as `0x${string}`,
          abi: nounsFlowImplAbi,
          client: getClient(flow.chainId),
        })

        // Read the number of child flows that are out of sync
        const childFlowRatesOutOfSync = await contract.read.childFlowRatesOutOfSync()

        if (childFlowRatesOutOfSync > 0) {
          console.log("Flow", flow.title, "has", childFlowRatesOutOfSync, "child flows out of sync")
          // Limit to max 5 updates
          const updateCount =
            childFlowRatesOutOfSync > BigInt(5) ? BigInt(5) : childFlowRatesOutOfSync

          // Call workOnChildFlowsToUpdate with the count
          const tx = await client.writeContract({
            address: contract.address,
            abi: nounsFlowImplAbi,
            functionName: "workOnChildFlowsToUpdate",
            args: [updateCount],
          })

          await waitForTransactionReceipt(client, {
            hash: tx,
          })

          nUpdated += Number(updateCount)
        }
      } catch (flowError: any) {
        console.error(`Error processing flow ${flow.id}:`, flowError)
        // Continue processing other flows even if one fails
      }
    }

    return NextResponse.json({ success: true, nUpdated })
  } catch (error: any) {
    console.error({ error })
    return new Response(error.message, { status: 500 })
  }
}
