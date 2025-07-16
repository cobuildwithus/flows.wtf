"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { type GrowthEvent } from "@/lib/onchain-startup/growth-events"
import { GrowthEvent as GrowthEventComponent } from "./growth-event"

interface Props {
  events: GrowthEvent[]
  className?: string
}

export function AnimatedGrowthEvents({ events, className }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Cycle through events
  useEffect(() => {
    if (events.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [events.length])

  if (events.length === 0) return null

  const currentEvent = events[currentIndex]

  return (
    <div
      className={cn(
        "absolute bottom-8 left-1/2 z-30 -translate-x-1/2",
        "rounded-full bg-background/90 backdrop-blur-md",
        "border border-border/50 shadow-lg",
        "min-w-[280px] max-w-[360px] px-4 py-2.5",
        "transition-all duration-500",
        className,
      )}
    >
      <div key={currentIndex} className="duration-500 animate-in fade-in slide-in-from-bottom-2">
        <GrowthEventComponent event={currentEvent} />
      </div>
    </div>
  )
}
