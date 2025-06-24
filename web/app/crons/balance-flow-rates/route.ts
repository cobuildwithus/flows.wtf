import { NextResponse } from "next/server"
import { getBalanceFlowRatesWalletClient } from "@/lib/viem/walletClient"
import { NOUNS_FLOW } from "@/lib/config"
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
    const { chainId } = await database.grant.findFirstOrThrow({
      where: { id: NOUNS_FLOW },
      select: { chainId: true },
    })

    const client = getBalanceFlowRatesWalletClient(chainId)

    let nUpdated = 0

    const contract = getContract({
      address: NOUNS_FLOW,
      abi: nounsFlowImplAbi,
      client: getClient(chainId),
    })

    // Read the number of child flows that are out of sync
    const childFlowRatesOutOfSync = await contract.read.childFlowRatesOutOfSync()

    if (childFlowRatesOutOfSync > 0) {
      // Limit to max 5 updates
      const updateCount = childFlowRatesOutOfSync > BigInt(5) ? BigInt(5) : childFlowRatesOutOfSync

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

    return NextResponse.json({ success: true, nUpdated })
  } catch (error: any) {
    console.error({ error })
    return new Response(error.message, { status: 500 })
  }
}
