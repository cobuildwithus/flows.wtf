"use client"

import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useVoting } from "@/lib/voting/voting-context"

interface Props {
  recipientId: string
}

export const VotingInput = (props: Props) => {
  const { recipientId } = props
  const { votes, updateVote, isActive, activate } = useVoting()

  const currentVote = votes.find((v) => v.recipientId === recipientId)

  if (!isActive)
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={() => activate()}>
            {(currentVote?.bps || 0) / 100}%
          </button>
        </TooltipTrigger>
        <TooltipContent>Click to edit</TooltipContent>
      </Tooltip>
    )

  return (
    <div className="relative">
      <Input
        placeholder="0"
        value={currentVote ? currentVote.bps / 100 : ""}
        onChange={(e) =>
          updateVote({
            recipientId,
            bps: parseFloat(e.target.value) * 100,
          })
        }
        min={0}
        max={100}
        type="number"
        step="1"
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500">%</span>
    </div>
  )
}
