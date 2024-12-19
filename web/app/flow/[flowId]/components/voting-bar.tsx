"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useVoting } from "@/lib/voting/voting-context"

interface Props {}

export const VotingBar = (props: Props) => {
  const { isActive, cancel, saveVotes, allocatedBps, isLoading } = useVoting()

  if (!isActive) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto flex py-4 max-sm:items-center max-sm:justify-center md:grid md:grid-cols-4">
        <Progress
          value={allocatedBps / 100}
          className="absolute inset-x-0 top-0 h-[3px] md:hidden"
        />
        <div
          className={cn(
            "flex items-center justify-center space-x-2.5 transition-opacity max-sm:hidden md:col-span-2 md:col-start-2",
            { "opacity-0": allocatedBps === 0 },
          )}
        >
          <strong className="flex min-w-10 justify-end text-sm tabular-nums">0%</strong>
          <Progress value={allocatedBps / 100} className="max-w-96" />
          <strong className="min-w-10 text-sm tabular-nums">{allocatedBps / 100}%</strong>
        </div>
        <div className="flex justify-end space-x-2.5">
          <Button variant="link" type="button" onClick={cancel} disabled={isLoading}>
            Cancel
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={saveVotes} disabled={allocatedBps !== 10000 || isLoading}>
                Save votes
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {allocatedBps < 10000 && <span>Allocate remaining {100 - allocatedBps / 100}%</span>}
              {allocatedBps > 10000 && <span>You over allocated {allocatedBps / 100 - 100}%</span>}
              {allocatedBps === 10000 && <span>Looking good!</span>}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
