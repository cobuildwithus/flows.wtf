"use client"

import Link from "next/link"
import { getRevnetUrl } from "@/lib/revnet/revnet-lib"

interface Props {
  startupTitle: string
  projectId: bigint
  chainId: number
}

export function RevnetLinkBox({ startupTitle, projectId, chainId }: Props) {
  return (
    <Link
      href={getRevnetUrl(chainId, Number(projectId))}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block rounded-lg border bg-muted/50 p-4 transition-colors hover:border-foreground/20 hover:bg-muted"
    >
      <div className="space-y-1.5">
        <p className="text-sm font-medium">{startupTitle} is a Revnet</p>
        <p className="text-xs text-muted-foreground">
          A lightweight DAO, or 'revenue network', aligning contributors to maximize growth of the
          project.
        </p>
        <p className="text-xs font-medium text-primary">Learn more →</p>
      </div>
    </Link>
  )
}
