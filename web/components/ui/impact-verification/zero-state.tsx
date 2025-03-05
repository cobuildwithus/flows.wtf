"use client"

import type { Cast } from "@prisma/farcaster"
import { CircleX } from "lucide-react"
import { CheckUpdateButton } from "./check-update-button"

export const ZeroState = ({ cast, grantId }: { cast: Pick<Cast, "id">; grantId: string }) => {
  return (
    <div className="flex items-center gap-2 rounded-b-md border bg-muted/50 px-7 py-2">
      <CircleX className="size-4 text-gray-500/75" />
      <span className="text-xs font-medium text-muted-foreground">Not verified</span>
      <CheckUpdateButton castId={Number(cast.id)} grantId={grantId} />
    </div>
  )
}
