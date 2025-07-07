"use client"

import { useState } from "react"
import { DAOInfoDialog } from "./dao-info-dialog"

interface Props {
  startupTitle: string
  projectId: bigint
  chainId: number
}

export function JoinStartupLink({ startupTitle, projectId, chainId }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <div className="flex w-full items-center justify-between gap-1 text-base">
        <div onClick={() => setIsDialogOpen(true)} className="cursor-pointer hover:underline">
          Buy in
        </div>
        <button
          type="button"
          className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="What does joining mean?"
          tabIndex={0}
          onClick={() => setIsDialogOpen(true)}
        >
          <span className="text-xs font-bold">?</span>
        </button>
      </div>

      <DAOInfoDialog
        startupTitle={startupTitle}
        projectId={projectId}
        chainId={chainId}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}
