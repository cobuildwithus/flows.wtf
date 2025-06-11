"use client"

import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAllocate } from "@/lib/allocation/allocation-context"

interface Props {
  recipientId: string
}

export const AllocationInput = (props: Props) => {
  const { recipientId } = props
  const { allocations, updateAllocation, isActive, activate } = useAllocate()

  const currentAllocation = allocations.find((a) => a.recipientId === recipientId)

  if (!isActive)
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={() => activate()}>
            {(currentAllocation?.bps || 0) / 100}%
          </button>
        </TooltipTrigger>
        <TooltipContent>Click to edit</TooltipContent>
      </Tooltip>
    )

  return (
    <div className="relative">
      <Input
        placeholder="0"
        value={currentAllocation ? currentAllocation.bps / 100 : ""}
        onChange={(e) =>
          updateAllocation({
            recipientId,
            bps: Number.parseFloat(e.target.value) * 100,
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
