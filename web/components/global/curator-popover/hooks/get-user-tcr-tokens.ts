"use server"

import database from "@/lib/database/edge"
import { cache } from "react"
import { getVoterDisputeVotes } from "./get-voter-dispute-votes"

export const getUserTcrTokens = cache(async (address: `0x${string}`) => {
  if (!address) return []

  const [tokens, votes] = await Promise.all([
    database.tokenHolder.findMany({
      where: { holder: address, amount: { not: "0" } },
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

  // merge tokens and votes per disputeId and arbitrator
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
          ...subgrant,
          parentArbitrator: token.flow.arbitrator,
          disputes,
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
