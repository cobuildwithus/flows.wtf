"use client"

import { CastCard } from "@/components/ui/cast-card"
import { TooltipPortal } from "@radix-ui/react-tooltip"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import type { ComponentProps } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

const ReactActivityCalendar = dynamic(() =>
  import("react-activity-calendar").then((mod) => mod.ActivityCalendar),
)

type Props = ComponentProps<typeof ReactActivityCalendar> & {
  updates: Record<string, ComponentProps<typeof CastCard>["cast"][]>
}

export function ActivityCalendar({ updates, ...props }: Props) {
  const { resolvedTheme } = useTheme()

  return (
    <ReactActivityCalendar
      {...props}
      colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
      renderBlock={(block, activity) => {
        const casts = updates[activity.date]
        if (!casts) return block

        return (
          <Tooltip>
            <TooltipTrigger asChild>{block}</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="scrollbar-thumb-rounded-full max-h-96 min-w-60 max-w-[100vw] space-y-2.5 overflow-y-auto rounded-xl bg-background/80 p-0 scrollbar-thin scrollbar-thumb-foreground/20 sm:max-w-96">
                {casts.map((cast) => (
                  <CastCard key={cast.hash.toString()} cast={cast} />
                ))}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        )
      }}
    />
  )
}
