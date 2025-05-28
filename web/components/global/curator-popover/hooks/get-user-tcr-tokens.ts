"use server"

import database from "@/lib/database/flows-db"
import { cache } from "react"
import { getVoterDisputeVotes } from "./get-voter-dispute-votes"

export const getUserTcrTokens = cache(async (address: `0x${string}`) => {
  if (!address) return []

  const [tokens, votes] = await Promise.all([
    database.tokenHolder.findMany({
      where: { holder: address },
      orderBy: { amount: "desc" },
      include: {
        flow: {
          select: {
            id: true,
            superToken: true,
            managerRewardSuperfluidPool: true,
            managerRewardPool: true,
            monthlyRewardPoolFlowRate: true,
            activeRecipientCount: true,
            awaitingRecipientCount: true,
            challengedRecipientCount: true,
            title: true,
            erc20: true,
            tokenEmitter: true,
            arbitrator: true,
            image: true,
            subgrants: { include: { disputes: true } },
          },
        },
      },
    }),
    getVoterDisputeVotes(address),
  ])

  // merge tokens and votes per disputeId and arbitrator,
  // and slim down each subgrant to only the needed fields
  const mergedTokens = tokens.map((token) => {
    const mergedSubgrants = token.flow.subgrants
      .filter((subgrant) => subgrant.challengePeriodEndsAt > token.firstPurchase)
      .map((subgrant) => {
        const disputes = subgrant.disputes.map((dispute) => {
          const disputeVotes = votes.filter(
            (vote) =>
              vote.disputeId === dispute.disputeId && vote.arbitrator === token.flow.arbitrator,
          )
          return {
            ...dispute,
            votes: disputeVotes,
          }
        })
        return {
          id: subgrant.id,
          title: subgrant.title,
          image: subgrant.image,
          challengePeriodEndsAt: subgrant.challengePeriodEndsAt,
          isResolved: subgrant.isResolved,
          isDisputed: subgrant.isDisputed,
          status: subgrant.status,
          isActive: subgrant.isActive,
          disputes,
          parentArbitrator: token.flow.arbitrator as `0x${string}`,
        }
      })

    return {
      ...token,
      flow: {
        ...token.flow,
        subgrants: mergedSubgrants,
      },
    }
  })

  return mergedTokens
})

export type ActiveCuratorGrant = Awaited<
  ReturnType<typeof getUserTcrTokens>
>[number]["flow"]["subgrants"][number]
