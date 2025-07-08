"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"
import { FLOWS_REVNET_PROJECT_ID } from "../config"

async function _getTokenPayments(projectId: number) {
  const payments = await database.juiceboxPayEvent.findMany({
    select: {
      txHash: true,
      timestamp: true,
      payer: true,
      amount: true,
      newlyIssuedTokenCount: true,
      beneficiary: true,
      chainId: true,
      memo: true,
      project: { select: { erc20Symbol: true } },
    },
    where: { projectId, newlyIssuedTokenCount: { gt: 0 } },
    orderBy: { timestamp: "desc" },
  })

  // Get associated FLOWS payments for the same transactions
  const txHashes = payments.map((p) => p.txHash)
  const flowsPayments =
    txHashes.length > 0
      ? await database.juiceboxPayEvent.findMany({
          select: {
            txHash: true,
            timestamp: true,
            payer: true,
            amount: true,
            newlyIssuedTokenCount: true,
            beneficiary: true,
            chainId: true,
            memo: true,
            project: { select: { erc20Symbol: true } },
          },
          where: {
            projectId: Number(FLOWS_REVNET_PROJECT_ID),
            txHash: { in: txHashes },
          },
          orderBy: { timestamp: "desc" },
        })
      : []

  // Create a map of txHash to FLOWS payment for easy lookup
  const flowsPaymentMap = new Map(flowsPayments.map((fp) => [fp.txHash, fp]))

  // Convert Decimal to string for serialization and merge FLOWS data
  const serializedPayments = payments.map((payment) => {
    const flowsPurchase = flowsPaymentMap.get(payment.txHash)

    return {
      ...payment,
      ethAmount: flowsPurchase ? flowsPurchase.amount.toString() : null,
      amount: payment.amount.toString(),
      newlyIssuedTokenCount: payment.newlyIssuedTokenCount.toString(),
      flowsPurchase: flowsPurchase
        ? {
            ...flowsPurchase,
            amount: flowsPurchase.amount.toString(),
            newlyIssuedTokenCount: flowsPurchase.newlyIssuedTokenCount.toString(),
          }
        : null,
    }
  })

  return serializedPayments
}

export const getTokenPayments = unstable_cache(_getTokenPayments, ["token-payments"], {
  revalidate: 60, // Cache for 60 seconds
  tags: ["token-payments"],
})
