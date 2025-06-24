"use client"

import { useState } from "react"
import { useRevnetTokenDetails } from "@/lib/revnet/hooks/use-revnet-token-details"
import NumberFlow from "@number-flow/react"
import { DAOInfoDialog } from "./dao-info-dialog"

interface Props {
  startupTitle: string
  projectId: bigint
  chainId: number
  tokenAmount: number
}

export function TokenDAOLink({ startupTitle, projectId, chainId, tokenAmount }: Props) {
  const { data: tokenDetails, isLoading } = useRevnetTokenDetails(projectId, chainId)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (isLoading) {
    return "..."
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-1 text-base">
        <div onClick={() => setIsDialogOpen(true)} className="cursor-pointer">
          <NumberFlow
            value={tokenAmount}
            format={{
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }}
            locales="en-US"
          />{" "}
          {tokenDetails?.symbol}
        </div>
        <button
          type="button"
          className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="What are DAO tokens?"
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
