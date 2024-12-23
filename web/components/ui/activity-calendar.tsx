"use client"

import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import { ComponentProps } from "react"

const ReactActivityCalendar = dynamic(() =>
  import("react-activity-calendar").then((mod) => mod.ActivityCalendar),
)

export function ActivityCalendar({ ...props }: ComponentProps<typeof ReactActivityCalendar>) {
  const { theme } = useTheme()

  return (
    <ReactActivityCalendar
      {...props}
      colorScheme={theme === "dark" ? "dark" : "light"}
      renderBlock={(block, activity) => block}
    />
  )
}
