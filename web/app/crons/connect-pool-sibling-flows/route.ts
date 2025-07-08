import { NextResponse } from "next/server"
import { getContract } from "viem"
import { waitForTransactionReceipt } from "viem/actions"
import database from "@/lib/database/flows-db"
import { getClient } from "@/lib/viem/client"
import { getBalanceFlowRatesWalletClient } from "@/lib/viem/walletClient"
import { gdav1ForwarderAbi, gdav1ForwarderAddress } from "@/lib/abis"
import { saveOrGet } from "@/lib/kv/kvStore"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

// The pool fields to check on the parent flow contract, as per flows.prisma
const POOL_FIELDS = ["bonusPool", "baselinePool"] as const

export async function GET() {
  try {
    // Pull all flows where isSiblingFlow is true, and get their parent contract and pool addresses
    const siblingFlows = await database.grant.findMany({
      where: {
        isSiblingFlow: true,
      },
      select: {
        flowId: true,
        chainId: true,
        parentContract: true,
        recipient: true,
        flow: {
          select: {
            bonusPool: true,
            baselinePool: true,
          },
        },
      },
    })

    let nUpdated = 0

    console.log({ siblingFlows })

    for (const flow of siblingFlows) {
      // Use a unique key for this flow to track if we've already worked on it
      const kvKey = `connect-pool-sibling-flows-v2:${flow.recipient}`
      const alreadyProcessed = await saveOrGet(kvKey, false)
      if (alreadyProcessed) {
        continue
      }

      let didConnect = false

      for (const poolField of POOL_FIELDS) {
        const poolAddress = flow.flow[poolField]
        console.log({ flow })
        console.log({ poolAddress })
        if (!poolAddress) continue

        try {
          const gdav1Forwarder = gdav1ForwarderAddress[8453]
          const flowAddress = flow.recipient as `0x${string}`
          const client = getClient(flow.chainId)
          // Check if the sibling flow is connected as a member to this pool
          const gdav1ForwarderContract = getContract({
            address: gdav1Forwarder,
            abi: gdav1ForwarderAbi,
            client,
          })

          // isMemberConnected(address member) returns bool
          const isConnected: boolean = await gdav1ForwarderContract.read.isMemberConnected([
            poolAddress as `0x${string}`,
            flowAddress,
          ])

          if (!isConnected) {
            // Connect the sibling flow to the pool
            //todo update to use another walelt client in future
            const walletClient = getBalanceFlowRatesWalletClient(flow.chainId)
            const tx = await walletClient.writeContract({
              address: gdav1Forwarder,
              abi: gdav1ForwarderAbi,
              functionName: "connectPool",
              args: [poolAddress as `0x${string}`, flowAddress],
            })
            await waitForTransactionReceipt(walletClient, { hash: tx })
            didConnect = true
          }
        } catch (error) {
          console.error(
            `Error processing poolField ${poolField} for sibling flow ${flow.recipient} on parent ${flow.parentContract}:`,
            error,
          )
          // Continue to next poolField even if one fails
        }
      }

      if (didConnect) {
        nUpdated++
      }

      // Mark this flow as processed in kv so we skip it next time
      await saveOrGet(kvKey, true)
    }

    return NextResponse.json({ success: true, nUpdated })
  } catch (error: any) {
    console.error({ error })
    return new Response(error.message, { status: 500 })
  }
}
