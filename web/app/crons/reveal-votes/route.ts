import { NextResponse } from "next/server"
import database from "@/lib/database/edge"
import { getDecryptedItem } from "@/lib/kv/kvStore"
import { generateKVKey, SavedVote } from "@/lib/kv/disputeVote"
import { getRevealVotesWalletClient } from "@/lib/viem/walletClient"
import { base } from "viem/chains"
import { erc20VotesArbitratorImplAbi } from "@/lib/abis"
import { l2Client } from "@/lib/viem/client"
import { waitForTransactionReceipt } from "viem/actions"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

export async function GET() {
  try {
    const client = getRevealVotesWalletClient(base.id)

    const disputes = await database.dispute.findMany({
      where: {
        isExecuted: false,
        revealPeriodEndTime: { gt: Number(new Date().getTime() / 1000) },
        votingEndTime: { lt: Number(new Date().getTime() / 1000) },
      },
    })

    let nUpdated = 0

    for (const dispute of disputes) {
      const { arbitrator, disputeId } = dispute

      const votes = await database.disputeVote.findMany({
        where: { disputeId: dispute.disputeId, arbitrator, choice: null }, // only pull unrevealed votes
      })

      const keys = votes.map((vote) =>
        generateKVKey(arbitrator, disputeId, vote.voter, vote.commitHash),
      )

      for (const key of keys) {
        const vote = await getDecryptedItem<SavedVote>(key)

        if (!vote) {
          throw new Error("Vote not found")
        }

        // Check if vote is already revealed
        const receipt = await l2Client.readContract({
          address: arbitrator as `0x${string}`,
          abi: erc20VotesArbitratorImplAbi,
          functionName: "getReceipt",
          args: [BigInt(disputeId), vote.voter],
        })

        if (receipt.hasRevealed) {
          console.log(`Vote already revealed for dispute ${disputeId} by ${vote.voter}`)
          continue
        }

        // Get the latest nonce for the account
        const nonce = await l2Client.getTransactionCount({
          address: client.account.address,
        })

        const tx = await client.writeContract({
          address: arbitrator as `0x${string}`,
          abi: erc20VotesArbitratorImplAbi,
          functionName: "revealVote",
          args: [BigInt(disputeId), vote.voter, BigInt(vote.choice), vote.reason ?? "", vote.salt],
          nonce: nonce, // Use the latest nonce
        })

        await waitForTransactionReceipt(client, {
          hash: tx,
        })

        nUpdated++
      }
    }

    return NextResponse.json({ success: true, nUpdated })
  } catch (error: any) {
    console.error({ error })
    return new Response(error.message, { status: 500 })
  }
}
