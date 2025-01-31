"use client"

import type { ReactNode } from "react"

interface CommandSectionProps {
  title: string
  children?: ReactNode
}

export function CommandSection({ title, children }: CommandSectionProps) {
  return (
    <div className="py-2">
      <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

interface CommandItemProps {
  icon: ReactNode
  text: string
}

export function CommandItem({ icon, text }: CommandItemProps) {
  return (
    <div className="relative flex select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <span className="ellipsis line-clamp-1">{text}</span>
      </div>
    </div>
  )
}
