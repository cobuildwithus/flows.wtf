import { NextResponse } from "next/server"

import { Address } from "viem"
import { nounsFlowImplAbi } from "@/lib/abis"
import { l2Client } from "@/lib/viem/client"
import { formatEther, getAddress } from "viem"
import database from "@/lib/database/edge"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

export async function GET() {
  try {
    // Get 15 active grants ordered by last update time
    const grants = await database.grant.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        updatedAt: "asc",
      },
      take: 15,
    })

    let nUpdated = 0

    for (const grant of grants) {
      const { parentContract, recipient, isTopLevel, id } = grant

      let totalEarned = "0"
      if (!isTopLevel) {
        const total = await l2Client.readContract({
          address: getAddress(parentContract) as Address,
          abi: nounsFlowImplAbi,
          functionName: "getTotalReceivedByMember",
          args: [getAddress(recipient) as Address],
        })
        totalEarned = formatEther(total)
      }

      await database.grant.update({
        where: { id },
        data: {
          totalEarned,
        },
      })

      nUpdated++
    }

    return NextResponse.json({ success: true, nUpdated })
  } catch (error: any) {
    console.error({ error })
    return new Response(error.message, { status: 500 })
  }
}
