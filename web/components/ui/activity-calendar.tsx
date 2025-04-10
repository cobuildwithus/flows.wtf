"use client"

import type { CastCard } from "@/components/ui/cast-card"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import type { ComponentProps } from "react"
import { useEffect, useRef } from "react"
import React from "react"
import pluralize from "pluralize"
import { CastColumnsDialog } from "./cast-columns-dialog"

const ReactActivityCalendar = dynamic(() =>
  import("react-activity-calendar").then((mod) => mod.ActivityCalendar),
)

type Props = ComponentProps<typeof ReactActivityCalendar> & {
  updates: Record<string, ComponentProps<typeof CastCard>["cast"][]>
}

export function ActivityCalendar({ updates, ...props }: Props) {
  const { resolvedTheme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && window.innerWidth <= 768) {
      const scrollContainer = ref.current.querySelector(
        ".react-activity-calendar__scroll-container",
      )
      if (scrollContainer) {
        scrollContainer.scrollLeft = scrollContainer.scrollWidth
      }
    }
  }, [])

  return (
    <ReactActivityCalendar
      ref={ref}
      {...props}
      colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
      renderBlock={(block, activity) => {
        const casts = updates[activity.date]
        if (!casts) return block

        return (
          <CastColumnsDialog
            trigger={block}
            title={`${new Date(activity.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${pluralize("update", casts.length)}`}
            casts={casts}
          />
        )
      }}
    />
  )
}
