"use server"

import { unstable_cache } from "next/cache"
import { juiceboxDb } from "./mock-juicebox-db"
import { base } from "viem/chains"
import type { TokenEventData } from "./types"

export type TokenPayment = TokenEventData & {
  txnValue: string
}

type RawTokenPayment = {
  txHash?: string | null
  timestamp?: number | null
  payer?: string | null
  amount?: unknown
  newlyIssuedTokenCount?: unknown
  beneficiary?: string | null
  chainId?: number | null
  memo?: string | null
  txnValue?: unknown
  project?: { erc20Symbol: string | null } | null
}

function toStringSafe(value: unknown): string {
  if (value === null || value === undefined) return "0"
  if (typeof value === "string") return value
  return (value as { toString(): string }).toString()
}

async function _getTokenPayments(projectId: number): Promise<TokenPayment[]> {
  const project = await juiceboxDb.juiceboxProject.findUniqueOrThrow({
    where: { chainId_projectId: { chainId: base.id, projectId } },
    select: { suckerGroupId: true },
  })

  if (!project.suckerGroupId) {
    return []
  }

  const payments = (await juiceboxDb.juiceboxPayEvent.findMany({
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
  })) as RawTokenPayment[]

  // Convert Decimal to string for serialization
  const serializedPayments = payments
    .filter((payment): payment is RawTokenPayment & { timestamp: number } => {
      return typeof payment?.timestamp === "number"
    })
    .map(
      (payment) =>
        ({
          txHash: payment.txHash ?? "",
          timestamp: payment.timestamp,
          payer: payment.payer ?? "",
          amount: toStringSafe(payment.amount),
          newlyIssuedTokenCount: toStringSafe(payment.newlyIssuedTokenCount),
          beneficiary: payment.beneficiary ?? "",
          chainId: payment.chainId ?? base.id,
          memo: payment.memo ?? "",
          project: payment.project ?? null,
          txnValue: toStringSafe(payment.txnValue),
        }) satisfies TokenPayment,
    )

  return serializedPayments
}

export const getTokenPayments = unstable_cache(_getTokenPayments, ["token-payments"], {
  revalidate: 60, // Cache for 60 seconds
  tags: ["token-payments"],
})
