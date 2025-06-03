"use client"

import { EthInUsd } from "@/components/global/eth-in-usd"
import { useRevnetBalance } from "@/lib/revnet/hooks/use-revnet-balance"
import { getRevnetUrl } from "@/lib/revnet/revnet-lib"
import Link from "next/link"

interface Props {
  projectId: bigint
  chainId: number
}

export function Treasury({ projectId, chainId }: Props) {
  const { data, isLoading, error } = useRevnetBalance(projectId, chainId)

  if (error) {
    console.error("Error loading treasury balance:", error)
  }

  const balance = data?.balance ? BigInt(data.balance) : BigInt(0)
  const participantsCount = isLoading ? " ... " : data?.participantsCount || 0

  return (
    <Link
      href={getRevnetUrl(chainId, Number(projectId))}
      target="_blank"
      rel="noopener noreferrer"
      className="pointer-events-auto flex flex-col justify-between text-sm text-muted-foreground transition-opacity hover:opacity-80"
    >
      <div>
        <strong className="font-medium">{participantsCount}</strong> holders
      </div>
    </Link>
  )
}
