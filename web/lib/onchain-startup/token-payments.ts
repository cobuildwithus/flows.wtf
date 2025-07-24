"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"
import { base } from "viem/chains"

async function _getTokenPayments(projectId: number) {
  const project = await database.juiceboxProject.findUniqueOrThrow({
    where: { chainId_projectId: { chainId: base.id, projectId } },
    select: { suckerGroupId: true },
  })

  if (!project.suckerGroupId) {
    return []
  }

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
      txnValue: true,
      project: { select: { erc20Symbol: true } },
    },
    where: { suckerGroupId: project.suckerGroupId, newlyIssuedTokenCount: { gt: 0 } },
    orderBy: { timestamp: "desc" },
  })

  // Convert Decimal to string for serialization
  const serializedPayments = payments.map((payment) => {
    return {
      ...payment,
      txnValue: payment.txnValue.toString(),
      amount: payment.amount.toString(),
      newlyIssuedTokenCount: payment.newlyIssuedTokenCount.toString(),
    }
  })

  return serializedPayments
}

export type TokenPayment = Awaited<ReturnType<typeof _getTokenPayments>>[0]

export const getTokenPayments = unstable_cache(_getTokenPayments, ["token-payments"], {
  revalidate: 60, // Cache for 60 seconds
  tags: ["token-payments"],
})
