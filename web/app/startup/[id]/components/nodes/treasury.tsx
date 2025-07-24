"use client"

import { useRevnetBalance } from "@/lib/revnet/hooks/use-revnet-balance"
import { getRevnetUrl } from "@/lib/revnet/revnet-lib"
import Link from "next/link"

interface Props {
  projectId: number
  chainId: number
}

export function Treasury({ projectId, chainId }: Props) {
  const { data, isLoading, error } = useRevnetBalance(projectId, chainId)

  if (error) {
    console.error("Error loading treasury balance:", error)
  }

  const participantsCount = isLoading ? " ... " : data?.participantsCount || 0

  return (
    <Link
      href={getRevnetUrl(chainId, projectId)}
      target="_blank"
      rel="noopener noreferrer"
      className="pointer-events-auto flex flex-col justify-between text-sm text-muted-foreground transition-opacity hover:opacity-80"
    >
      <div>
        <strong className="font-medium">{participantsCount}</strong> backers
      </div>
    </Link>
  )
}
