import { NextResponse } from "next/server"
import { getBalanceFlowRatesWalletClient } from "@/lib/viem/walletClient"
import { NOUNS_FLOW } from "@/lib/config"
import { base } from "viem/chains"
import { waitForTransactionReceipt } from "viem/actions"
import { customFlowImplAbi } from "@/lib/abis"
import { getContract } from "viem"
import database from "@/lib/database/flows-db"
import { getClient } from "@/lib/viem/client"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

export async function GET() {
  try {
    const client = getBalanceFlowRatesWalletClient(base.id)

    const flows = await database.grant.findMany({
      where: {
        isFlow: true,
        flowId: { not: NOUNS_FLOW },
        id: { not: NOUNS_FLOW },
      },
    })

    let nUpdated = 0

    // Check each flow to see if it's too high and decrease if needed
    for (const flow of flows) {
      try {
        const contract = getContract({
          address: flow.id as `0x${string}`,
          abi: customFlowImplAbi,
          client: getClient(flow.chainId),
        })

        // Check if the flow rate is too high
        const isFlowRateTooHigh = await contract.read.isFlowRateTooHigh()

        if (isFlowRateTooHigh) {
          // Call decreaseFlowRate to balance the flow
          const tx = await client.writeContract({
            address: flow.id as `0x${string}`,
            abi: customFlowImplAbi,
            functionName: "decreaseFlowRate",
          })

          await waitForTransactionReceipt(client, {
            hash: tx,
          })

          nUpdated++
        }
      } catch (error) {
        console.error(`Error processing flow ${flow.id}:`, error)
        // Continue with other flows even if one fails
      }
    }

    return NextResponse.json({ success: true, nUpdated })
  } catch (error: any) {
    console.error({ error })
    return new Response(error.message, { status: 500 })
  }
}
